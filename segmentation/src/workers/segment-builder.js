import { workerData } from "worker_threads";
import MDBM from "../utils/mongo.js";
import MYDBM from "../utils/mysql.js";
import EM from "../utils/entity.js";

import SegmentGeography from "../enums/segment-geography.js";
import SegmentRetailerStatus from "../enums/segment-retailer-status.js";
import SegmentStoreStatus from "../enums/segment-store-status.js";

let segmentRules,
    segmentModel, 
    orderModel, 
    segmentRuleModel, 
    segmentBuildStatusModel,     
    segmentRetailerBufferModel;

const init = async () => {

    try {

        await MDBM.connect();
        await MYDBM.connect(false);

        segmentModel = await EM.getModel("cms_segment");
        orderModel = await EM.getModel("cms_master_order"); 
        segmentRuleModel = await EM.getModel("cms_segment_rule");
        segmentBuildStatusModel = await EM.getModel("cms_segment_builder_status");        
        segmentRetailerBufferModel = await EM.getModel("cms_segment_retailer_buffer");

    } catch (error) {
        console.error("Error initializing models:", error);
        throw error;
    }

};

const checkRetailerEligibility = async (_retailerId, _segment) => {   

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

        let finalOrders = await orderModel.find(filterOrderQuery)
            .populate(populateOrderQuery)
            .select("_id store retailer")
            .lean();

        if (populateOrderQuery.some(item => item.path === "store")) {
            finalOrders = finalOrders.filter(order => order.store && order.store.isAuthorized);
        }
        if (populateOrderQuery.some(item => item.path === "retailer")) {
            finalOrders = finalOrders.filter(order => order.retailer && order.retailer.isAuthorized);
        }

        if (segmentRules.length == 0) {
            return finalOrders.length > 0 ? true : false;
        }

        return false;

    } catch (e) {  console.log(e);
        return false;
    }

};

const processWithLimit = async (items, task, limit) => {

    const queue = [...items];
    const results = [];
    const promises = [];

    while (queue.length > 0) {
        if (promises.length < limit) {
            const item = queue.shift();
            const promise = task(item)
                .then(result => {
                    results.push(result);
                    promises.splice(promises.indexOf(promise), 1);
                })
                .catch(error => {
                    console.error("Error in processing item:", error);
                    promises.splice(promises.indexOf(promise), 1);
                });
            promises.push(promise);
        } else {
            await Promise.race(promises);
        }
    }

    await Promise.all(promises);
    return results;

}

const processBatch = async (data) => {  

    const { batch, retailers, segmentId, chunkSize } = data; 

    try {

        await init();

        segmentRules = await segmentRuleModel.find({ segment: segmentId }) || [];        
        const segment = await segmentModel.findById(segmentId).lean();
        const buildStatus = await segmentBuildStatusModel.findOne({ segment: segmentId }).lean();

        try {            
            await segmentBuildStatusModel.findByIdAndUpdate(buildStatus._id, {
                $max: { currentBatch: batch }
            });
        } catch (e) {
            console.log(e.message);
        }

        for (let i = 0; i < retailers.length; i += chunkSize) {

            const chunk = retailers.slice(i, i + chunkSize);
            const eligibleRetailers = []; // Array to collect eligible retailers

            await processWithLimit(chunk, async (retailer) => {
                const isEligible = await checkRetailerEligibility(retailer.RetailerId, segment);
                if (isEligible) {
                    eligibleRetailers.push({ segment: segment._id, retailer: retailer._id });
                }
            }, 2); 
            
            if (eligibleRetailers.length > 0) {
                try {
                    await segmentRetailerBufferModel.insertMany(eligibleRetailers);
                } catch (e) {
                    console.error("Error inserting retailer mappings:", e);
                }
            }
        }          
        
        await segmentBuildStatusModel.findByIdAndUpdate(buildStatus._id, {
            $inc: { completedBatch: 1, pendingBatch: -1 },
        });  
        
    } catch (e) {        
        console.log(e);
    } finally {

        try {
            await MDBM.close();
            await MYDBM.close();
        } catch (closeError) {
            console.error("Error during cleanup:", closeError);
        }
        
        process.exit(0);

    }

}

processBatch(workerData);