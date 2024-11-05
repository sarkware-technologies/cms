import { Worker } from 'worker_threads';
import MYDBM from "../utils/mysql.js";
import EM from "../utils/entity.js";
import ImportType from '../enums/importer-type.js';

export default class RetailersImporter {

    constructor() {

        this.retailerPerBatch = 1000;
        this.retailerIdsPerBatch = 25000;
        this.retailerCountQuery = `select COUNT(RetailerId) as Count from retailers`;
        this.retailerIdLoadQuery = `SELECT RetailerId FROM retailers ORDER BY RetailerId LIMIT ? OFFSET ?`;

        this.activeWorkers = 0;
        this.batchQueue = [];
        this.maxThread = 20;
        this.currentOffset = 0;
        this.loadComplete = false;
        this.shouldPause = false;

    }

    startWorker = (batch, retailerIds) => {

        this.activeWorkers++;
    
        const worker = new Worker('./src/workers/retailers-importer.js', {
            workerData: { batch, retailerIds }
        });

        worker.once('exit', (code) => { 

            if (code !== 0) {
                console.error(`Worker stopped with exit code ${code} for batch ${batch}`);
            }

            this.activeWorkers--; 
            this.startNextWorker();

        }); 

    };

    startNextWorker = () => {

        if (this.shouldPause || this.batchQueue.length === 0 || this.activeWorkers >= this.maxThread) {
            return;
        }

        const { index, rIds } = this.batchQueue.shift();
        this.startWorker(index, rIds);

    };

    loadRetailerIds = async (batchCount) => {

        while (this.currentOffset < batchCount * this.retailerPerBatch && !this.shouldPause) {

            const retailerIds = await MYDBM.queryWithConditions(
                this.retailerIdLoadQuery,
                [this.retailerIdsPerBatch, this.currentOffset]
            );
            
            if (retailerIds.length === 0) break;

            for (let i = 0; i < retailerIds.length; i += this.retailerPerBatch) {

                const chunk = retailerIds.slice(i, i + this.retailerPerBatch).map(row => row.OrderId);
                this.batchQueue.push({ index: this.currentOffset / this.retailerPerBatch + 1, oIds: chunk });
                this.currentOffset += this.retailerPerBatch;
               
                if (this.batchQueue.length >= 100) await new Promise(resolve => setTimeout(resolve, 100));

            }
        }

        this.loadComplete = true;

    };

    start = async () => {

        try {

            const retailers = await MYDBM.query(this.retailerCountQuery);

            if (Array.isArray(retailers) && retailers.length === 1) {

                const retailerCount = parseInt(retailers[0]["Count"]);
                const batchCount = Math.ceil(retailerCount / this.retailerPerBatch);    
    
                const batchProgressModel = await EM.getModel("cms_background_task_progress");
                let retailerBatch = await batchProgressModel.findOne({ type: ImportType.RETAILER_IMPORTER }).lean();
    
                if (!retailerBatch) {
                    retailerBatch = new batchProgressModel({
                        totalBatch: batchCount,
                        currentBatch: 0,
                        recordPerBatch: this.retailerPerBatch,
                        totalRecord: retailerCount,
                        completedBatch: 0,
                        pendingBatch: batchCount,
                        status: false,
                        startTime: new Date(),
                        endTime: null,
                        succeed: 0,
                        failed: 0,
                        type: ImportType.RETAILER_IMPORTER
                    });
                    retailerBatch = await retailerBatch.save();
                    retailerBatch = retailerBatch.toObject();
                }
    
                if (!retailerBatch.status) {
                    await batchProgressModel.findByIdAndUpdate(retailerBatch._id, { startTime: new Date(), endTime: null, status: true });
                } else {
                    return null;
                }

                let currentBatch = retailerBatch.completedBatch || 0;
                this.currentOffset = currentBatch * this.orderPerBatch;

                this.loadComplete = false;
                this.loadRetailerIds(batchCount);

                while ((!this.loadComplete || this.batchQueue.length > 0 || this.activeWorkers > 0) && !this.shouldPause) {
                    while (this.batchQueue.length > 0 && this.activeWorkers < this.maxThread && !this.shouldPause) {
                        this.startNextWorker();
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }   
                
                if (this.shouldPause) {
                    await batchProgressModel.findByIdAndUpdate(retailerBatch._id, {
                        currentBatch: currentBatch + this.batchQueue.length,
                        pendingBatch: batchCount - (currentBatch + this.batchQueue.length),
                        status: false
                    });
                } else {
                    await batchProgressModel.findByIdAndUpdate(retailerBatch._id, {
                        endTime: new Date(),
                        status: false
                    });
                }
    
                console.log("All batches processed successfully.");
            }

        } catch (e) {
            console.log("Error in doOrderImport:", e);
        }

    }

    stop = async () => {

        console.log("Pausing processing...");
        this.shouldPause = true;

        /* Wait until all active workers finish processing */
        while (this.activeWorkers > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

    };

}