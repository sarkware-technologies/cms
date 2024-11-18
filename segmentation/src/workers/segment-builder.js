import { workerData } from "worker_threads";
import pLimit from 'p-limit';
import MDBM from "../utils/mongo.js";
import MYDBM from "../utils/mysql.js";
import EM from "../utils/entity.js";
import { ObjectId } from "mongodb";

import SegmentGeography from "../enums/segment-geography.js";
import SegmentRetailerStatus from "../enums/segment-retailer-status.js";
import SegmentStoreStatus from "../enums/segment-store-status.js";
import SegmentRuleType from "../enums/segment-rule-type.js";
import SegmentRuleQtyType from "../enums/segment-rule-qty-type.js";

let segmentRules,
    segmentModel, 
    orderModel, 
    orderItemModel,
    segmentRuleModel, 
    segmentBuildStatusModel,     
    segmentRetailerBufferModel,
    segmentBlacklistedRetailerModel;

const init = async () => {

    try {

        await MDBM.connect();
        await MYDBM.connect(false);

        segmentModel = await EM.getModel("cms_segment");
        orderModel = await EM.getModel("cms_master_order"); 
        orderItemModel = await EM.getModel("cms_master_order_item"); 
        segmentRuleModel = await EM.getModel("cms_segment_rule");
        segmentBuildStatusModel = await EM.getModel("cms_segment_builder_status");        
        segmentRetailerBufferModel = await EM.getModel("cms_segment_retailer_buffer");
        segmentBlacklistedRetailerModel = await EM.getModel("cms_segment_blacklisted_retailer");

    } catch (error) {
        console.error("Error initializing models:", error);
        throw error;
    }

};

const checkSegmentRules = async(_retailerId, _orders, _segment) => {

    try {

        let entry = null;
        let qty = 0;

        const ruleResult = [];
        const summaryProducts = new Map();
        const summaryBrands = new Map();
        const summaryCategories = new Map();

        const orderPerBatch = 1000;
        const totalBatches = Math.ceil(_orders.length / orderPerBatch);

        for (let i = 0; i < totalBatches; i++) {

            const orderBatch = _orders.slice(i * orderPerBatch, (i + 1) * orderPerBatch);

            const itemFilter = {};
            itemFilter["order"] = { $in: orderBatch };

            if (_segment.companies) { 
                itemFilter["companyId"] = { $in: _segment.companies };
            }

            const orderItems = await orderItemModel.find(itemFilter).lean();

            orderItems.forEach(item => {

                segmentRules.forEach(rule => {

                    entry = null;
                    qty = 0;

                    if (rule.ruleType === SegmentRuleType.PRODUCT) {
                        if (item.mdmProductCode && item.mdmProductCode === rule.target) {                             

                            entry = summaryProducts.get(item.mdmProductCode) || { quantity: 0, amount: 0 };
                            qty = item.receivedQty || item.orderedQty || 0;
                            entry.quantity += qty;
                            entry.amount += qty * item.ptr;

                            summaryProducts.set(item.mdmProductCode, entry);  

                        }                        
                    } else if (rule.ruleType === SegmentRuleType.BRAND) {
                        if (item.brandId && item.brandId === rule.target) { 
                            
                            entry = summaryBrands.get(item.brandId) || { quantity: 0, amount: 0 };
                            qty = item.receivedQty || item.orderedQty || 0;
                            entry.quantity += qty;
                            entry.amount += qty * item.ptr;

                            summaryBrands.set(item.brandId, entry);
                                             
                        }                        
                    } else if (rule.ruleType === SegmentRuleType.CATEGORY) {
                        if (item.category && item.category === rule.target) {  
                            
                            entry = summaryCategories.get(item.category) || { quantity: 0, amount: 0 };
                            qty = item.receivedQty || item.orderedQty || 0;
                            entry.quantity += qty;
                            entry.amount += qty * item.ptr;

                            summaryCategories.set(item.category, entry);
                                                   
                        }                        
                    }

                });

            });
        }

        segmentRules.forEach(rule => {

            const { ruleType, target, from, to, qtyType } = rule;

            const _from = from > 0 ? from : 0;
            const _to = to > 0 ? to : 0;

            const property = qtyType === SegmentRuleQtyType.QUANTITY ? "quantity" : "amount";
            const summary = ruleType === SegmentRuleType.PRODUCT
                ? summaryProducts
                : ruleType === SegmentRuleType.BRAND
                    ? summaryBrands
                    : summaryCategories;

            const targetSummary = summary.get(target);
            if (targetSummary) {
                const value = targetSummary[property];
                ruleResult.push(
                    (_from && _to && value >= _from && value <= _to) ||
                    (_from && !_to && value >= _from) ||
                    (!_from && _to && value <= _to) ||
                    (!_from && !_to)
                );
            }

        });

        if (_retailerId == 8767) {
            console.log("ruleTest for retailer");
            console.log(ruleResult);         
        }

        const res = ruleResult.length > 0 ? ruleResult.every(Boolean) : false;
        if (res) {
            console.log("Check rules is success");
        }

        return res;

        //eturn ruleResult.every(Boolean);

    } catch (e) {
        console.log(e);
        return false;
    }   

};

