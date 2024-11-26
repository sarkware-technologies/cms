import { workerData } from "worker_threads";
import MDBM from "../utils/mongo.js";
import MYDBM from "../utils/mysql.js";
import EM from "../utils/entity.js";
import { ObjectId } from "mongodb";
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

const processBatch = async (data) => {  

    const { orderId } = data; 

    try {

        await init();

        const order = await models.cms_master_order.findOne({ orderId: orderId }).lean();
        const orderItems = await models.cms_master_order_item.findOne({ orderId: orderId }).lean();
        const segments = await models.cms_segment.find({ status: true }).lean();

        for (let i = 0; i < segments.length; i++) {

            const segmentRules = await models.cms_segment_rule.find({ segment: segments[i]._id }).lean() || []; 
            const segmentSummary = await models.cms_segment_retailer_summary.findOne({ retailer: order.retailer, segment: segments[i]._id }).lean();
            
            if (segmentSummary) {

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

            }
            
            orderItems.forEach(item => {

                segmentRules.forEach(async rule => {

                    qty = 0;
                    const property = rule.qtyType === SegmentRuleQtyType.QUANTITY ? "quantity" : "amount";
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
                    }

                });

            });   
            
            

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