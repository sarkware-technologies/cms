import { workerData } from "worker_threads";
import MDBM from "../utils/mongo.js";
import MYDBM from "../utils/mysql.js";
import EM from "../utils/entity.js";
import SegmentGeography from "../enums/segment-geography.js";
import SegmentStoreStatus from "../enums/segment-store-status.js";
import SegmentRetailerStatus from "../enums/segment-retailer-status.js";
import SegmentRuleType from "../enums/segment-rule-type.js";
import SegmentRuleQtyType from "../enums/segment-rule-qty-type.js";

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
            "cms_segment_retailer_summary",
            "cms_segment_retailer_rules_summary",
            "cms_master_retailer",
            "cms_master_store",
            "cms_segment_retailer",
            "cms_segment_blacklisted_retailer",
            "cms_segment_order_queue"
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

const checkRetailerMaster = async (_retailerId) => {

    try {

        let retailer = await models.cms_master_retailer.findOne({ RetailerId: _retailerId }).lean();
        if (!retailer) {

            const results = await MYDBM.queryWithConditions(`
                select 
                    r.Address1, 
                    r.Address2, 
                    r.City, 
                    r.Email, 
                    r.IsAuthorized, 
                    r.MobileNumber, 
                    r.Pincode, 
                    r.RegionId, 
                    r.RetailerId, 
                    r.RetailerName, 
                    r.StateId 
                    from retailers r 
                WHERE r.RetailerId=?;`
            , [_retailerId]);
    
            if (Array.isArray(results) && results.length == 1) {
    
                const retailerObj = new models.cms_master_retailer(
                    {
                        Address1: results[0].Address1, 
                        Address2: results[0].Address2, 
                        City: results[0].City, 
                        Email: results[0].Email, 
                        IsAuthorized: results[0].IsAuthorized, 
                        MobileNumber: results[0].MobileNumber, 
                        Pincode: results[0].Pincode, 
                        RegionId: results[0].RegionId, 
                        RetailerId: results[0].RetailerId, 
                        RetailerName: results[0].RetailerName, 
                        StateId: results[0].StateId 
                    }
                );
    
                retailer = await retailerObj.save();                 
                retailer = retailer.toObject();
    
            }
        }

        return retailer;

    } catch (e) {
        console.log(e);
        return null;
    }    

};

const checkOrderHeader = async (_order, _retailer, _segment) => {

    try {

        let storeOk = true;
        let regionOk = true;
        let stateOk = true;
        let retailerOk = true;
        let dateFromOk = true;
        let dateToOk = true;
        let orderStatusOk = true;
        let storeIncludedOk = true;

        /* Check the date */

        try {

            const orderDate = new Date(_order.orderDate);
            if (_segment.fromDate) {
                const fromDate = new Date(_segment.fromDate);
                if (orderDate >= fromDate) {
                    dateFromOk = true;
                } else {
                    dateFromOk = false;
                }
            } 

            if (_segment.toDate) {
                const toDate = new Date(_segment.toDate);
                if (orderDate <= toDate) {
                    dateToOk = true;
                } else {
                    dateToOk = false;
                }
            }

        } catch (e) {
            console.log(e)
        } 

        /* Check the store */
        const store = await models.cms_master_store.findById(_order.store);
        if (store) {
            if (_segment.storeStatus == SegmentStoreStatus.AUTHORIZED) {
                storeOk = store.isAuthorized
            }
        }

        /* Check the retailer */
        if (_segment.retailerStatus == SegmentRetailerStatus.AUTHORIZED) {
            retailerOk = _retailer.IsAuthorized
        }

        if (_segment.geography == SegmentGeography.STATE) {
            
            if (_segment.states && Array.isArray(_segment.states)) {
                stateOk = _segment.states.includes(_order.stateId);
            }

        } else {

            if (_segment.regions && Array.isArray(_segment.regions)) {
                regionOk = _segment.regions.includes(_order.regionId);
            }

        }

        /* Check the order status */        
        if(Array.isArray(_segment.orderStatus && !_segment.orderStatus.includes(_order.orderStatus))) {
            orderStatusOk = false;
        }

        /* Check store excluded list */
        if (Array.isArray(_segment.excludedStores && _segment.excludedStores.includes(_order.store))) {
            storeIncludedOk = false;
        }

        return (storeOk && regionOk && stateOk && retailerOk && dateFromOk && dateToOk && orderStatusOk && storeIncludedOk);

    } catch (e) {
        return false;        
    }

};

