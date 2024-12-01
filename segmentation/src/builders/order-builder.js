import { Worker } from 'worker_threads';
import MDBM from "../utils/mongo.js";
import MYDBM from "../utils/mysql.js";
import EM from "../utils/entity.js";
import QueueStatus from '../enums/queue-status.js';

export default class OrderBuilder {

    constructor() {
        this.activeWorkers = 0;
        this.maxThreads = 10;
        this.orderQueueModel = null;        
    }

    /**
     * Initialize MongoDB, MySQL, and the required model.
     */
    init = async () => {
        try {

            await MDBM.connect();
            await MYDBM.connect(false);
            this.orderQueueModel = await EM.getModel("cms_segment_order_queue");

        } catch (e) {
            console.error("Error during initialization:", e);
            throw e;
        }
    };

    /**
     * Clean up MongoDB and MySQL connections.
     */
    cleanup = async () => {
        try {
            if (MDBM.isConnected()) await MDBM.close();
            if (MYDBM.isConnected()) await MYDBM.close();
        } catch (closeError) {
            console.error("Error during cleanup:", closeError);
        }
    };

    /**
     * Start a worker thread for the given order ID.
     */
    startWorker = async (orderId) => {

        this.activeWorkers++;
        console.log(`Starting worker for order ${orderId}`);

        const worker = new Worker('./src/workers/order-builder.js', {
            workerData: { orderId },
        });

        worker.once('exit', (code) => {
            (async () => {
                if (code !== 0) {
                    console.error(`Worker for order ${orderId} exited with code ${code}`);
                }
                this.activeWorkers--;
                await this.fetchAndStartNextWorker();
            })().catch((e) => {
                console.error("Error in 'exit' handler:", e);
            });
        });
        
        worker.once('error', (error) => {
            (async () => {
                console.error(`Worker for order ${orderId} encountered an error:`, error);
                this.activeWorkers--;
                await this.fetchAndStartNextWorker();
            })().catch((e) => {
                console.error("Error in 'error' handler:", e);
            });
        });        

    };

    /**
     * Fetch the next waiting order and start its worker.
     */
    fetchAndStartNextWorker = async () => {

        if (this.activeWorkers >= this.maxThreads) {
            return;
        }

        // Fetch one waiting order from the queue
        const nextOrder = await this.orderQueueModel.findOneAndUpdate(
            { queueStatus: QueueStatus.WAITING },
            { queueStatus: QueueStatus.BUILDING }, // Mark as BUILDING
            { sort: { _id: 1 }, new: true } // Fetch the oldest waiting order
        );

        if (nextOrder) {
            await this.startWorker(nextOrder.orderId);
        } else {
            console.log("No more waiting orders.");
        }

    };

    /**
     * Start processing the order queue.
     */
    start = async () => {

        try {
            await this.init();

            // Initial workers to start
            const initialOrders = await this.orderQueueModel.find({
                queueStatus: QueueStatus.WAITING,
            })
                .limit(this.maxThreads)
                .sort({ _id: 1 })
                .lean();

            // Mark initial orders as BUILDING and start workers
            for (const order of initialOrders) {
                await this.orderQueueModel.updateOne(
                    { _id: order._id },
                    { queueStatus: QueueStatus.BUILDING }
                );
                await this.startWorker(order.orderId);
            }

            // Continue fetching and starting workers until the queue is empty
            while (this.activeWorkers > 0 || (await this.hasWaitingOrders())) {
                // Wait for a short time before checking the queue again
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            console.log("All orders processed.");

        } catch (e) {
            console.error("Error in start method:", e);
        } finally {
            await this.cleanup();
        }

    };

    /**
     * Check if there are any waiting orders in the queue.
     */
    hasWaitingOrders = async () => {
        const count = await this.orderQueueModel.countDocuments({ queueStatus: QueueStatus.WAITING });
        return count > 0;
    };

}