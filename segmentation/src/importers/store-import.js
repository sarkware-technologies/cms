import { Worker } from 'worker_threads';
import MYDBM from "../utils/mysql.js";
import MDBM from "../utils/mongo.js";
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
        this.chunkSize = 100;
        this.currentOffset = 0;
        this.loadComplete = false;
        this.shouldPause = false;

    }

    init = async () => {
        try {

            await MDBM.connect();
            await MYDBM.connect(false);

            const batchOptionModel = await EM.getModel("cms_batch_options");
            const batchOption = await batchOptionModel.findOne({batch_type: ImportType.ORDER_IMPORTER}).lean();
            if (batchOption) {
                this.storesPerBatch = batchOption.records_per_batch;
                this.storeIdsPerBatch = batchOption.record_ids_per_batch;
                this.maxThread = batchOption.max_thread;
                this.chunkSize = batchOption.chunk_size;
            }

        } catch (e) {
            console.log(e);
        }
    };

    cleanup = async() => {
        try {
            if (MDBM.isConnected()) {
                await MDBM.close();
            }
            if (MYDBM.isConnected()) {
                await MYDBM.close();
            }
        } catch (closeError) {
            console.error("Error during cleanup:", closeError);
        }
    };

    startWorker = (batch, storeIds) => {

        this.activeWorkers++;
    
        const worker = new Worker('./src/workers/stores-import.js', {
            workerData: { batch, storeIds, chunkSize: this.chunkSize }
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

            await this.init();
            this.shouldPause = false;
            const stores = await MYDBM.query(this.storeCountQuery);

            if (Array.isArray(stores) && stores.length === 1) {

                const storeCount = parseInt(stores[0]["Count"]);
                /* Adjust orderIdsPerBatch value, incase the order count is less then batch count */
                this.storeIdsPerBatch = Math.min(this.storeIdsPerBatch, storeCount);
                const batchCount = Math.ceil(storeCount / this.storesPerBatch);    
    
                const batchProgressModel = await EM.getModel("cms_background_task_progress");
                let storeBatch = await batchProgressModel.findOne({ type: ImportType.STORE_IMPORTER }).lean();
    
                if (!storeBatch) {
                    storeBatch = new batchProgressModel({
                        totalBatch: batchCount,
                        currentBatch: 0,
                        recordPerBatch: this.storesPerBatch,
                        totalRecord: storeCount,
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
                    await batchProgressModel.findByIdAndUpdate(storeBatch._id, { totalBatch: batchCount, startTime: new Date(), endTime: null, status: true });
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
                        status: false
                    });
                } else {

                    const _endTime = new Date();
                    const elapsed = this.calculateElapsedTime(storeBatch.startTime, _endTime);  
                    await batchProgressModel.findByIdAndUpdate(storeBatch._id, {
                        endTime: _endTime,
                        elapsedTime: elapsed,
                        status: false
                    });

                }
    
                console.log("All batches processed successfully.");
            }

        } catch (e) {
            console.log("Error in doOrderImport:", e);
        } finally {
            await this.cleanup();                    
        }

    }

    stop = async () => {

        console.log("Pausing processing...");
        this.shouldPause = true;

        /* Wait until all active workers finish processing */
        while (this.activeWorkers > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        try {

            const batchProgressModel = await EM.getModel("cms_background_task_progress");
            const storeBatch = await batchProgressModel.findOne({ type: ImportType.STORE_IMPORTER }).lean();

            if (this.batchQueue.length == 0) {

                const _endTime = new Date();
                const elapsed = this.calculateElapsedTime(storeBatch.startTime, _endTime);  
                await batchProgressModel.findByIdAndUpdate(storeBatch._id, {
                    endTime: _endTime,
                    elapsedTime: elapsed,
                    status: false
                });

            } else {
                await batchProgressModel.findByIdAndUpdate(storeBatch._id, {                        
                    status: false
                });
            }
            
        } catch (e) {
            console.log(e);
        } finally {
            await this.cleanup();    
        }

        console.log("All active workers finished. Batch progress has been updated.");  

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