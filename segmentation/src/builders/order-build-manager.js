import { fork } from 'child_process';
import EM from "../utils/entity.js";

class OrderBuildManager {

    constructor() {
        this.activeProcesses = new Map();
        this.maxConcurrentBuilders = 1;
        this.segmentQueueModel = null;        
    }

    /* Singleton instance holder */
    static instance;

    static getInstance() {
        if (!OrderBuildManager.instance) {
            OrderBuildManager.instance = new OrderBuildManager();
        }
        return OrderBuildManager.instance;
    }

    isFree = () => this.activeProcesses.size === 0;

    async processQueue() {

    }

}