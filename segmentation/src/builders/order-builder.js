import { Worker } from 'worker_threads';
import MDBM from "../utils/mongo.js";
import MYDBM from "../utils/mysql.js";
import EM from "../utils/entity.js";
import SegmentQueueStatus from '../enums/segment-queue-status.js';
import mongoose from 'mongoose';
import SegmentStatus from '../enums/segment-status.js';

export default class OrderBuilder {

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

            const modelNames = ["cms_master_order", "cms_segment", "cms_segment_rule", 
                "cms_master_retailer", "cms_segment_retailer", "cms_segment_blacklisted_retailer", 
                "cms_segment_whitelisted_retailer", "cms_segment_builder_status", "cms_segment_retailer_buffer",
                "cms_segment_build_log"
            ];

            this.models = Object.fromEntries(
                await Promise.all(
                    modelNames.map(async name => [name, await EM.getModel(name)])
                )
            );          

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

    start = async (_orderId) => {

        try {

            await this.init();    
            this.segmentId = _segmentId;

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

}