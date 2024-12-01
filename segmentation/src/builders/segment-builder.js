import { Worker } from 'worker_threads';
import MDBM from "../utils/mongo.js";
import MYDBM from "../utils/mysql.js";
import EM from "../utils/entity.js";
import SegmentQueueStatus from '../enums/segment-queue-status.js';
import mongoose from 'mongoose';
import SegmentStatus from '../enums/segment-status.js';
import SegmentGeography from '../enums/segment-geography.js';
import SegmentRetailerStatus from '../enums/segment-retailer-status.js';
import SegmentStoreStatus from '../enums/segment-store-status.js';

export default class SegmentBuilder {

    constructor() {

        this.retailerPerBatch = 1000;                
        this.activeWorkers = 0;
        this.batchQueue = [];
        this.maxThread = 10;
        this.chunkSize = 100;
        this.currentOffset = 0;        
        this.segmentRules = [];

        this.models = {};
        this.segmentId = null;
        this.builderStatus = null;
        this.queueItem = null;
        this.isOpen = false;

    }

    init = async () => {

        try {

            await MDBM.connect();
            await MYDBM.connect(false);

            const modelNames = ["cms_master_order", "cms_segment", "cms_segment_rule", "cms_segment_queue", 
                "cms_master_retailer", "cms_segment_retailer", "cms_segment_blacklisted_retailer", 
                "cms_segment_whitelisted_retailer", "cms_segment_builder_status", "cms_segment_retailer_buffer",
                "cms_segment_build_log", "cms_segment_batch_options", "cms_segment_retailer_summary",
                "cms_segment_retailer_rules_summary"
            ];

            this.models = Object.fromEntries(
                await Promise.all(
                    modelNames.map(async name => [name, await EM.getModel(name)])
                )
            );     
            
            try {
                /* Update the batch options */            
                const batchOption = await this.models.cms_segment_batch_options.findOne({segment: this.segmentId}).lean();
                if (batchOption) {
                    this.retailerPerBatch = batchOption.recordsPerBatch;                
                    this.maxThread = batchOption.maxThread;
                    this.chunkSize = batchOption.chunkSize;
                }
            } catch(_e) {
                console.log(_e);
            }

        } catch (e) {
            console.error("Error during initialization:", e);
            throw e;
        }

    };

    isOpenSegment = (_segment) => {
        
        if (_segment.fromDate || _segment.toDate) {
            return false;
        }
    
        if (
            (_segment.geography === SegmentGeography.STATE && Array.isArray(_segment.states) && _segment.states.length > 0) ||
            (_segment.geography === SegmentGeography.REGION && Array.isArray(_segment.regions) && _segment.regions.length > 0)
        ) {
            return false;
        }
    
        if ((Array.isArray(_segment.orderStatus) && _segment.orderStatus.length > 0) || 
            (Array.isArray(_segment.excludedStores) && _segment.excludedStores.length > 0)) {
            return false;
        }
    
        if (_segment.retailerStatus === SegmentRetailerStatus.AUTHORIZED || 
            _segment.storeStatus === SegmentStoreStatus.AUTHORIZED) {
            return false;
        }
    
        return true;
        
    };

    clearSegmentSummary = async () => { 

        await this.models.cms_segment_retailer_summary.deleteMany({segment: this.segmentId});
        if (this.segmentRules) {
            for (let i = 0; i < this.segmentRules.length; i++) {
                await this.models.cms_segment_retailer_rules_summary.deleteMany({segmentRule: this.segmentRules[i]._id});
            }                
        }         

    };

    cleanup = async () => {
        try {
            if (MDBM.isConnected()) await MDBM.close();
            if (MYDBM.isConnected()) await MYDBM.close();
        } catch (closeError) {
            console.error("Error during cleanup:", closeError);
        }
    };

    startWorker = (batch, retailers) => {    
        
        this.activeWorkers++;

        const worker = new Worker('./src/workers/segment-builder.js', {
            workerData: { batch, retailers, chunkSize: this.chunkSize, segmentId: this.segmentId, isOpen: this.isOpen }
        });

        worker.once('exit', (code) => {
            if (code !== 0) {
                console.error(`Worker stopped with exit code ${code}`);
            }
            this.activeWorkers--;
            this.startNextWorker();
        });

        worker.once('error', (error) => {
            console.error(`Worker for batch ${batch} encountered an error:`, error);
            this.activeWorkers--;
            this.startNextWorker();
        });

    };

    startNextWorker = () => {

        if (this.batchQueue.length === 0 || this.activeWorkers >= this.maxThread) {
            return;
        }

        const { index, retailers } = this.batchQueue.shift();
        this.startWorker(index, retailers);

    };