const updateSummary = async (order, retailer) => {

    try {        
        
        const segmentResults = {};
        const orderItems = await models.cms_master_order_item.find({ orderId: order.orderId }).lean();
        const segments = await models.cms_segment.find({ status: true }).lean();

        for (let i = 0; i < segments.length; i++) {

            let orderSucceed = false;
            const segmentRules = await models.cms_segment_rule.find({ segment: segments[i]._id }).lean() || []; 
            let segmentSummary = await models.cms_segment_retailer_summary.findOne({ retailer: order.retailer, segment: segments[i]._id }).lean();

            /* Order header part */
            if (segmentSummary) {

                /* This retailer is already on this segment */

                let orderDate = null;
                try {
                    orderDate = new Date(order.orderDate);
                } catch (e) {
                    console.log(e);
                }                

                /**
                 * 
                 * Before proceeding, check the segment is has active date range
                 * If it has past date as toDate thyen we can ignore this
                 * 
                 */
                if (orderDate) {
                    if (segmentSummary.dateTo && orderDate > segmentSummary.dateTo) {
                        /* This segment is not active - it is applicable for past date only */
                        continue;
                    }
                }

                const isOrderEligible = await checkOrderHeader(order, retailer, segments[i]);
                if (isOrderEligible) { 
                    
                    orderSucceed = true;

                    /* Update thge summary */

                    if (!segmentSummary.states.includes(order.stateId)) {
                        segmentSummary.states.push(order.stateId);
                    }
                    if (!segmentSummary.regions.includes(order.regionId)) {
                        segmentSummary.regions.push(order.regionId);
                    }
                    if (!segmentSummary.stores.includes(order.storeId)) {
                        segmentSummary.stores.push(order.storeId);
                    }
    
                    if (orderDate) {
                        if (segmentSummary.dateFrom && (orderDate <= segmentSummary.dateFrom)) {
                            segmentSummary.dateFrom = orderDate;
                        }
                        if (segmentSummary.dateTo && orderDate >= segmentSummary.dateTo) {
                            segmentSummary.dateTo = orderDate;
                        }
                    }   
                    
                    await models.cms_segment_retailer_summary.findOneAndUpdate(
                        { 
                            retailer: retailer._id, 
                            segment: segments[i]._id
                        },
                        {
                            states: segmentSummary.states,
                            regions: segmentSummary.regions,
                            stores: segmentSummary.stores,
                            dateFrom: segmentSummary.dateFrom,
                            dateTo: segmentSummary.dateTo
                        },
                        { upsert: true, new: true }
                    ); 

                } else {
                    continue;
                }                

            } else {

                /* He is not on this segment - check whether he is eligible or not */
                const isOrderEligible = await checkOrderHeader(order, retailer, segments[i]); 
                if (isOrderEligible) {

                    orderSucceed = true;

                    const retailerSummaryObj = new models.cms_segment_retailer_summary({
                        segment: segments[i]._id,
                        retailer: retailer._id,
                        states: [order.stateId],
                        regions: [order.regionId],
                        stores: [order.storeId],
                        dateFrom: order.orderDate,
                        dateTo: order.orderDate
                    });

                    segmentSummary = await retailerSummaryObj.save();                    

                } else {
                    continue;
                }                    
                
            }  
            
            /* If this segment doesn't have  any rules, then safe to move to next segment */
            if (segmentRules.length == 0) {
                segmentResults[segments[i]._id] = orderSucceed;                
                continue;
            }

            /**
             * 
             * Order item part
             * 
             */

            /* Proceed to check order item only if segmentSummary is there */
            if (segmentSummary) {

                let qty = 0; 
                let entry = {};
                const existingRuleSummary = {};
                const ruleResult = [];             
                const summaryProducts = new Map();
                const summaryBrands = new Map();
                const summaryCategories = new Map();

                /* Before go into rules, check whther the order items has configured companies */
                if (Array.isArray(segments[i].companies)) { 

                    let valid = false;
                    for (const item of orderItems) {
                        if (segments[i].companies.includes(item.companyId)) {
                            valid = true;
                        }
                    }   

                    if (!valid) {
                        segmentResults[segments[i]._id] = false; 
                        continue;
                    }                    

                }

                /**
                 * 
                 * Aggregation
                 * 
                 */                  
                for (const item of orderItems) {
                    for (const rule of segmentRules) {

                        if (rule.ruleType == SegmentRuleType.PRODUCT) {

                            if (
                                item.mdmProductCode && 
                                item.mdmProductCode.trim().toLowerCase() == rule.target.trim().toLowerCase()) {                             
    
                                entry = summaryProducts.get(rule.target) || { quantity: 0, amount: 0 };
                                qty = item.receivedQty || item.orderedQty || 0;
                                entry.quantity += qty;
                                entry.amount += qty * item.ptr;    

                                summaryProducts.set(rule.target, entry);  
    
                            }                        
    
                        } else if (rule.ruleType == SegmentRuleType.BRAND) {
    
                            if (item.brandId && item.brandId == rule.target) { 
                                
                                entry = summaryBrands.get(rule.target) || { quantity: 0, amount: 0 };
                                qty = item.receivedQty || item.orderedQty || 0;
                                entry.quantity += qty;
                                entry.amount += qty * item.ptr;
    
                                summaryBrands.set(rule.target, entry);
                                                 
                            }                        
    
                        } else if (rule.ruleType == SegmentRuleType.CATEGORY) {
    
                            if (
                                item.category && 
                                item.category.trim().toLowerCase() == rule.target.trim().toLowerCase()) {  
                                
                                entry = summaryCategories.get(rule.target) || { quantity: 0, amount: 0 };
                                qty = item.receivedQty || item.orderedQty || 0;
                                entry.quantity += qty;
                                entry.amount += qty * item.ptr;
    
                                summaryCategories.set(rule.target, entry);
                                                       
                            }                        
    
                        }

                    }
                }

                /**
                 * 
                 * Load the existing rule summary, if any
                 * 
                 */
                for (const rule of segmentRules) {
                    const ruleSummary = await models.cms_segment_retailer_rules_summary.findOne({ retailer: retailer._id, segmentRule: rule._id }).lean();
                    if (ruleSummary) {
                        existingRuleSummary[rule._id] = ruleSummary.value;                        
                    }                    
                }

                /**
                 * 
                 * Condition evoluation
                 * 
                 */
                for (const rule of segmentRules) {

                    const { ruleType, target, from, to, qtyType } = rule;

                    const _from = from > 0 ? from : 0;
                    const _to = to > 0 ? to : 0;

                    const property = qtyType == SegmentRuleQtyType.QUANTITY ? "quantity" : "amount";
                    const summary = ruleType == SegmentRuleType.PRODUCT
                        ? summaryProducts
                        : ruleType == SegmentRuleType.BRAND
                            ? summaryBrands
                            : summaryCategories;

                    const targetSummary = summary.get(target);

                    if (targetSummary) {

                        let value = targetSummary[property];

                        /* Before evoluating, update the value with existing rule summary */
                        if(existingRuleSummary[rule._id]) {
                            value = (value + parseFloat(existingRuleSummary[rule._id]));
                        }

                        ruleResult.push(
                            (_from && _to && value >= _from && value <= _to) ||
                            (_from && !_to && value >= _from) ||
                            (!_from && _to && value <= _to) ||
                            (!_from && !_to)
                        );

                        try {
                            await models.cms_segment_retailer_rules_summary.findOneAndUpdate(
                                { 
                                    retailer: retailer._id, 
                                    segmentRule: rule._id 
                                },
                                {            
                                    ruleType,
                                    target,
                                    value
                                },
                                { upsert: true, new: true }
                            );                     
                        } catch (e) {
                            console.log(e);
                        }

                    } else {
                        /* If no aggrgation value for onle rule item, then consider it is a failed condition */
                        ruleResult.push(false);
                    }

                }                              

                if (ruleResult.length > 0 && ruleResult.every(Boolean)) {
                    segmentResults[segments[i]._id] = true; 
                } else {
                    segmentResults[segments[i]._id] = false; 
                }

            }

        }   
        
        return segmentResults;

    } catch(e) {
        throw e;
    }

};

