import { fork } from 'child_process';
import EM from "../utils/entity.js";
import QueueStatus from '../enums/queue-status.js';

class OrderBuildManager {

    constructor() {
        this.activeProcess = null;
        this.maxConcurrentBuilders = 1;
        this.orderQueueModel = null;        
    }

    /* Singleton instance holder */
    static instance;

    static getInstance() {
        if (!OrderBuildManager.instance) {
            OrderBuildManager.instance = new OrderBuildManager();
        }
        return OrderBuildManager.instance;
    }

    isFree = () => this.activeProcess == null;

    async processQueue() {

        try {

            this.orderQueueModel = await EM.getModel("cms_segment_order_queue");

            if (this.activeProcess) {
                console.log("Segment order build is already in progress. Exiting processQueue.");
                return;
            }

            /* Check another replicas is running the process */
            const buildingOrders = await this.orderQueueModel.find({
                queueStatus: QueueStatus.BUILDING,
            }).lean(); 
    
            if (buildingOrders.length > 0) {
                console.log("Segment order build is already in progress (Running in Other Replica). Exiting processQueue.");
                return;
            }

            /* Ok, now check for the waiting queue */
            const waitingOrders = await this.orderQueueModel.find({
                queueStatus: QueueStatus.WAITING,
            }).lean();
    
            if (waitingOrders.length === 0) {
                console.log("No waiting segments found. Exiting.");
                return;
            }

            /* Well we found something, lets start the process */
            await this.startOrderBuilder();

        } catch (e) {
            console.log(e);
        }

    }

    async startOrderBuilder() {

        this.activeProcess = fork('./src/builders/order-builder-process.js');        

        this.activeProcess.once('exit', (code) => {
            console.log(`OrderBuilder process exited with code ${code}`);
            this.activeProcess = null;            
        });

        this.activeProcess.once('error', (error) => {
            console.error(`Error in SegmentBuilder process :`, error);
            this.activeProcess = null;   
        });

        this.activeProcess.send({ message: "start" });

    }

}

export default OrderBuildManager;