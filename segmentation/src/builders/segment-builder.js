import { Worker } from 'worker_threads';
import MDBM from "../utils/mongo.js";
import MYDBM from "../utils/mysql.js";
import EM from "../utils/entity.js";
import ImportType from '../enums/importer-type.js';

export default class SegmentBuilder {

    constructor() {

        this.ordersPerBatch = 1000;
        this.orderIdsPerBatch = 25000;        
        this.activeWorkers = 0;
        this.batchQueue = [];
        this.maxThread = 20;
        this.chunkSize = 100;
        this.currentOffset = 0;
        this.loadComplete = false;

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

    checkRetailerEligibility = async (_retailerId, _segment) => {

        try {

            const filterOrderQuery = {};                
            const populateOrderQuery = [];
            const orderModel = await EM.getModel("cms_master_order"); 
            const segmentRuleModel = await EM.getModel("cms_segment_rule");
            
            filterOrderQuery["retailerId"] = _retailerId;

            if (_segment.fromDate && _segment.toDate) {
                filterOrderQuery["orderDate"] = { $gte: new Date(_segment.fromDate), $lte: new Date(_segment.toDate) };
            } else {
                if (_segment.fromDate) {
                    filterOrderQuery["orderDate"] = { $gte: new Date(_segment.fromDate) };
                }    
                if (_segment.toDate) {
                    filterOrderQuery["orderDate"] = { $lte: new Date(_segment.toDate) };
                }
            }

            if ((_segment.geography == SegmentGeography.STATE) && (Array.isArray(_segment.states) && _segment.states.length > 0 )) {
                filterOrderQuery["stateId"] = { $in: _segment.states };
            }

            if ((_segment.geography == SegmentGeography.REGION) && (Array.isArray(_segment.regions) && _segment.regions.length > 0 )) {
                filterOrderQuery["regionId"] = { $in: _segment.regions };
            }

            if (Array.isArray(_segment.orderStatus) && _segment.orderStatus.length > 0) {

                const oStatus = [];
                for (let i = 0; i < _segment.orderStatus.length; i++) {
                    if (_segment.orderStatus[i] == 1) {
                        oStatus.push("Placed");
                    } else if (_segment.orderStatus[i] == 2) {
                        oStatus.push("Processed");
                    } else {
                        oStatus.push("Uploaded");
                    }                        
                }

                filterOrderQuery["orderStatus"] = { $in: oStatus };
            }

            if (_segment.retailerStatus == SegmentRetailer.AUTHORIZED) {
                populateOrderQuery.push({path: "retailer", match: { isAuthorized: true }});
            }

            if (_segment.storeStatus == SegmentStoreStatus.AUTHORIZED) {
                populateOrderQuery.push({path: "store", match: { isAuthorized: true }});
            }

            if (Array.isArray(_segment.excludedStores) && _segment.excludedStores.length > 0) {
                filterOrderQuery["store"] = { $nin: _segment.excludedStores };
            }

            let finalOrders = await orderModel.find(filterOrderQuery).select("_id").lean();
            if (populateOrderQuery.some(item => item.path === "store")) {
                finalOrders = finalOrders.filter(order => order.store);
            }
            if (populateOrderQuery.some(item => item.path === "retailer")) {
                finalOrders = finalOrders.filter(order => order.retailer);
            }

            console.log("Total : "+ finalOrders.length +" found for reatiler : "+ _retailerId);

            const rules = await segmentRuleModel.find({segment: _segment._id});            
            if (rules.length == 0) {
                return true;
            } else {



            }

        } catch (e) {

        }

    };

    start = async () => {

        try {

            await this.init();

            const segmentModel = await EM.getModel("cms_system_segment");
            const segmentQueueModel = await EM.getModel("cms_segment_queue");            
            const orderModel = await EM.getModel("cms_master_order");           

            const queueItem = await segmentQueueModel.findOne().populate("segment").sort({ createdBy: 1 }).lean().exec();
            if (queueItem) {

                const orderCount = await orderModel.countDocuments({});

            }

        } catch (e) {
            console.log(e);
        }

    };

}