const addRetailerToSegment = async (_segmentId, _retailerId) => {

    try {

        /* Check whether this retailer is blacklisted or not */
        const isBlacklisted = await models.cms_segment_blacklisted_retailer.findOne({
            retailer: _retailerId,
            segment: _segmentId
        }).lean();

        if (isBlacklisted) {
            /* No need to go further */
            return;
        }

        /* Check whether the retailer is already mapped to the segment */
        const alreadyMapped = await models.cms_segment_retailer.findOne({
            retailer: _retailerId,
            segment: _segmentId
        }).lean();

        if (alreadyMapped) {
            /* No need to go further */
            return;
        }

        /* Ok, good to mapping */
        const mapping = await new models.cms_segment_retailer({
            retailer: _retailerId,
            segment: _segmentId  
        });

        await mapping.save();

    } catch (e) {
        console.log(e);
    }

};

const updateRetailerMapping = async (retailer, segmentResults) => {

    try {

        if (!segmentResults) {
            return;
        }

        const segmentIds = Object.keys(segmentResults);
        for (let i = 0; i < segmentIds.length; i++) {
            if (segmentResults[segmentIds[i]]) {
                /* Retailer is eligible */
                await addRetailerToSegment(segmentIds[i], retailer._id);
            } else {    
                /* Retailer is not eligible */
                try {
                    await models.cms_segment_retailer.deleteOne({
                        retailer: retailer._id,
                        segment: segmentIds[i]  
                    });
                } catch (e) {
                    console.log(e);
                }
            }
        }

    } catch (e) {
        console.log(e);
    }

};

