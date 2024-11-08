import { Worker } from 'worker_threads';
import MYDBM from "../utils/mysql.js";
import EM from "../utils/entity.js";
import ImportType from '../enums/importer-type.js';

export default class StoreImporter {

    constructor() {

        this.storesPerBatch = 1000;
        this.storeIdsPerBatch = 25000;
        this.storeCountQuery = `select COUNT(StoreId) as Count from stores`;
        this.storeIdLoadQuery = `SELECT StoreId FROM stores ORDER BY StoreId LIMIT ? OFFSET ?`;

        this.activeWorkers = 0;
        this.batchQueue = [];
        this.maxThread = 20;
        this.currentOffset = 0;
        this.loadComplete = false;
        this.shouldPause = false;

    }

    startWorker = (batch, storeIds) => {

        this.activeWorkers++;
    
        const worker = new Worker('./src/workers/stores-import.js', {
            workerData: { batch, storeIds }
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
        if (this.shouldPause 
            || (this.batchQueue.length === 0) 
            || (this.activeWorkers >= this.maxThread) 
            || (this.loadComplete && this.batchQueue.length === 0)) {
            return; 
        }
    
        const { index, sIds } = this.batchQueue.shift();
        console.log(`Starting worker for batch no: ${index}`);
        this.startWorker(index, sIds);
    };

    loadStoreIds = async (batchCount) => {

        console.log(this.currentOffset +" < "+ (batchCount * this.storesPerBatch));

        while (this.currentOffset < (batchCount * this.storesPerBatch) && !this.shouldPause) {

            const retailerIds = await MYDBM.queryWithConditions(
                this.storeIdLoadQuery,
                [this.storeIdsPerBatch, this.currentOffset]
            );

            if (retailerIds.length === 0) break;

            for (let i = 0; i < retailerIds.length; i += this.storesPerBatch) {

                const chunk = retailerIds.slice(i, i + this.storesPerBatch).map(row => row.StoreId);
                this.batchQueue.push({ index: this.currentOffset / this.storesPerBatch + 1, sIds: chunk });
                this.currentOffset += this.storesPerBatch;
               
                if (this.batchQueue.length >= 100) await new Promise(resolve => setTimeout(resolve, 100));

            }

        }

        this.loadComplete = true;

    };

    start = async () => {

        try {

            const retailers = await MYDBM.query(this.storeCountQuery);

            if (Array.isArray(retailers) && retailers.length === 1) {

                const retailerCount = parseInt(retailers[0]["Count"]);
                /* Adjust orderIdsPerBatch value, incase the order count is less then batch count */
                this.storeIdsPerBatch = Math.min(this.storeIdsPerBatch, retailerCount);
                const batchCount = Math.ceil(retailerCount / this.storesPerBatch);    
    
                const batchProgressModel = await EM.getModel("cms_background_task_progress");
                let storeBatch = await batchProgressModel.findOne({ type: ImportType.STORE_IMPORTER }).lean();
    
                if (!storeBatch) {
                    storeBatch = new batchProgressModel({
                        totalBatch: batchCount,
                        currentBatch: 0,
                        recordPerBatch: this.storesPerBatch,
                        totalRecord: retailerCount,
                        completedBatch: 0,
                        pendingBatch: batchCount,
                        status: false,
                        startTime: new Date(),
                        endTime: null,
                        succeed: 0,
                        failed: 0,
                        type: ImportType.STORE_IMPORTER
                    });
                    storeBatch = await storeBatch.save();
                    storeBatch = storeBatch.toObject();
                }
    
                if (!storeBatch.status) {
                    await batchProgressModel.findByIdAndUpdate(storeBatch._id, { startTime: new Date(), endTime: null, status: true });
                } else {
                    console.log("Store importer is already running");
                    return null;
                }

                let currentBatch = storeBatch.completedBatch || 0;
                this.currentOffset = currentBatch * this.storesPerBatch;

                this.loadComplete = false;
                this.loadStoreIds(batchCount);
                
                while ((!this.loadComplete || this.batchQueue.length > 0 || this.activeWorkers > 0) && !this.shouldPause) {
                    while (this.batchQueue.length > 0 && this.activeWorkers < this.maxThread && !this.shouldPause) {
                        this.startNextWorker();
                    }
                    await new Promise(resolve => setTimeout(resolve, 100));
                }   
                
                if (this.shouldPause) {
                    await batchProgressModel.findByIdAndUpdate(storeBatch._id, {
                        currentBatch: currentBatch + this.batchQueue.length,
                        pendingBatch: batchCount - (currentBatch + this.batchQueue.length),
                        status: false
                    });
                } else {
                    await batchProgressModel.findByIdAndUpdate(storeBatch._id, {
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