import { Worker } from 'worker_threads';
import MDBM from "../utils/mongo.js";
import MYDBM from "../utils/mysql.js";
import EM from "../utils/entity.js";
import ImportType from '../enums/importer-type.js';
import SegmentGeography from '../enums/segment-geography.js';
import SegmentRetailerStatus from '../enums/segment-retailer-status.js';
import SegmentStoreStatus from '../enums/segment-store-status.js';

export default class SegmentBuilder {

    constructor() {

        this.retailerPerBatch = 1000;
        this.retailerIdsPerBatch = 25000;        
        this.activeWorkers = 0;
        this.batchQueue = [];
        this.maxThread = 20;
        this.chunkSize = 100;
        this.currentOffset = 0;
        this.loadComplete = false;
        this.segmentRules = [];

        this.orderModel = null;
        this.segmentRuleModel = null;
        this.batchOptionModel = null;
        this.segmentModel = null;
        this.segmentQueueModel = null;                        
        this.retailerModel = null;
        this.segmentRetailerModel = null;
        this.segmentRetailerExclusionModel = null; 
        this.segmentRetailerInclusionModel = null; 

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

    loadRetailerIds = async (batchCount) => {

        try {

            while (this.currentOffset < batchCount * this.retailerPerBatch) {

            }

        } catch (e) {
            console.log(e);
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
            }
        }

        this.loadComplete = true;

    };

    checkRetailerEligibility = async (_retailerId, _segment) => {   

        if (_retailerId == 6904) {
            console.log("checkRetailerEligibility is called for rretailer : "+ _retailerId);
        }

        try {

            const filterOrderQuery = {};                
            const populateOrderQuery = [];            
            
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
            } else {
                /* This means no State was selected, 
                safe to ignore as this will inclulde all the orders */
            }

            if ((_segment.geography == SegmentGeography.REGION) && (Array.isArray(_segment.regions) && _segment.regions.length > 0 )) {
                filterOrderQuery["regionId"] = { $in: _segment.regions };
            } else {
                /* This means no Region was selected, 
                safe to ignore as this will inclulde all the orders */
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
            } else {
                /* This means no order status was selected, 
                safe to ignore as this will inclulde all the orders */
            }

            if (_segment.retailerStatus == SegmentRetailerStatus.AUTHORIZED) {
                populateOrderQuery.push({path: "retailer", match: { isAuthorized: true }});
            }

            if (_segment.storeStatus == SegmentStoreStatus.AUTHORIZED) {
                populateOrderQuery.push({path: "store", match: { isAuthorized: true }});
            }

            if (Array.isArray(_segment.excludedStores) && _segment.excludedStores.length > 0) {
                filterOrderQuery["store"] = { $nin: _segment.excludedStores };
            }

            if (_retailerId == 6904) {
                console.log(filterOrderQuery);
            }

            let finalOrders = await this.orderModel.find(filterOrderQuery).select("_id").lean();

            if (populateOrderQuery.some(item => item.path === "store")) {
                finalOrders = finalOrders.filter(order => order.store);
            }
            if (populateOrderQuery.some(item => item.path === "retailer")) {
                finalOrders = finalOrders.filter(order => order.retailer);
            }

            if (_retailerId == 6904) {
                console.log("Orders found for "+ _retailerId +" is : "+ finalOrders.length);
                console.log("Rules count : "+ this.segmentRules.length );
            }

            if (this.segmentRules.length == 0) {
                return finalOrders.length > 0 ? true : false;
            }

            return false;

        } catch (e) { console.log(e);
            return false;
        }

    };

    start = async () => {

        try {

            //await this.init();
            this.orderModel = await EM.getModel("cms_master_order"); 
            this.segmentRuleModel = await EM.getModel("cms_segment_rule");
            this.segmentModel = await EM.getModel("cms_segment");
            this.segmentQueueModel = await EM.getModel("cms_segment_queue");                        
            this.retailerModel = await EM.getModel("cms_master_retailer");
            this.segmentRetailerModel = await EM.getModel("cms_segment_retailer");
            this.segmentRetailerExclusionModel = await EM.getModel("cms_segment_retailer_exclusion"); 
            this.segmentRetailerInclusionModel = await EM.getModel("cms_segment_retailer_inclusion"); 
            
            const queueItem = await this.segmentQueueModel.findOne().sort({ createdBy: 1 }).lean().exec();
            const segment = await this.segmentModel.findById(queueItem.segment).lean();
            
            if (queueItem && segment) {

                /* Clear the existing mapping - Just in case */
                await this.segmentRetailerModel.deleteMany({ segment: segment._id });
                await this.segmentRetailerExclusionModel.deleteMany({ segment: segment._id });
                await this.segmentRetailerInclusionModel.deleteMany({ segment: segment._id });
                
                this.segmentRules = await this.segmentRuleModel.find({segment: segment._id}).lean();
                const retailerCount = await this.retailerModel.countDocuments({});
                const totalBatches = Math.ceil(retailerCount / this.retailerPerBatch);

                console.log("Total retailers : "+ retailerCount);

                for (let i = 0; i < totalBatches; i++) {

                    console.log("Processing batch : "+ (i+1));

                    const retailers = await this.retailerModel.find({})
                        .skip(i * this.retailerPerBatch)
                        .limit(this.retailerPerBatch)
                        .lean();

                    const retailerPromise = retailers.map(async (retailer) => {

                        const isEligible = await this.checkRetailerEligibility(retailer.RetailerId, segment)
                        if (isEligible) {  console.log(retailer.RetailerId +" is elegible");
                            try {
                                const mapping = new this.segmentRetailerModel({
                                    segment: segment._id,
                                    retailer: retailer._id
                                });
                                await mapping.save();
                            } catch (e) {
                                console.log(e);
                            }                            
                        }

                    });

                    await Promise.all(retailerPromise);                    

                }

                console.log("Building completed");

            }

        } catch (e) {
            console.log(e);
        }

    };

}