const processBatch = async (data) => {  

    const { orderId } = data;

    try {

        await init();

        /**
         * 
         * Retrive the original order from the mongo
         * 
         */
        const order = await models.cms_master_order.findOne({ orderId: orderId }).lean();

        if (order) {

            /**
             * 
             * Check if the retailer is already there in our master
             * If not import now
             * 
             */
            const retailer = await checkRetailerMaster(order.retailerId);

            if (retailer) {

                /**
                 * 
                 * Add, update or remove segment retailer summary
                 * Add, update or remove segment retailer rule summary
                 * 
                 */
                const segmentResults = await updateSummary(order, retailer);

                /**
                 * 
                 * Final step
                 * evoluate segment summaries and b ased on that add or remove retailer for a segment
                 * 
                 */
                await updateRetailerMapping(retailer, segmentResults);
                
            } else {
                throw new Error("Retailer not found for Id : "+ order.retailerId);
            }

        } else {
            throw new Error("Order not found for Id : "+ orderId);
        }     

    } catch (e) {        
        console.log(e);
    } finally {

        try {

            /* Remove the order from queue */
            await models.cms_segment_order_queue.deleteOne({ orderId: orderId });

            await Promise.all([MDBM.close(), MYDBM.close()]);
            process.exit(0);

        } catch (closeError) {
            console.error("Error during cleanup:", closeError);
        }

    }

};

processBatch(workerData);