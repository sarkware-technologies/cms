import EM from "../utils/entity.js";
import AP from "./api.js";
import MYDBM from "../utils/mysql.js";
import Utils from "../utils/utils.js";

import SegmentType from "../enums/segment-type.js";
import SegmentStatus from "../enums/segment-status.js";
import SegmentGeography from "../enums/segment-geography.js";
import SegmentRetailer from "../enums/segment-retailer-status.js";
import SegmentStoreStatus from "../enums/segment-store-status.js";
import SegmentRuleType from "../enums/segment-rule-type.js";
import SegmentQueueStatus from "../enums/segment-queue-status.js";

export default class SegmentService {

    constructor () {}

    list = async (_req) => {

        try {

            let _segments = [];
            const segmentModel = await EM.getModel("cms_segment");
            const segmentQueueModel = await EM.getModel("cms_segment_queue");

            const page = parseInt(_req.query.page) || 1;
            const skip = (page - 1) * parseInt(process.env.PAGE_SIZE);
            const limit = parseInt(process.env.PAGE_SIZE);

            const result = _req.query.result ? _req.query.result : "";
            const searchFor = _req.query.search ? _req.query.search : "";
            const searchFrom = _req.query.field ? _req.query.field : "";

            const filter = _req.query.filter ? _req.query.filter : "";
            const filterBy = _req.query.filter_by ? _req.query.filter_by : "";
            const filterType = _req.query.filter_type ? _req.query.filter_type : "";

            if (searchFrom !== "") {
                return this.search(_req, page, skip, limit, searchFrom, searchFor);
            }

            if (filter !== "") {
                if (filterType === "seeds") {
                    return this.groupSeed(_req, filter);
                } else {
                    return this.groupBy(_req, page, skip, limit, filter, filterBy);
                }
            }

            let _count = 0;

            if (result == "dynamic") {
                _count = await segmentModel.countDocuments({segmentType: SegmentType.DYNAMIC});
                _segments = await segmentModel.find({segmentType: SegmentType.DYNAMIC}).sort({ title: 1 }).populate("createdBy").populate("updatedBy").skip(skip).limit(limit).lean().exec();
            } else if (result == "static") {
                _count = await segmentModel.countDocuments({segmentType: SegmentType.STATIC});
                _segments = await segmentModel.find({segmentType: SegmentType.STATIC}).sort({ title: 1 }).populate("createdBy").populate("updatedBy").skip(skip).limit(limit).lean().exec();
            } else if (result == "progress") {
                _count = await segmentModel.countDocuments({segmentStatus: SegmentStatus.SCHEDULED});
                _segments = await segmentModel.find({status: SegmentStatus.PROGRESS}).sort({ title: 1 }).populate("createdBy").populate("updatedBy").skip(skip).limit(limit).lean().exec();
            } else if (result == "disabled") {
                _count = await segmentModel.countDocuments({status: false});
                _segments = await segmentModel.find({status: false}).sort({ title: 1 }).populate("createdBy").populate("updatedBy").skip(skip).limit(limit).lean().exec();
            } else {
                _count = await segmentModel.countDocuments({});
                _segments = await segmentModel.find({}).sort({ title: 1 }).populate("createdBy").populate("updatedBy").skip(skip).limit(limit).lean().exec();
            }
            
            for (let i = 0; i < _segments.length; i++) {
                
                const queueItem = await segmentQueueModel.findOne({segment: _segments[i]._id}).lean();

                if (queueItem) {
                    if (queueItem.queueStatus == SegmentQueueStatus.WAITING) {
                        _segments[i]["build"] = "Waiting";
                    } else if (queueItem.queueStatus == SegmentQueueStatus.BUILDING) {
                        _segments[i]["build"] = "Building";
                    } else {
                        _segments[i]["build"] = "Completed";
                    }
                } else {
                    _segments[i]["build"] = "Static";
                }

                
            }

            return Utils.response(_count, page, _segments);

        } catch (_e) {
            throw _e;
        }

    };

    listAll = async (_req) => {

        try {
            const segmentModel = await EM.getModel("cms_segment");
            return await segmentModel.find({}).sort({ title: 1 }).lean();
        } catch (e) {
            throw e;
        }

    };

