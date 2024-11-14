import { Worker } from 'worker_threads';
import MDBM from "../utils/mongo.js";
import MYDBM from "../utils/mysql.js";
import EM from "../utils/entity.js";
import ImportType from '../enums/importer-type.js';

export default class OrderImporter {

    constructor() {

        this.ordersPerBatch = 1000;
        this.orderIdsPerBatch = 25000;
        this.orderCountQuery = `select COUNT(o.OrderId) as Count from orders o`;
        this.orderIdLoadQuery = `SELECT OrderId FROM orders ORDER BY OrderId LIMIT ? OFFSET ?`;

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
                this.ordersPerBatch = batchOption.records_per_batch;
                this.orderIdsPerBatch = batchOption.record_ids_per_batch;
                this.maxThread = batchOption.max_thread;
                this.chunkSize = batchOption.chunk_size;
            }

        } catch (e) {
            console.error("Error during initialization:", e);
            throw e;
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

    startWorker = (batch, orderIds) => {

        this.activeWorkers++;
    
        const worker = new Worker('./src/workers/orders-import.js', {
            workerData: { batch, orderIds, chunkSize: this.chunkSize }
        });

        worker.once('exit', (code) => { 

            if (code !== 0) {
                console.error(`Worker stopped with exit code ${code}`);
            }

            this.activeWorkers--; 
            this.startNextWorker();

        }); 

    };

    startNextWorker = () => {

        if (this.shouldPause || this.batchQueue.length === 0 || this.activeWorkers >= this.maxThread) {
            return;
        }

        const { index, oIds } = this.batchQueue.shift();
        this.startWorker(index, oIds);

    };

    loadOrderIds = async (batchCount) => {

        while (this.currentOffset < batchCount * this.ordersPerBatch && !this.shouldPause) {

            const orderIds = await MYDBM.queryWithConditions(
                this.orderIdLoadQuery,
                [this.orderIdsPerBatch, this.currentOffset]
            );
            
            if (orderIds.length === 0) break;

            for (let i = 0; i < orderIds.length; i += this.ordersPerBatch) {

                const chunk = orderIds.slice(i, i + this.ordersPerBatch).map(row => row.OrderId);
                this.batchQueue.push({ index: this.currentOffset / this.ordersPerBatch + 1, oIds: chunk });
                this.currentOffset += this.ordersPerBatch;
               
                if (this.batchQueue.length >= 100) await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        this.loadComplete = true;

    };

    start = async () => {

        try {

            await this.init();
            this.shouldPause = false;
            const orders = await MYDBM.query(this.orderCountQuery);

            if (Array.isArray(orders) && orders.length === 1) {

                const orderCount = parseInt(orders[0]["Count"]);
                /* Adjust orderIdsPerBatch value, incase the order count is less then batch count */
                this.orderIdsPerBatch = Math.min(this.orderIdsPerBatch, orderCount);

                const batchCount = Math.ceil(orderCount / this.ordersPerBatch);    
    
                const batchProgressModel = await EM.getModel("cms_importer_task_status");
                let orderBatch = await batchProgressModel.findOne({ type: ImportType.ORDER_IMPORTER }).lean();
    
                if (!orderBatch) {
                    orderBatch = new batchProgressModel({
                        totalBatch: batchCount,
                        currentBatch: 0,
                        recordPerBatch: this.ordersPerBatch,
                        totalRecord: orderCount,
                        completedBatch: 0,
                        pendingBatch: batchCount,
                        status: false,
                        startTime: new Date(),
                        endTime: null,
                        succeed: 0,
                        failed: 0,
                        type: ImportType.ORDER_IMPORTER
                    });
                    orderBatch = await orderBatch.save();
                    orderBatch = orderBatch.toObject();
                }
    
                if (!orderBatch.status) {
                    orderBatch = await batchProgressModel.findByIdAndUpdate(
                        orderBatch._id, 
                        { 
                            totalBatch: batchCount, 
                            totalRecord: orderCount, 
                            startTime: new Date(), 
                            endTime: null, 
                            status: true 
                        }, 
                        { new: true }
                    );                    
                } else {
                    return null;
                }

                let currentBatch = orderBatch.completedBatch || 0;
                this.currentOffset = currentBatch * this.ordersPerBatch;

                this.loadComplete = false;
                this.loadOrderIds(batchCount);

                while ((!this.loadComplete || this.batchQueue.length > 0 || this.activeWorkers > 0) && !this.shouldPause) {
                    while (this.batchQueue.length > 0 && this.activeWorkers < this.maxThread && !this.shouldPause) {
                        this.startNextWorker();
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }   
            
                /* If the shouldPause is true then the update batch progress will happens at stop method */
                if (!this.shouldPause) {                

                    const _endTime = new Date();
                    const elapsed = this.calculateElapsedTime(orderBatch.startTime, _endTime);  
                    await batchProgressModel.findByIdAndUpdate(orderBatch._id, {
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
            /* If the shouldPause is true then the cleanup will happens at stop method */
            if (!this.shouldPause) {
                await this.cleanup();   
            }                 
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

            const batchProgressModel = await EM.getModel("cms_importer_task_status");
            const orderBatch = await batchProgressModel.findOne({ type: ImportType.ORDER_IMPORTER }).lean();

            if (this.batchQueue.length == 0) {

                const _endTime = new Date();
                const elapsed = this.calculateElapsedTime(orderBatch.startTime, _endTime);  
                await batchProgressModel.findByIdAndUpdate(orderBatch._id, {
                    endTime: _endTime,
                    elapsedTime: elapsed,
                    status: false
                });

            } else {
                await batchProgressModel.findByIdAndUpdate(orderBatch._id, {                        
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