    start = async (_segmentId) => {        

        try {
                
            this.segmentId = _segmentId;
            await this.init();

            this.queueItem = await this.models.cms_segment_queue.findOne({
                segment: this.segmentId,
                queueStatus: SegmentQueueStatus.BUILDING,
            }).lean();            

            const segment = await this.models.cms_segment.findById(_segmentId).lean();
    
            if (segment) {

                this.isOpen = this.isOpenSegment(segment);
                this.segmentRules = await this.models.cms_segment_rule.find({ segment: segment._id }).lean();

                /* Clear the summary if alreday there */
                await this.clearSegmentSummary();

                const retailerCount = await this.models.cms_master_retailer.countDocuments({});
                const totalBatches = Math.ceil(retailerCount / this.retailerPerBatch);    

                this.builderStatus = await this.models.cms_segment_builder_status.findOne({ segment: segment._id }).lean();
                if (!this.builderStatus) {
                    this.builderStatus = await new this.models.cms_segment_builder_status({
                        totalBatch: totalBatches,
                        currentBatch: 0,
                        recordsPerBatch: this.retailerPerBatch,
                        totalRecord: retailerCount,
                        completedBatch: 0,
                        pendingBatch: totalBatches,
                        status: false,
                        startTime: new Date(),
                        endTime: null,
                        segment: segment._id,
                        elapsedTime: null
                    }).save();
                }
    
                if (!this.builderStatus.status) {

                    this.builderStatus = await this.models.cms_segment_builder_status.findByIdAndUpdate(
                        this.builderStatus._id,
                        { 
                            totalBatch: totalBatches,
                            startTime: new Date(),
                            endTime: null, 
                            status: true,
                            currentBatch: 0,
                            completedBatch: 0,
                            totalRecord: retailerCount,
                            pendingBatch: totalBatches,
                            elapsedTime: null
                        }, 
                        { new: true }
                    );

                } else {
                    console.log(`Builder is already running for segment ${_segmentId}`);
                    return null;
                }
    
                // Load all batches into the queue
                for (let i = 0; i < totalBatches; i++) {
                    const chunk = await this.models.cms_master_retailer.find({})
                        .skip(i * this.retailerPerBatch)
                        .limit(this.retailerPerBatch)
                        .lean();
    
                    const updatedChunk = chunk.map(doc => ({ ...doc, _id: doc._id.toString() }));
                    this.batchQueue.push({ index: i, retailers: updatedChunk });
                }
    
                // Process batches
                while (this.batchQueue.length > 0 || this.activeWorkers > 0) {                    
                    while (this.batchQueue.length > 0 && this.activeWorkers < this.maxThread) {
                        this.startNextWorker();
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }

                console.log("All batches are completed");

                /* OK, now it's time to move it from buffer to segment-retailer collection */                
                try {
                    await this.updateSegmentRetailer();
                } catch (error) {
                    console.error("Critical error in updateSegmentRetailer:", error);
                    throw error; 
                }
    
            } else {
                console.log(`${_segmentId} segment not found`);
            }
    
        } catch (e) {
            console.error("Error in start method:", e);
        } finally {            
            
            try {
                const endTime = new Date();
                await this.updateBuildStatus(endTime);
                await this.cleanup();
            } catch (e) {
                console.log("Error in cleanup or status update:", e);
            }
        }
        
    };

    updateSegmentRetailer = async () => {

        try {
            
            const blackListedRetailers = await this.models.cms_segment_blacklisted_retailer
                .find({ segment: this.segmentId })
                .select("retailer")
                .lean();

            const blacklistedIds = blackListedRetailers.map(item => new mongoose.Types.ObjectId(item.retailer));
    
            const recordsToMove = await this.models.cms_segment_retailer_buffer
                .find({
                    segment: this.segmentId,
                    retailer: { $nin: blacklistedIds }
                })
                .lean();
    
            if (recordsToMove.length > 0) {                                 
                await this.models.cms_segment_retailer.deleteMany({ segment: this.segmentId });
                await this.models.cms_segment_retailer.insertMany(recordsToMove);
                await this.models.cms_segment_retailer_buffer.deleteMany({ segment: this.segmentId });
            }

        } catch (e) {
            console.error("Error in updateSegmentRetailer:", e);
        }

    };   

    updateBuildStatus = async (_endTime) => {  
        
        try {

            /* Update the build status */

            if (this.builderStatus) {

                const elapsedTime = this.calculateElapsedTime(this.builderStatus.startTime, _endTime);            
                await this.models.cms_segment_builder_status.findByIdAndUpdate(
                    this.builderStatus._id,
                    {
                        endTime: _endTime,
                        elapsedTime,
                        status: false,
                        lastBuild: new Date()
                    }
                );            

                /* Add to logs */

                await new this.models.cms_segment_build_log({
                    totalRecord: this.builderStatus.totalRecord,
                    startTime: this.builderStatus.startTime,
                    endTime: _endTime,
                    elapsedTime: elapsedTime,
                    recordsPerBatch: this.builderStatus.recordsPerBatch,                    
                    maxThread: this.maxThread,
                    chunkSize: this.chunkSize,
                    segment: this.segmentId
                }).save();

                /* Update the segment collection */
                await this.models.cms_segment.findByIdAndUpdate(
                    this.segmentId,
                    { segmentStatus: SegmentStatus.READY }
                );

            }            

            /* Update the queue status */
            if (this.queueItem) {
                await this.models.cms_segment_queue.deleteOne({ _id: this.queueItem._id });                 
            } else {
                await this.models.cms_segment_queue.deleteOne({ segment: this.segmentId, queueStatus: SegmentQueueStatus.BUILDING });                                 
            } 

        } catch (e) {
            console.log(e);
        }

    };

    calculateElapsedTime = (_startTime, _endTime) => {

        const elapsedMilliseconds = _endTime - new Date(_startTime);

        const hours = Math.floor(elapsedMilliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((elapsedMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsedMilliseconds % (1000 * 60)) / 1000);
        const milliseconds = elapsedMilliseconds % 1000;

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;

    };

}