    search = async (_req, _page, _skip, _limit, _field, _search) => {

        try {

            let _count = 0;
            let _segments = [];
            const segmentModel = await EM.getModel("cms_segment");

            if (result == "dynamic") {
                _count = await segmentModel.countDocuments({ segmentType: SegmentType.DYNAMIC, [_field]: { $regex: new RegExp(_search, 'i') }});
                _segments = await segmentModel.find({ segmentType: SegmentType.DYNAMIC, [_field]: { $regex: new RegExp(_search, 'i') } }).sort({ title: 1 }).populate("createdBy").populate("updatedBy").skip(_skip).limit(_limit).lean().exec();
            } else if (result == "static") {
                _count = await segmentModel.countDocuments({ segmentType: SegmentType.STATIC, [_field]: { $regex: new RegExp(_search, 'i') }});
                _segments = await segmentModel.find({ segmentType: SegmentType.STATIC, [_field]: { $regex: new RegExp(_search, 'i') } }).sort({ title: 1 }).populate("createdBy").populate("updatedBy").skip(_skip).limit(_limit).lean().exec();
            } else if (result == "progress") {
                _count = await segmentModel.countDocuments({ segmentStatus: SegmentStatus.SCHEDULED, [_field]: { $regex: new RegExp(_search, 'i') }});
                _segments = await segmentModel.find({ status: SegmentStatus.PROGRESS, [_field]: { $regex: new RegExp(_search, 'i') } }).sort({ title: 1 }).populate("createdBy").populate("updatedBy").skip(_skip).limit(_limit).lean().exec();
            } else if (result == "disabled") {  console.log("in the disabled block");
                _count = await segmentModel.countDocuments({ status: SegmentStatus.DISABLED, [_field]: { $regex: new RegExp(_search, 'i') } });
                _segments = await segmentModel.find({ status: SegmentStatus.DISABLED, [_field]: { $regex: new RegExp(_search, 'i') }}).sort({ title: 1 }).populate("createdBy").populate("updatedBy").skip(_skip).limit(_limit).lean().exec();
            } else {
                _count = await segmentModel.countDocuments({[_field]: { $regex: new RegExp(_search, 'i') }});
                _segments = await segmentModel.find({ [_field]: { $regex: new RegExp(_search, 'i') } }).sort({ title: 1 }).populate("createdBy").populate("updatedBy").skip(_skip).limit(_limit).lean().exec();
            }

            return Utils.response(_count, _page, _segments);

        } catch (_e) {
            throw _e;
        }

    };

    groupSeed = async(_req, _field) => { 

        try {
            const segmentModel = await EM.getModel("cms_segment");
            return await segmentModel.distinct(_field).exec();
        } catch (_e) {

            throw _e;
        }

    };

    groupBy = async(_req, _page, _skip, _limit, _field, _match) => { 

        try {

            let query = {};
            if (_match) {
                query[_field] = { $in: _match.split('|') };
            }

            const segmentModel = await EM.getModel("cms_segment");
            const _count = await segmentModel.countDocuments(query);
            const _segments = await segmentModel.find(query).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();

            return Utils.response(_count, _page, _segments);

        } catch (_e) {
            throw _e;
        }

    };

    count = async (_req) => {

        try {
            const segmentModel = await EM.getModel("cms_segment");
            return await segmentModel.countDocuments({});
        } catch (_e) {
            throw _e;
        }

    };

