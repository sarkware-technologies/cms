import { workerData } from "worker_threads";
import MDBM from "../utils/mongo.js";
import MYDBM from "../utils/mysql.js";
import EM from "../utils/entity.js";
import { ObjectId } from "mongodb";
import SegmentGeography from "../enums/segment-geography.js";
import SegmentStoreStatus from "../enums/segment-store-status.js";
import SegmentRetailerStatus from "../enums/segment-retailer-status.js";
import SegmentRuleType from "../enums/segment-rule-type.js";
import SegmentRuleQtyType from "../enums/segment-rule-qty-type.js";
import { connection } from "mongoose";

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
            "cms_master_store"
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

    } catch (e) {
        console.log(e);
    }

    return retailer;

};

const checkOrderHeader = async (_order, _retailer) => {

    try {

        let storeOk = true;
        let regionOk = true;
        let stateOk = true;
        let retailerOk = true;
        let dateFromOk = true;
        let dateToOk = true;

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
                storeOk = _retailer.isAuthorized
            }
        } else {
            storeOk = false;
        }

        /* Check the retailer */
        if (_segment.retailerStatus == SegmentRetailerStatus.AUTHORIZED) {
            retailerOk = store.IsAuthorized
        }

        if (_segment.geography == SegmentGeography.STATE) {
            
            if (_segment.states && Array.isArray(_segment.states)) {
                stateOk = _segment.states.includes(_order.stateId);
            } else {
                stateOk = true;
            }

        } else {

            if (_segment.regions && Array.isArray(_segment.regions)) {
                regionOk = _segment.regions.includes(_order.regionId);
            } else {
                regionOk = true;
            }

        }

        return (storeOk && regionOk && stateOk && retailerOk && dateFromOk && dateToOk);

    } catch (e) {
        return false;        
    }

};

const updateSummary = async (orderId) => {

    try {

        let qty = 0;
        const order = await models.cms_master_order.findOne({ orderId: orderId }).lean();
        const orderItems = await models.cms_master_order_item.find({ orderId: orderId }).lean();
        const segments = await models.cms_segment.find({ status: true }).lean();
        const retailer = await checkRetailerMaster(order.retailerId);

        if (retailer) {

            for (let i = 0; i < segments.length; i++) {

                const segmentRules = await models.cms_segment_rule.find({ segment: segments[i]._id }).lean() || []; 
                let segmentSummary = await models.cms_segment_retailer_summary.findOne({ retailer: order.retailer, segment: segments[i]._id }).lean();
                
                /* Order header part */
                if (segmentSummary) {
    
                    /* This retailer is alredady on of this segment */
    
                    if (!segmentSummary.states.includes(order.stateId)) {
                        segmentSummary.states.push(order.stateId);
                    }
                    if (!segmentSummary.regions.includes(order.regionId)) {
                        segmentSummary.regions.push(order.regionId);
                    }
                    if (!segmentSummary.stores.includes(order.storeId)) {
                        segmentSummary.stores.push(order.storeId);
                    }
    
                    try {
    
                        const orderDate = new Date(order.orderDate); 
                        if (orderDate) {
    
                            if (orderDate < segmentSummary.dateFrom) {
                                segmentSummary.dateFrom = orderDate;
                            }
                            if (orderDate > segmentSummary.dateTo) {
                                segmentSummary.dateTo = orderDate;
                            }
    
                        }   
    
                    } catch (e) {
                        console.log(e)
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

                    /* He is not on this segment - check whether he is eligible or not */
                    const isOrderEligible = await checkOrderHeader(order, retailer);
                    if (isOrderEligible) {
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
                        segmentSummary = segmentSummary.toObject();
                    }                    
                    
                }

                /* Order item part */                
                orderItems.forEach(item => {
    
                    segmentRules.forEach(async rule => {
    
                        qty = 0;                        
                        let ruleSummary = await models.cms_segment_retailer_rules_summary.findOne({ retailer: order.retailer, segmentRule: rule._id }).lean();
                        
                        if (!ruleSummary) {
                            ruleSummary = {
                                retailer: order.retailer, 
                                segmentRule: rule._id,
                                ruleType: rule.ruleType,
                                target: rule.target,
                                value: 0
                            };
                        }
    
                        if (rule.ruleType === SegmentRuleType.PRODUCT) {
                            if (item.mdmProductCode && item.mdmProductCode === rule.target) { 
                                qty = item.receivedQty || item.orderedQty || 0;
                                if (rule.qtyType === SegmentRuleQtyType.QUANTITY) {
                                    ruleSummary.value = (parseInt(ruleSummary.value) + qty);
                                } else {
                                    ruleSummary.value = (parseInt(ruleSummary.value) + qty) * item.ptr;
                                }                        }
                        } else if (rule.ruleType === SegmentRuleType.BRAND) {
                            if (item.brandId && item.brandId === rule.target) { 
                                qty = item.receivedQty || item.orderedQty || 0;
                                if (rule.qtyType === SegmentRuleQtyType.QUANTITY) {
                                    ruleSummary.value = (parseInt(ruleSummary.value) + qty);
                                } else {
                                    ruleSummary.value = (parseInt(ruleSummary.value) + qty) * item.ptr;
                                }  
                            }
                        } else if (rule.ruleType === SegmentRuleType.CATEGORY) {
                            if (item.category && item.category === rule.target) {  
                                qty = item.receivedQty || item.orderedQty || 0;
                                if (rule.qtyType === SegmentRuleQtyType.QUANTITY) {
                                    ruleSummary.value = (parseInt(ruleSummary.value) + qty);
                                } else {
                                    ruleSummary.value = (parseInt(ruleSummary.value) + qty) * item.ptr;
                                }  
                            }
                        }
    
                        /* If the value is still zero then we can ignore */
                        if (ruleSummary.value > 0) {
                            await models.cms_segment_retailer_rules_summary.findOneAndUpdate(
                                { 
                                    retailer: order.retailer, 
                                    segmentRule: rule._id
                                },
                                {            
                                    ruleType: ruleSummary.ruleType,
                                    target: ruleSummary.target,
                                    value: ruleSummary.value
                                },
                                { upsert: true, new: true }
                            );  
                        } else {
                            /* delete it from the rule summary if already there */
                            await models.cms_segment_retailer_rules_summary.findOneAndUpdate({ 
                                retailer: order.retailer, 
                                segmentRule: rule._id
                            });
                        }
    
                    });
    
                }); 
    
            }

        } else {
            throw new Error("Retailer not found");
        }

        return retailer;

    } catch(e) {
        console.log(e);
        throw e;
    }

};

const addRetailerToSegment = async (_segmentId, _retailerId) => {

    try {

    } catch () {

    }

};

const processBatch = async (data) => {  

    const { orderId } = data; 

    try {

        await init();
        const retailer = await updateSummary(orderId);
        
        if (retailer) {
            const segments = await models.cms_segment.find({ status: true }).lean();
            for (let i = 0; i < segments.length; i++) {

                const retailerSummary = await models.cms_segment_retailer_summary.find({
                    retailer: retailer._id, 
                    segment: segments[i]._id
                }).lean();
                const segmentRules = await models.cms_segment_rule.find({ segment: segments[i]._id }).lean() || []; 

                if (segmentRules.length > 0) {

                    continue;
                }

                /* If it reaches here, then this segment doesn't has any rules */
                if (retailerSummary.length > 0) {
                    /* Now add this retailer to this segment */
                    await addRetailerToSegment(segments[i]._id, retailer._id);
                }

            }
        }                

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