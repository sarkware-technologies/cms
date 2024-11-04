import { Worker } from 'worker_threads';
import MYDBM from "./mysql.js";
import EM from "./entity.js";

class OrderImporter {

    constructor() {

        if (!OrderImporter.instance) {
            OrderImporter.instance = this;
            this.orderPerBatch = 1000;
            this.orderIdsLoadBatch = 25000;
            this.orderCountQuery = `select COUNT(o.OrderId) as Count from orders o`;
            this.orderIdLoadQuery = `SELECT OrderId FROM orders ORDER BY OrderId LIMIT ? OFFSET ?`;
            this.activeWorkers = 0;
            this.batchQueue = [];
            this.maxThread = 20;
            this.currentOffset = 0;  // Offset for loading more OrderIds
            this.loadComplete = false;
            this.shouldPause = false;
        }

        return OrderImporter.instance;

    }

    startWorker = (batch, orderIds) => {

        this.activeWorkers++;
    
        const worker = new Worker('./src/utils/order-import-worker.js', {
            workerData: { batch, orderIds }
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
            console.log("Not starting new worker, since the threshold is reachexd");
             return;
        }

        const { index, oIds } = this.batchQueue.shift();
        this.startWorker(index, oIds);

    };

    loadOrderIds = async (batchCount) => {

        while (this.currentOffset < batchCount * this.orderPerBatch && !this.shouldPause) {

            const orderIds = await MYDBM.queryWithConditions(
                this.orderIdLoadQuery,
                [this.orderIdsLoadBatch, this.currentOffset]
            );
            
            if (orderIds.length === 0) break;

            for (let i = 0; i < orderIds.length; i += this.orderPerBatch) {

                const chunk = orderIds.slice(i, i + this.orderPerBatch).map(row => row.OrderId);
                this.batchQueue.push({ index: this.currentOffset / this.orderPerBatch + 1, oIds: chunk });
                this.currentOffset += this.orderPerBatch;
               
                if (this.batchQueue.length >= 100) await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        this.loadComplete = true;

    };

    start = async () => {

        try {

            const orders = await MYDBM.query(this.orderCountQuery);

            if (Array.isArray(orders) && orders.length === 1) {

                const orderCount = parseInt(orders[0]["Count"]);
                const batchCount = Math.ceil(orderCount / this.orderPerBatch);
    
                console.log("Total Order:", orderCount);
                console.log("Total Batches:", batchCount);
    
                const batchProgressModel = await EM.getModel("cms_scheduler_batch_progress");
                let orderBatch = await batchProgressModel.findOne({ type: "ORDER_IMPORTER" }).lean();
    
                if (!orderBatch) {
                    orderBatch = new batchProgressModel({
                        totalBatch: batchCount,
                        currentBatch: 0,
                        recordPerBatch: this.orderPerBatch,
                        totalRecord: orderCount,
                        completedBatch: 0,
                        pendingBatch: batchCount,
                        status: false,
                        type: "ORDER_IMPORTER"
                    });
                    orderBatch = await orderBatch.save();
                    orderBatch = orderBatch.toObject();
                }
    
                if (!orderBatch.status) {
                    await batchProgressModel.findByIdAndUpdate(orderBatch._id, { status: true });
                } else {
                    return null;
                }

                let currentBatch = orderBatch.completedBatch || 0;
                this.currentOffset = currentBatch * this.orderPerBatch;

                this.loadComplete = false;
                this.loadOrderIds(batchCount);

                while ((!this.loadComplete || this.batchQueue.length > 0 || this.activeWorkers > 0) && !this.shouldPause) {
                    while (this.batchQueue.length > 0 && this.activeWorkers < this.maxThread && !this.shouldPause) {
                        this.startNextWorker();
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }   
                
                if (this.shouldPause) {
                    await batchProgressModel.findByIdAndUpdate(orderBatch._id, {
                        currentBatch: currentBatch + this.batchQueue.length,
                        pendingBatch: batchCount - (currentBatch + this.batchQueue.length),
                        status: false
                    });
                } else {
                    await batchProgressModel.findByIdAndUpdate(orderBatch._id, {
                        endTime: new Date(),
                        status: false
                    });
                    console.log("All batches processed successfully.");
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

        console.log("All active workers finished. Batch progress has been updated.");

    };

}

const OI = new OrderImporter();
export default OI;