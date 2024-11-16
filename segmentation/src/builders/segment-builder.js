import { Worker } from 'worker_threads';
import MDBM from "../utils/mongo.js";
import MYDBM from "../utils/mysql.js";
import EM from "../utils/entity.js";
import SegmentQueueStatus from '../enums/segment-queue-status.js';

export default class SegmentBuilder {

    constructor() {

        this.retailerPerBatch = 1000;                
        this.activeWorkers = 0;
        this.batchQueue = [];
        this.maxThread = 10;
        this.chunkSize = 5;
        this.currentOffset = 0;        
        this.segmentRules = [];

        this.models = {};
        this.segmentId = null;
        this.builderStatus = null;
        this.queueItem = null;

    }

    init = async () => {

        try {

            await MDBM.connect();
            await MYDBM.connect(false);

            const modelNames = ["cms_master_order", "cms_segment_rule", "cms_segment", "cms_segment_queue", 
                "cms_master_retailer", "cms_segment_retailer", "cms_segment_blacklisted_retailer", 
                "cms_segment_whitelisted_retailer", "cms_segment_builder_status", "cms_segment_retailer_buffer"];

            for (const name of modelNames) {
                this.models[name] = await EM.getModel(name);
            }          

        } catch (e) {
            console.error("Error during initialization:", e);
            throw e;
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
            workerData: { batch, retailers, chunkSize: this.chunkSize, segmentId: this.segmentId }
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
            await this.init();    
            this.segmentId = _segmentId;

            this.queueItem = await this.models.cms_segment_queue.findOne({
                segment: this.segmentId,
                queueStatus: SegmentQueueStatus.BUILDING,
            }).lean();

            const segment = await this.models.cms_segment.findById(_segmentId).lean();
    
            if (segment) {
                this.segmentRules = await this.models.cms_segment_rule.find({ segment: segment._id }).lean();
                const retailerCount = await this.models.cms_master_retailer.countDocuments({});
                const totalBatches = Math.ceil(retailerCount / this.retailerPerBatch);
    
                console.log("Reatiler Count : "+ retailerCount);
                console.log("Total Batches : "+ totalBatches);

                this.builderStatus = await this.models.cms_segment_builder_status.findOne({ segment: segment._id }).lean();
                if (!this.builderStatus) {
                    this.builderStatus = await new this.models.cms_segment_builder_status({
                        totalBatch: totalBatches,
                        currentBatch: 0,
                        recordPerBatch: this.retailerPerBatch,
                        totalRecord: retailerCount,
                        completedBatch: 0,
                        pendingBatch: totalBatches,
                        status: false,
                        startTime: new Date(),
                        endTime: null,
                        segment: segment._id
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
                await this.updateSegmentRetailer();
    
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

            const recordsToMove = await this.models.cms_segment_retailer_buffer.find({ segment: this.segmentId }).lean();            

            if (recordsToMove.length > 0) {                
                await this.models.cms_segment_retailer.deleteMany({ segment: this.segmentId });
                await this.models.cms_segment_retailer.insertMany(recordsToMove);
                await this.models.cms_segment_retailer_buffer.deleteMany({ segment: this.segmentId });
            }

        } catch (e) {
            console.log(e);
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
                        _endTime,
                        elapsedTime,
                        status: false,
                        lastBuild: new Date()
                    }
                );            
            }            

            /* Update the queue status */
            if (this.queueItem) {
                await this.models.cms_segment_queue.findByIdAndUpdate(
                    this.queueItem._id,                    
                    { queueStatus: SegmentQueueStatus.COMPLETED }
                );  
            } else {
                await this.models.cms_segment_queue.findOneAndUpdate(
                    { segment: this.segmentId, queueStatus: SegmentQueueStatus.BUILDING },
                    { queueStatus: SegmentQueueStatus.COMPLETED }
                ); 
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