const addToSummary = (summary, key, item) => {

    const entry = summary.get(key) || { quantity: 0, amount: 0 };
    const qty = item.receivedQty || item.orderedQty || 0;
    entry.quantity += qty;
    entry.amount += qty * item.ptr;

    summary.set(key, entry);

}

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

        if (_retailerId == 722) {
            console.log(filterOrderQuery);
        }
        

        let finalOrders = await orderModel.find(filterOrderQuery)
            .populate(populateOrderQuery)
            .select("_id store retailer")
            .lean();

            if (_retailerId == 722) {
                console.log("Total order found for 722 is : "+ finalOrders.length);
            }

        if (populateOrderQuery.some(item => item.path === "store")) {
            finalOrders = finalOrders.filter(order => order.store && order.store.isAuthorized);
        }
        if (populateOrderQuery.some(item => item.path === "retailer")) {
            finalOrders = finalOrders.filter(order => order.retailer && order.retailer.isAuthorized);
        }    
        
        if (_retailerId == 722) {
            console.log("Total order found for 722 is : "+ finalOrders.length);
        }

        if (segmentRules.length > 0) {
            const oIds = finalOrders.map((order) => new ObjectId(order._id));
            return await checkSegmentRules(_retailerId, oIds, _segment);
        } 
        
        return finalOrders.length > 0 ? true : false;        

    } catch (e) {  
        console.log(e);
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
    const limit = pLimit(3); // Limit concurrent checks to a manageable number (e.g., 5)

    try {
        await init();

        segmentRules = await segmentRuleModel.find({ segment: segmentId }).lean() || [];        
        const segment = await segmentModel.findById(segmentId).lean();
        const buildStatus = await segmentBuildStatusModel.findOne({ segment: segmentId }).lean();

        await segmentBuildStatusModel.findByIdAndUpdate(buildStatus._id, { $max: { currentBatch: batch } });

        const eligibleRetailersBatch = []; // Collect eligible retailers across chunks

        for (let i = 0; i < retailers.length; i += chunkSize) {
            const chunk = retailers.slice(i, i + chunkSize);

            const eligibilityChecks = chunk.map((retailer) =>
                limit(async () => {
                    const isEligible = await checkRetailerEligibility(retailer.RetailerId, segment);
                    if (isEligible) {
                        eligibleRetailersBatch.push({ segment: segment._id, retailer: retailer._id });
                    }
                })
            );

            await Promise.all(eligibilityChecks); // Run checks concurrently within the limit
        }

        // Insert eligible retailers in bulk
        if (eligibleRetailersBatch.length > 0) {
            await segmentRetailerBufferModel.insertMany(eligibleRetailersBatch);
        }

        await segmentBuildStatusModel.findByIdAndUpdate(buildStatus._id, { $inc: { completedBatch: 1, pendingBatch: -1 } });
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

};

processBatch(workerData);