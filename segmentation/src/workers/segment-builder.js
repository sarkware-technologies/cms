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

let segmentRules;
let models = {};

const init = async () => {

    try {

        await MDBM.connect();
        await MYDBM.connect(false);

        const modelNames = [
            "cms_segment",
            "cms_master_order",
            "cms_master_order_item",
            "cms_segment_rule",
            "cms_segment_builder_status",
            "cms_segment_retailer_buffer",
            "cms_segment_retailer_summary",
            "cms_segment_retailer_rules_summary"
        ];

        models = Object.fromEntries(
            await Promise.all(
                modelNames.map(async name => [name, await EM.getModel(name)])
            )
        );                     

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

            const orderItems = await models.cms_master_order_item.find(itemFilter).lean();

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

        segmentRules.forEach(async (rule) => {

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

                await models.cms_segment_retailer_rules_summary.findOneAndUpdate(
                    { retailer: _retailerId, segment: _segment._id },
                    {            
                        ruleType,
                        target,
                        value
                    },
                    { upsert: true, new: true }
                );  

            }            

        });

        return ruleResult.length > 0 ? ruleResult.every(Boolean) : false;
        
    } catch (e) {
        console.log(e);
        return false;
    }   

};

const checkRetailerEligibility = async (_retailerId, _segment) => {   

    try {

        const stateIds = [];
        const regionIds = [];
        const _storeIds = [];
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

        let finalOrders = await models.cms_master_order.find(filterOrderQuery)
            .populate(populateOrderQuery)
            .select("_id store retailer")
            .lean();

        if (populateOrderQuery.some(item => item.path === "store")) {
            finalOrders = finalOrders.filter(order => order.store && order.store.isAuthorized);
        }
        if (populateOrderQuery.some(item => item.path === "retailer")) {
            finalOrders = finalOrders.filter(order => order.retailer && order.retailer.isAuthorized);
        }    
        
        if (segmentRules.length > 0) {

            const oIds = finalOrders.map((order) => {

                if (!stateIds.includes(order.stateId)) {
                    stateIds.push(order.stateId);
                }
                if (!regionIds.includes(order)) {
                    regionIds.push(order.regionId);
                }
                if (!_storeIds.includes(order)) {
                    _storeIds.push(order.storeId);
                }
                
                return new ObjectId(order._id)

            });

            return await checkSegmentRules(_retailerId, oIds, _segment);

        } 

        const { from, latest } = finalOrders.reduce((acc, order) => {
            try {

                const orderDate = new Date(order.orderDate.$date);        
                if (isNaN(orderDate)) {
                    throw new Error(`Invalid date: ${order.orderDate.$date}`);
                }
        
                if (!acc.from || orderDate < acc.from) {
                    acc.from = orderDate;
                }
                if (!acc.latest || orderDate > acc.latest) {
                    acc.latest = orderDate;
                }

            } catch (e) {
                console.error(`Error processing date for order ${order.orderId}: ${e.message}`);
            }

            return acc;
        }, { from: null, latest: null });

        await models.cms_segment_retailer_summary.findOneAndUpdate(
            { retailer: _retailerId, segment: _segment._id },
            {
                states: stateIds,
                regions: regionIds,
                stores: _storeIds,
                dateFrom: from,
                dateTo: latest
            },
            { upsert: true, new: true }
        );
        
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

        segmentRules = await models.cms_segment_rule.find({ segment: segmentId }).lean() || [];        
        const segment = await models.cms_segment.findById(segmentId).lean();
        const buildStatus = await models.cms_segment_builder_status.findOne({ segment: segmentId }).lean();

        await models.cms_segment_builder_status.findByIdAndUpdate(buildStatus._id, { $max: { currentBatch: batch } });

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
            await models.cms_segment_retailer_buffer.insertMany(eligibleRetailersBatch);
        }

        await models.cms_segment_builder_status.findByIdAndUpdate(buildStatus._id, { $inc: { completedBatch: 1, pendingBatch: -1 } });
        
    } catch (e) {        
        console.log(e);
    } finally {

        try {

            await Promise.all([MDBM.close(), MYDBM.close()]);
            process.exit(0);

        } catch (closeError) {
            console.error("Error during cleanup:", closeError);
        }

    }

};

processBatch(workerData);