    get = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Segment id is missing");
        }

        try {
            const segmentModel = await EM.getModel("cms_segment");
            const segmentRuleModel = await EM.getModel("cms_segment_rule");
            
            const segment = await segmentModel.findOne({ _id: _req.params.id }).lean();
            segment["rules"] = await segmentRuleModel.find({ segment: _req.params.id }).lean();
            return segment;
        } catch (_e) {
            throw _e;
        }

    };

    update = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Segment id is missing");
        }

        const errors = [];
        const { body } = _req;      
        const segmentModel = await EM.getModel("cms_segment");  
        const segmentRetailerModel = await EM.getModel("cms_segment_retailer");  
        const segmentRuleModel = await EM.getModel("cms_segment_rule");
        

        if (!body) {
            throw new Error('Request body is required');
        }

        try {

            if (body.rules) {
                /* Before anything - clear the rules (even if it is for static segment) */
                await segmentRuleModel.deleteMany({ segment: _req.params.id });
            }

            if (body.retailers) {
                /* Also clear the retailer list */
                await segmentRetailerModel.deleteMany({ segment: _req.params.id });
            }            

            if (body.segmentType == SegmentType.DYNAMIC) {
                if (body.rules && Array.isArray(body.rules)) {
                    /** Insert the rules */
                    for (let i = 0; i < body.rules.length; i++) {
                        try {
                            const ruleModel = new segmentRuleModel({...body.rules[i], segment: _req.params.id, createdBy: body["createdBy"]});
                            await ruleModel.save();
                        } catch (e) {
                            console.log(e);
                            errors.push(e.message);
                        }
                    }
                }                
            } else {
                if (body.retailers && Array.isArray(body.retailers)) {
                    await Promise.all(body.retailers.map(async (retilerId) => {
                        try {     
                            const srModel = new segmentRetailerModel({
                                segment: segment._id,
                                retailer: retilerId,
                                createdBy: body["createdBy"]
                            });          
                            await srModel.save();
                        } catch (e) {
                            console.log(e);
                            errors.push(e.message);
                        }
                    }));
                }
            }

            const updatedSegment = await segmentModel.findByIdAndUpdate(_req.params.id, { $set: { ..._req.body, updatedBy: _req.user._id } }, { runValidators: true, new: true });

            if (body.segmentType == SegmentType.DYNAMIC) {
                
                const segmentQueueModel = await EM.getModel("cms_segment_queue");
                const alreadyInQueue = await segmentQueueModel.findOne({ segment: _req.params.id, queueStatus: SegmentQueueStatus.WAITING }).lean();

                if (!alreadyInQueue) {
                    const segmentQueue = new segmentQueueModel({
                        segment: _req.params.id,
                        queueStatus: SegmentQueueStatus.WAITING
                    });                
                    await segmentQueue.save();
                }

            }

            return updatedSegment;

        } catch (_e) {
            throw _e;
        }

    };

    delete = async (_req) => {
        
        if (!_req.params.id) {
            throw new Error("Segment id is missing");
        }

        try {

            const segmentModel = await EM.getModel("cms_segment"); 
            const segmentRuleModel = await EM.getModel("cms_segment_rule");
            const segmentRetailerModel = await EM.getModel("cms_segment_retailer"); 
            const segmentRetailerExclusionModel = await EM.getModel("cms_segment_retailer_exclusion"); 
            const segmentRetailerInclusionModel = await EM.getModel("cms_segment_retailer_inclusion"); 
            

            await segmentRuleModel.deleteMany({ segment: _req.params.id });            
            await segmentRetailerModel.deleteMany({ segment: _req.params.id });
            await segmentRetailerExclusionModel.deleteMany({ segment: _req.params.id });
            await segmentRetailerInclusionModel.deleteMany({ segment: _req.params.id });

            return await segmentModel.deleteOne({ _id: _req.params.id });            

        } catch (_e) {
            throw _e;
        }

    };

    create = async (_req) => {

        try {

            const errors = [];
            const { body } = _req;
            const segmentModel = await EM.getModel("cms_segment"); 
            const segmentRetailerModel = await EM.getModel("cms_segment_retailer");
            const segmentRuleModel = await EM.getModel("cms_segment_rule");

            if (!body) {
                throw new Error('Request body is required');
            }

            body["createdBy"] = _req.user._id;
            const model = new segmentModel(body);
            const segment = await model.save();     

            if (segment.segmentType == SegmentType.STATIC) {

                if (Array.isArray(body.retailers)) {
                    await Promise.all(body.retailers.map(async (retilerId) => {
                        try {     
                            const srModel = new segmentRetailerModel({
                                segment: segment._id,
                                retailer: retilerId,
                                createdBy: body["createdBy"]
                            });          
                            await srModel.save();
                        } catch (e) {
                            console.log(e);
                            errors.push(e.message);
                        }
                    }));
                }
                
            } else {

                const rules = [...body.rules];                

                /* It's a dynamic segment */
                for (let i = 0; i < rules.length; i++) {
                    try {
                        const ruleModel = new segmentRuleModel({...rules[i], segment: segment._id, createdBy: body["createdBy"]});
                        await ruleModel.save();
                    } catch (e) {
                        console.log(e);
                        errors.push(e.message);
                    }
                }                 
                
                const segmentQueueModel = await EM.getModel("cms_segment_queue");
                const segmentQueue = new segmentQueueModel({
                    segment: segment._id,
                    queueStatus: SegmentQueueStatus.WAITING
                });
                await segmentQueue.save();                

            }

            if (errors.length == 0) {
                return {
                    status: true,
                    message: "Segment "+ segment.title +" is created successfully",
                    payload: segment
                };
            } else {
                return {
                    status: false,
                    message: errors                    
                };
            }

        } catch (e) {

            if (e.name === 'ValidationError') {
                return {
                    status: false,
                    message: e.errors
                };
            }
    
            return {
                status: false,
                message: e.message || 'An error occurred while creating segment'
            };

        }

    };

    listSegmentRetailers = async (_req) => {

        try {

            if (!_req.params.id) {
                throw new Error("Segment id is missing");
            }

            const limit = 10;
            const page = parseInt(_req.query.page) || 1;
            const skip = (page - 1) * limit;            

            const searchFor = _req.query.search ? _req.query.search : "";
            const searchFrom = _req.query.field ? _req.query.field : "";

            const filter = _req.query.filter ? _req.query.filter : "";
            const filterBy = _req.query.filter_by ? _req.query.filter_by : "";
            const filterType = _req.query.filter_type ? _req.query.filter_type : "";

            if (searchFrom !== "") {
                return this.retailerSearch(_req, page, skip, limit, searchFrom, searchFor);
            }

            if (filter !== "") {
                if (filterType === "seeds") {
                    return this.retailerGroupSeed(_req, filter);
                } else {
                    return this.retailerGroupBy(_req, page, skip, limit, filter, filterBy);
                }
            }

            const retailerModel = await EM.getModel("cms_master_retailer");
            const segmentRetailerModel = await EM.getModel("cms_segment_retailer");

            const _count = await segmentRetailerModel.countDocuments({segment: _req.params.id});
            const _retailers = await segmentRetailerModel.find({segment: _req.params.id}).populate("retailer").skip(skip).limit(limit).lean().exec();
            
            const _result = _retailers.map((_item) => _item.retailer);

            return Utils.response(_count, page, _result, 10);

        } catch (_e) {
            throw _e;
        }

    };

    listInclusiveRetailers = async (_req) => {

        try {

            if (!_req.params.id) {
                throw new Error("Segment id is missing");
            }

            const limit = 10;
            const page = parseInt(_req.query.page) || 1;
            const skip = (page - 1) * parseInt(process.env.PAGE_SIZE);
            
            const searchFor = _req.query.search ? _req.query.search : "";
            const searchFrom = _req.query.field ? _req.query.field : "";

            const filter = _req.query.filter ? _req.query.filter : "";
            const filterBy = _req.query.filter_by ? _req.query.filter_by : "";
            const filterType = _req.query.filter_type ? _req.query.filter_type : "";

            if (searchFrom !== "") {
                return this.retailerSearch(_req, page, skip, limit, searchFrom, searchFor);
            }

            if (filter !== "") {
                if (filterType === "seeds") {
                    return this.retailerGroupSeed(_req, filter);
                } else {
                    return this.retailerGroupBy(_req, page, skip, limit, filter, filterBy);
                }
            }

            let _retailers = [];   
            const segmentRetailerModel = await EM.getModel("cms_segment_retailer");              
            const segmentRetailers = await segmentRetailerModel.find({segment: _req.params.id}).select("retailer").lean();
            
            // Extract retailer ids into an array
            const retailerIds = segmentRetailers.map(record => record.retailer);           

            if (retailerIds.length > 0) {
                const retailerModel = await EM.getModel("retailer");
                if (retailerModel) {
                    _retailers = await retailerModel.find({ RetailerId: { $in: retailerIds } }).skip(skip).limit(limit).lean();
                }                
            }      

            return Utils.response(retailerIds.length, 1, _retailers);

        } catch (_e) {
            throw _e;
        }

    };

    listExclusiveRetailers = async (_req) => {

    };

    retailerInclusiveSearch = async (_req, _page, _skip, _limit, _field, _search) => {

        try {

            const segmentRetailerInclusionModel = await EM.getModel("cms_segment_retailer_inclusion");
            segmentRetailerInclusionModel.aggregate([
                {
                    $lookup: {
                        from: 'cms_segment_retailer_inclusion',
                        localField: 'retailer',
                        foreignField: '_id',
                        as: 'retailers'
                    }
                },
                { 
                    $unwind: '$retailers'
                },
                {
                    $match: { 'retailers.RetailerName': _search }
                },
                {
                    $project: {                     
                        'retailers.RetailerId': 1,   
                        'retailers.RetailerName': 1,                        
                        'retailers.MobileNumber': 1
                    }
                }
            ]);

        } catch (_e) {
            throw _e;
        }

    };

    retailerSearch = async (_req, _page, _skip, _limit, _field, _search) => {

        try {

            let _count = 0;
            let _retailers = [];
            const retailerModel = await EM.getModel("retailer");
            const segmentRetailerModel = await EM.getModel("cms_segment_retailer");

            if (retailerModel) {

                const segmentRetailers = await segmentRetailerModel.find({segment: _req.params.id}).select("retailer").lean();            
                const retailerIds = segmentRetailers.map(record => record.retailer);

                _count = await retailerModel.countDocuments({ 
                    RetailerId: { $in: retailerIds }, 
                    [_field]: { $regex: new RegExp(_search, 'i') } 
                });
                _retailers = await retailerModel.find({ 
                    RetailerId: { $in: retailerIds }, 
                    [_field]: { $regex: new RegExp(_search, 'i') } 
                }).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();
            }

            return Utils.response(_count, _page, _retailers);

        } catch (_e) {
            throw _e;
        }

    };

    retailerGroupSeed = async(_req, _field) => { 

        try {
            let _seeds = [];
            const retailerModel = await EM.getModel("retailer");
            if (retailerModel) {
                _seeds = await retailerModel.distinct(_field).exec();
            }
            return _seeds;
        } catch (_e) {
            throw _e;
        }

    };

    retailerGroupBy = async(_req, _page, _skip, _limit, _field, _match) => { 

        try {

            let query = {};
            if (_match) {
                query[_field] = { $in: _match.split('|') };
            }

            let _count = 0;
            let _retailers = [];
            const retailerModel = await EM.getModel("retailer");
            if (retailerModel) {
                _count = await retailerModel.countDocuments(query);
                _retailers = await retailerModel.find(query).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();
            }

            return Utils.response(_count, _page, _retailers);

        } catch (_e) {
            throw _e;
        }

    };

    addRetailersToSegment = async (_req) => {

        try {

            const { body } = _req;

            if (!_req.params.id) {
                throw new Error("Segment id is missing");
            }

            if (!body) {
                throw new Error('Request body is required');
            }

            let mapping = null;
            const segmentModel = await EM.getModel("cms_segment"); 
            const segmentRetailerModel = await EM.getModel("cms_segment_retailer");
            const segmentRetailerInclusionModel = await EM.getModel("cms_segment_retailer_inclusion");

            const segment = await segmentModel.findById(_req.params.id).lean();
            
            if (segment) {
                if (segment.segmentType == SegmentType.STATIC) {

                    /* It's a static segment */

                    mapping = await Promise.all(body.map(async (retilerId) => {
                        try {  
                            
                            const exist = await segmentRetailerModel.find({segment: segment._id, retailer: retilerId,}).lean();
                            if (!exist || (Array.isArray(exist) && exist.length == 0)) {
                                const srModel = new segmentRetailerModel({
                                    segment: segment._id,
                                    retailer: retilerId,
                                    createdBy: body["createdBy"]
                                });          
                                return await srModel.save();
                            }

                        } catch (e) {
                            console.log(e);
                        }
                    }));
                } else {

                    /* It's a dynamic segment - add it to inclusion list */
                    mapping = await Promise.all(body.map(async (retilerId) => {
                        try { 
                            
                            const exist = await segmentRetailerInclusionModel.find({segment: segment._id, retailer: retilerId,}).lean();
                            if (!exist || (Array.isArray(exist) && exist.length == 0)) {
                                const srModel = new segmentRetailerInclusionModel({
                                    segment: segment._id,
                                    retailer: retilerId,
                                    createdBy: body["createdBy"]
                                });          
                                return await srModel.save();
                            }

                        } catch (e) {
                            console.log(e);
                        }
                    }));

                }
            }               

            return mapping;

        } catch (_e) {
            throw _e;
        }

    };

    deleteRetailersFromSegment = async (_req) => {

        try {

            const { body } = _req;

            if (!_req.params.id) {
                throw new Error("Segment id is missing");
            }

            if (!body) {
                throw new Error('Request body is required');
            }

            let deleted = null;
            const segmentModel = await EM.getModel("cms_segment"); 
            const segmentRetailerModel = await EM.getModel("cms_segment_retailer");
            const segmentRetailerExclusionModel = await EM.getModel("cms_segment_retailer_exclusion"); 
            const segmentRetailerInclusionModel = await EM.getModel("cms_segment_retailer_inclusion");

            const segment = await segmentModel.findById(_req.params.id).lean();
            
            if (segment) {
                if (segment.segmentType == SegmentType.STATIC) {

                    /* It's a static segment */
                    deleted = await segmentRetailerModel.deleteMany({retailer: { $in: body}});

                } else {  

                    /* It's a dynamic segment - add it to inclusion list */
                    deleted = await segmentRetailerInclusionModel.deleteMany({retailer: { $in: body}});

                    await Promise.all(body.map(async (retilerId) => {
                        try { 
                            
                            const exist = await segmentRetailerExclusionModel.find({segment: segment._id, retailer: retilerId,}).lean();
                            if (!exist || (Array.isArray(exist) && exist.length == 0)) {
                                const sreModel = new segmentRetailerExclusionModel({
                                    segment: segment._id,
                                    retailer: retilerId,
                                    createdBy: body["createdBy"]
                                });          
                                return await sreModel.save();
                            }

                        } catch (e) {
                            console.log(e);
                        }
                    }));

                }
            }

            return deleted;

        } catch (_e) {
            throw _e;
        }

    };

    prepareRetailersForSegment = async (_segmentId) => {

        try {

            const segmentModel = await EM.getModel("cms_segment"); 
            const retailerModel = await EM.getModel("cms_master_retailer");
            const segment = await segmentModel.findById(_segmentId).lean();

            if (segment) {

                const retailers = await retailerModel.find({}).select({ _id: 1, RetailerId: 1, RegionId: 1, StateId: 1, IsAuthorized: 1 }).lean();



            }

        } catch (e) {
            console.log(e);
        }

    };

    prepareRetailersForSegment = async (_segmentId) => {

        try {

            const segmentModel = await EM.getModel("cms_segment"); 
            const orderModel = await EM.getModel("cms_master_order");
            const retailerModel = await EM.getModel("cms_master_retailer");
            const segment = await segmentModel.findById(_segmentId).lean();

            if (segment) {

                const filterOrderQuery = {};
                const filterOrderItemQuery = {};
                const populateOrderQuery = [];
                const populateOrderItemQuery = [];

                if (segment.fromDate && segment.toDate) {
                    filterOrderQuery["orderDate"] = { $gte: new Date(segment.fromDate), $lte: new Date(segment.toDate) };
                } else {
                    if (segment.fromDate) {
                        filterOrderQuery["orderDate"] = { $gte: new Date(segment.fromDate) };
                    }    
                    if (segment.toDate) {
                        filterOrderQuery["orderDate"] = { $lte: new Date(segment.toDate) };
                    }
                }

                if ((segment.geography == SegmentGeography.STATE) && (Array.isArray(segment.states) && segment.states.length > 0 )) {
                    filterOrderQuery["stateId"] = { $in: segment.states };
                }

                if ((segment.geography == SegmentGeography.REGION) && (Array.isArray(segment.regions) && segment.regions.length > 0 )) {
                    filterOrderQuery["regionId"] = { $in: segment.regions };
                }

                if (Array.isArray(segment.orderStatus) && segment.orderStatus.length > 0) {

                    const oStatus = [];
                    for (let i = 0; i < segment.orderStatus.length; i++) {
                        if (segment.orderStatus[i] == 1) {
                            oStatus.push("Placed");
                        } else if (segment.orderStatus[i] == 2) {
                            oStatus.push("Processed");
                        } else {
                            oStatus.push("Uploaded");
                        }                        
                    }

                    filterOrderQuery["orderStatus"] = { $in: oStatus };
                }

                if (segment.retailerStatus == SegmentRetailer.AUTHORIZED) {
                    populateOrderQuery.push({path: "retailer", match: { isAuthorized: true }});
                }

                if (segment.storeStatus == SegmentStoreStatus.AUTHORIZED) {
                    populateOrderQuery.push({path: "store", match: { isAuthorized: true }});
                }

                if (Array.isArray(segment.excludedStores) && segment.excludedStores.length > 0) {
                    filterOrderQuery["store"] = { $nin: segment.excludedStores };
                }

                const orders = await orderModel.find(filterOrderQuery).select("_id").lean();
                this.prepareOrderItems(orders, segment);                

            }

        } catch (e) {
            console.log(e);
        }

    };

    prepareOrderItems = async (_orders, _segment) => {

        try {

            const summaryProducts = {};
            const summaryBrands = {};
            const summaryCategories = {};
            
            let orderItems = [];
            const orderList = [];
            const orderItemModel = await EM.getModel("cms_master_order_item");
            const segmentRetailerModel = await EM.getModel("cms_segment_retailer");
            const segmentRuleModel = await EM.getModel("cms_segment_rule");

            const orderPerBatch = 1000;
            const totalBatches = Math.ceil(_orders.length / orderPerBatch);
            const rules = await segmentRuleModel.find({segment: _segment._id});

            console.log("Total order batch : "+ totalBatches);

            for (let i = 0; i < totalBatches; i++) {

                console.log("Processing Batch : "+ (i + 1));

                const orderBatch = _orders.slice(i, i + orderPerBatch);
                orderItems = await orderItemModel.find({order: { $in: orderBatch }, companyId: { $in: _segment.companies } }).populate("order").lean().exec();

                console.log("Order Item Found : "+ orderItems.length);

                if (rules.length > 0) {

                    for (let j = 0; j < orderItems.length; j++) {

                        /* Aggregate */
                        for (let k = 0; k < rules.length; k++) {
    
                            if (rules[k].ruleType == SegmentRuleType.PRODUCT) {
    
                                if (orderItems[j].mdmProductCode && rules[k].target == orderItems[j].mdmProductCode) {
                                    
                                    if (!summaryProducts[orderItems[j].mdmProductCode]) {
                                        summaryProducts[orderItems[j].mdmProductCode] = {
                                            quantity: 0,
                                            amount: 0
                                        };                                    
                                    }
    
                                    if (orderItems[j].receivedQty) {
                                        summaryProducts[orderItems[j].mdmProductCode].quantity = summaryProducts[orderItems[j].mdmProductCode].quantity + orderItems[j].receivedQty;
                                        summaryProducts[orderItems[j].mdmProductCode].amount = summaryProducts[orderItems[j].mdmProductCode].amount + ( orderItems[j].receivedQty * orderItems[j].ptr );
                                    } else {
                                        summaryProducts[orderItems[j].mdmProductCode].quantity = summaryProducts[orderItems[j].mdmProductCode].quantity + orderItems[j].orderedQty;
                                        summaryProducts[orderItems[j].mdmProductCode].amount = summaryProducts[orderItems[j].mdmProductCode].amount + ( orderItems[j].orderedQty * orderItems[j].ptr );
                                    }
    
                                }                            
    
                            } else if (rules[k].ruleType == SegmentRuleType.BRAND) {
    
                                if (!summaryBrands[orderItems[j].brandId]) {
                                    summaryBrands[orderItems[j].brandId] = {
                                        quantity: 0,
                                        amount: 0
                                    };                                    
                                }
    
                                if (orderItems[j].receivedQty) {
                                    summaryBrands[orderItems[j].brandId].quantity = summaryBrands[orderItems[j].brandId].quantity + orderItems[j].receivedQty;
                                    summaryBrands[orderItems[j].brandId].amount = summaryBrands[orderItems[j].brandId].amount + ( orderItems[j].receivedQty * orderItems[j].ptr );
                                } else {
                                    summaryBrands[orderItems[j].brandId].quantity = summaryBrands[orderItems[j].brandId].quantity + orderItems[j].orderedQty;
                                    summaryBrands[orderItems[j].brandId].amount = summaryBrands[orderItems[j].brandId].amount + ( orderItems[j].orderedQty * orderItems[j].ptr );
                                }
    
                            } else {
    
                                /* Must be for product category */
                                if (!summaryCategories[orderItems[j].category]) {
                                    summaryCategories[orderItems[j].category] = {
                                        quantity: 0,
                                        amount: 0
                                    };                                    
                                }
    
                                if (orderItems[j].receivedQty) {
                                    summaryCategories[orderItems[j].category].quantity = summaryCategories[orderItems[j].category].quantity + orderItems[j].receivedQty;
                                    summaryCategories[orderItems[j].category].amount = summaryCategories[orderItems[j].category].amount + ( orderItems[j].receivedQty * orderItems[j].ptr );
                                } else {
                                    summaryCategories[orderItems[j].category].quantity = summaryCategories[orderItems[j].category].quantity + orderItems[j].orderedQty;
                                    summaryCategories[orderItems[j].category].amount = summaryCategories[orderItems[j].category].amount + ( orderItems[j].orderedQty * orderItems[j].ptr );
                                }
    
                            }
    
                        }
    
                    } 




                }

            }

            if (rules.length > 0) {

                const evolutions = [];
                for (let i = 0; i < rules.length; i++) {

                    

                }

            } else {

                let segmentRetailer = null;
                for (let j = 0; j < orderItems.length; j++) {
                    segmentRetailer = new segmentRetailerModel({
                        segment: _segment._id,
                        retailer: orderItems[j].order.retailer
                    });
                    await segmentRetailer.save();
                }
            }  

            console.log(summaryProducts);
            console.log(summaryBrands);
            console.log(summaryCategories);

        } catch (e) {
            console.log(e);
        }

    };

    evoluateSegmentRules = async () => {

    };

    init = async () => {

        AP.event.on('on_segment_segment_multi_select_list', async (_params, callback) => {

            try {

                const [_req] = _params;   
                const _entity = _req.query.entity;
                const segmentModel = await EM.getModel("cms_segment"); 

                if (_entity) {

                    if (_entity === "segment") {  
                        callback(await segmentModel.find().lean(), null);
                    } else if (_entity === "brands") {
                        callback(await MYDBM.query(`select * from brands b where b.IsDeleted = 0 AND b.IsApproved = 1`), null);
                    } else if (_entity === "mdms") { 
                        callback(await MYDBM.query(`SELECT DISTINCT mspm.MDM_PRODUCT_CODE, 
                                                    CONCAT(mspm.MDM_PRODUCT_CODE, ' - ', mgpm.PRODUCT_NAME) AS ProductName
                                                    FROM mdm_store_product_master mspm
                                                    INNER JOIN prproduct_mdm_product_linkage pmpl 
                                                    ON pmpl.PRODUCT_CODE = mspm.PRODUCT_CODE 
                                                    INNER JOIN mdm_golden_product_master mgpm 
                                                    ON pmpl.MDM_PRODUCT_CODE = mgpm.MDM_PRODUCT_CODE;`), null);
                    } else if (_entity === "categories") { 
                        callback(await MYDBM.query("select DISTINCT(s.Category) as Name from storeproducts s"), null);                         
                    } else if (_entity === "companies") {
                        callback(await MYDBM.query("select * from companies c where c.IsDeleted = 0 AND c.IsApproved = 1"), null);
                    } else if (_entity === "cities") {
                        callback(await MYDBM.query("select DISTINCT r.City from retailers r"), null);
                    } else {                      
                        const targetModel = await EM.getModel(_entity);
                        if (targetModel) {

                            const selectObject = {};
                            let selectedFields = [];
                            const selectedFieldsParam = _req.query.select ? _req.query.select : null;
                            
                            if (selectedFieldsParam) {
                                selectedFields = selectedFieldsParam.split('|');
                                selectedFields.forEach(field => {
                                    selectObject[field] = 1;
                                });
                            }
                            
                            callback(await targetModel.find().select(selectObject).lean(), null);
                        }
                    }
                    
                }

            } catch (_e) { console.log(_e);
                callback(null, _e);
            }

        });

    };

    buildSegment = async (_req) => {

        try {

            /** */

            if (await this.checkImporterStatus(ImportType.STORE_IMPORTER)) {
                return { status: true, message: "Store importer process is already running" };
            }

            if (_req.body) {
                await this.persistBatchOptions(_req.body);
            }

            if (!this.storeImporterProcess) {
                this.storeImporterProcess = fork('./src/importers/store-process.js');        
                
                this.storeImporterProcess.once('exit', (code) => {
                    console.log(`StoreImporter process exited with code ${code}`);
                    this.storeImporterProcess = null;
                });

                this.storeImporterProcess.once('error', (error) => {
                    console.error(`Error in StoreImporter process: ${error}`);
                    this.storeImporterProcess = null;
                });
            }

            this.storeImporterProcess.send({ command: 'start' });
            return { status: true, message: "Store importer process started" };

        } catch (e) {
            throw e;
        }

    };

    buildStatus = async (_req) => {

    };

}