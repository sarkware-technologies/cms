import { Worker } from 'worker_threads';
import MYDBM from "./mysql.js";
import EM from "./entity.js";

class OrderImporter {

    constructor() {
        if (!OrderImporter.instance) {
            OrderImporter.instance = this;
            this.orderPerBatch = 1000;
            this.orderIdsLoadBatch = 10000;
            this.orderCountQuery = `select COUNT(o.OrderId) as Count from orders o`;
            this.activeWorkers = 0;
            this.batchQueue = [];
            this.maxThread = 10;
            this.currentOffset = 0;  // Offset for loading more OrderIds
        }
        return OrderImporter.instance;
    }

    queryDatabase = async (query, params) => {
        return await MYDBM.queryWithConditions(query, params);
    };

    handleWorkerRequest = (worker, payload) => {
        this.queryDatabase(payload.query, payload.params)
            .then(result => worker.postMessage({ success: true, type: "query", result }))
            .catch(error => worker.postMessage({ success: false, type: "query", error }));
    };

    startWorker = (batch, orderIds) => {

        this.activeWorkers++;
    
        const worker = new Worker('./src/utils/order-import-worker.js', {
            workerData: { batch, orderIds }
        });
    
        worker.on('message', (payload) => {
            if (payload.type === "query") {
                this.handleWorkerRequest(worker, payload);
            } else if (payload.type === "completed") {
                this.activeWorkers--;
                this.startNextWorker();
            }
        });
    
        worker.on('error', (err) => {
            console.error(`Worker encountered an error:`, err);
            this.activeWorkers--;
            this.startNextWorker();
        });
    
        worker.on('exit', (code) => {
            if (code !== 0) {
                console.error(`Worker stopped with exit code ${code}`);
            }
        });

    };

    startNextWorker = () => {

        if (this.batchQueue.length === 0 || this.activeWorkers >= this.maxThread) return;

        const { index, oIds } = this.batchQueue.shift();
        this.startWorker(index, oIds);

    };

    doOrderImport = async () => {

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
    
                for (let i = currentBatch; i < batchCount; i++) {                    
                    const orderIds = await MYDBM.queryWithConditions(
                        "SELECT OrderId FROM orders ORDER BY OrderId LIMIT ? OFFSET ?", 
                        [this.orderPerBatch, i * this.orderPerBatch]
                    );
                    this.batchQueue.push({ index: (i+1), oIds: orderIds.map(row => row.OrderId)});
                }

                for (let i = 0; i < this.maxThread; i++) {
                    this.startNextWorker();
                }
    
                while (this.activeWorkers > 0 || this.batchQueue.length > 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
    
                await batchProgressModel.findByIdAndUpdate(orderBatch._id, {
                    endTime: new Date(),
                    status: false
                });
    
                console.log("All batches processed successfully.");
            }

        } catch (e) {
            console.log("Error in doOrderImport:", e);
        }

    };
    
}

const OI = new OrderImporter();
export default OI;