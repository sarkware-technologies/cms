import MYDBM from "../utils/mysql.js";
import EM from "../utils/entity.js";
import SegmentRuleType from "../enums/segment-rule-type.js";
import SegmentRuleQtyType from "../enums/segment-rule-qty-type.js";

export default class RetailerChecker {

    constructor () {

        this.segmentId = null;
        this.retailerId = null;
        this.models = [];

    }

    init = async () => {

        try {

            const modelNames = ["cms_master_order", "cms_master_order_item", "cms_segment", "cms_segment_rule",
                "cms_master_retailer", "cms_segment_retailer", "cms_segment_blacklisted_retailer", 
                "cms_segment_retailer_buffer", "cms_segment_build_log", "cms_segment_batch_options", 
                "cms_segment_retailer_summary", "cms_segment_retailer_rules_summary"
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

    checkSegmentRules = async(_retailer, _orders, _segment, _segmentRules) => {

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
    
                const orderItems = await this.models.cms_master_order_item.find(itemFilter).lean();
    
                orderItems.forEach(item => {
    
                    _segmentRules.forEach(rule => {
    
                        entry = null;
                        qty = 0;
    
                        if (rule.ruleType === SegmentRuleType.PRODUCT) {
    
                            if (
                                item.mdmProductCode && 
                                item.mdmProductCode.trim().toLowerCase() === rule.target.trim().toLowerCase()) {                             
    
                                entry = summaryProducts.get(rule.target) || { quantity: 0, amount: 0 };
                                qty = item.receivedQty || item.orderedQty || 0;
                                entry.quantity += qty;
                                entry.amount += qty * item.ptr;
    
                                summaryProducts.set(rule.target, entry);  
    
                            }                        
    
                        } else if (rule.ruleType === SegmentRuleType.BRAND) {
    
                            if (item.brandId && item.brandId == rule.target) { 
                                
                                entry = summaryBrands.get(rule.target) || { quantity: 0, amount: 0 };
                                qty = item.receivedQty || item.orderedQty || 0;
                                entry.quantity += qty;
                                entry.amount += qty * item.ptr;
    
                                summaryBrands.set(rule.target, entry);
                                                 
                            }                        
    
                        } else if (rule.ruleType === SegmentRuleType.CATEGORY) {
    
                            if (
                                item.category && 
                                item.category.trim().toLowerCase() === rule.target.trim().toLowerCase()) {  
                                
                                entry = summaryCategories.get(rule.target) || { quantity: 0, amount: 0 };
                                qty = item.receivedQty || item.orderedQty || 0;
                                entry.quantity += qty;
                                entry.amount += qty * item.ptr;
    
                                summaryCategories.set(rule.target, entry);
                                                       
                            }                        
    
                        }
    
                    });
    
                });
            }
    
            _segmentRules.forEach(async (rule) => {
    
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
    
                    try {
                        const sss = await this.models.cms_segment_retailer_rules_summary.findOneAndUpdate(
                            { 
                                retailer: _retailer._id, 
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
    
                }            
    
            });
    
            return ruleResult.length > 0 ? ruleResult.every(Boolean) : false;
            
        } catch (e) {
            console.log(e);
            return false;
        }   
    
    };

    importRetailer = async () => {

        try {
            
            if (!this.retailerId) {
                throw new Error("RetailerId parameter is missing");
            }    
            
            const retailer = await MYDBM.queryWithConditions(`
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
            , [this.retailerId]);
    
            if (Array.isArray(retailer) && retailer.length == 1) {
    
                const retailerObj = new this.models.cms_master_retailer(
                    {
                        Address1: retailer[0].Address1, 
                        Address2: retailer[0].Address2, 
                        City: retailer[0].City, 
                        Email: retailer[0].Email, 
                        IsAuthorized: retailer[0].IsAuthorized, 
                        MobileNumber: retailer[0].MobileNumber, 
                        Pincode: retailer[0].Pincode, 
                        RegionId: retailer[0].RegionId, 
                        RetailerId: retailer[0].RetailerId, 
                        RetailerName: retailer[0].RetailerName, 
                        StateId: retailer[0].StateId 
                    }
                );
    
                return await retailerObj.save();                              
    
            } else {
                throw new Error("Retailer not found for the RetailerId : "+ this.retailerId);
            }
    
        } catch (e) {
            console.log(e);
            throw e;
        }
    
    };
    
    checkRetailerEligibility = async (_retailer, _segment, _segmentRules) => {   
    
        try {
    
            const stateIds = [];
            const regionIds = [];
            const _storeIds = [];
            const filterOrderQuery = {};                
            const populateOrderQuery = [];            
            
            filterOrderQuery["retailerId"] = _retailer.RetailerId;
    
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
    
            let finalOrders = await this.models.cms_master_order.find(filterOrderQuery)
                .populate(populateOrderQuery)            
                .lean();
    
            if (populateOrderQuery.some(item => item.path === "store")) {
                finalOrders = finalOrders.filter(order => order.store && order.store.isAuthorized);
            }
            if (populateOrderQuery.some(item => item.path === "retailer")) {
                finalOrders = finalOrders.filter(order => order.retailer && order.retailer.isAuthorized);
            }
    
            const oIds = finalOrders.map((order) => {
    
                if (!stateIds.includes(order.stateId)) {
                    stateIds.push(order.stateId);
                }
                if (!regionIds.includes(order.regionId)) {
                    regionIds.push(order.regionId);
                }
                if (!_storeIds.includes(order.storeId)) {
                    _storeIds.push(order.storeId);
                }
                
                return new ObjectId(order._id)
    
            });
            
            const { from, latest } = finalOrders.reduce(
                (acc, order) => {
                    try {
                        // Parse the date if it exists
                        const orderDate = order?.orderDate ? new Date(order?.orderDate) : null;
            
                        // Validate the parsed date
                        if (!orderDate || isNaN(orderDate.getTime())) {
                            throw new Error(`Invalid date: ${order?.orderDate}`);
                        }
            
                        // Update the earliest date
                        if (!acc.from || orderDate < acc.from) {
                            acc.from = orderDate;
                        }
            
                        // Update the latest date
                        if (!acc.latest || orderDate > acc.latest) {
                            acc.latest = orderDate;
                        }
                    } catch (e) {
                        console.error(`Error processing date for order ${order.orderId}: ${e.message}`);
                    }
            
                    return acc;
                },
                { from: null, latest: null }
            );
            
            let ruleSucceed = true;
            if (_segmentRules.length > 0) {
                ruleSucceed = await this.checkSegmentRules(_retailer, oIds, _segment, _segmentRules);
            } 
            
            if (ruleSucceed && finalOrders.length > 0) {
                /* We are adding or updating the summary only when ther retailer is eligible */
                try {
                    await this.models.cms_segment_retailer_summary.findOneAndUpdate(
                        { retailer: _retailer._id, segment: _segment._id },
                        {
                            states: stateIds,
                            regions: regionIds,
                            stores: _storeIds,
                            dateFrom: from,
                            dateTo: latest
                        },
                        { upsert: true, new: true }
                    );
                } catch (e) {
                    /* Ignore */
                    console.log(e);
                }  
            } else {
                /* Retailer is not eligible, delete the segment summary if it already there */
                try {
                    await this.models.cms_segment_retailer_summary.deleteOne({ 
                        retailer: _retailer._id, 
                        segment: _segment._id 
                    });
                } catch (e) {
                    /* Ignore */
                    console.log(e);
                }  
            }
            
            return (ruleSucceed && finalOrders.length > 0)        
    
        } catch (e) {  
            console.log(e);
            return false;
        }
    
    };
    
    checkRetailerMaster = async (_retailerId, _segmentId) => {
    
        try {
    
            this.retailerId = _retailerId;
            this.segmentId = _segmentId;

            const retailer = await this.models.cms_master_retailer.findOne({ RetailerId: this.retailerId }).lean();
            if (!retailer) {
    
                /* retailer is not found */
    
                /* Step 1 - import */
                await this.importRetailer()
    
                /* Step 2 - build */
                try {
                    const segment = await this.models.cms_segment.findById(this.segmentId).lean();
                    if (segment) {
                        const segmentRules = await this.models.cms_segment_rule.find({ segment: this.segmentId }).lean();
                        await this.checkRetailerEligibility(retailer, segment, segmentRules);
                    }                
                } catch (e) {
                    console.log(e);
                } 
                
                /**
                 * 
                 * We allow if something breakjing while checking eligibility
                 * But we will return false if importing retailer itself failed
                 * 
                 */
    
            }
    
            return true;
    
        } catch (e) {
            console.log(e);                
            return false;
        }
    
    };

}