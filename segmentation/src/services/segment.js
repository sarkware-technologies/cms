import ModuleModel from "../models/module.js";
import EntityModel from "../models/entity.js";
import EM from "../utils/entity.js";
import AP from "./api.js";

import Utils from "../utils/utils.js";
import SegmentModel from "../models/segment.js";
import SegmentRetailerModel from "../models/segment-retailer.js";
import SegmentType from "../enums/segment-type.js";
import SegmentRetailerInclusionModel from "../models/segment-retailer-inclusion.js";
import SegmentRetailerExclusionModel from "../models/segment-retailer-exclusion.js";
import SegmentRuleModel from "../models/segment-rules.js";
import SegmentStatus from "../enums/segment-status.js";
import SegmentGeography from "../enums/segment-geography.js";

export default class SegmentService {

    constructor () {}

    list = async (_req) => {

        try {

            let _segments = [];

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
                _count = await SegmentModel.countDocuments({segmentType: SegmentType.DYNAMIC});
                _segments = await SegmentModel.find({segmentType: SegmentType.DYNAMIC}).sort({ title: 1 }).populate("createdBy").populate("updatedBy").skip(skip).limit(limit).lean().exec();
            } else if (result == "static") {
                _count = await SegmentModel.countDocuments({segmentType: SegmentType.STATIC});
                _segments = await SegmentModel.find({segmentType: SegmentType.STATIC}).sort({ title: 1 }).populate("createdBy").populate("updatedBy").skip(skip).limit(limit).lean().exec();
            } else if (result == "progress") {
                _count = await SegmentModel.countDocuments({segmentStatus: SegmentStatus.SCHEDULED});
                _segments = await SegmentModel.find({status: SegmentStatus.PROGRESS}).sort({ title: 1 }).populate("createdBy").populate("updatedBy").skip(skip).limit(limit).lean().exec();
            } else if (result == "disabled") {
                _count = await SegmentModel.countDocuments({status: false});
                _segments = await SegmentModel.find({status: false}).sort({ title: 1 }).populate("createdBy").populate("updatedBy").skip(skip).limit(limit).lean().exec();
            } else {
                _count = await SegmentModel.countDocuments({});
                _segments = await SegmentModel.find({}).sort({ title: 1 }).populate("createdBy").populate("updatedBy").skip(skip).limit(limit).lean().exec();
            }
            
            return Utils.response(_count, page, _segments);

        } catch (e) {
            throw _e;
        }

    };

    listAll = async (_req) => {

        try {
            return await SegmentModel.find({}).sort({ title: 1 }).lean();
        } catch (e) {
            throw e;
        }

    };

    search = async (_req, _page, _skip, _limit, _field, _search) => {

        try {

            let _count = 0;
            let _segments = [];  console.log("Result : "+ result);

            if (result == "dynamic") {
                _count = await SegmentModel.countDocuments({ segmentType: SegmentType.DYNAMIC, [_field]: { $regex: new RegExp(_search, 'i') }});
                _segments = await SegmentModel.find({ segmentType: SegmentType.DYNAMIC, [_field]: { $regex: new RegExp(_search, 'i') } }).sort({ title: 1 }).populate("createdBy").populate("updatedBy").skip(_skip).limit(_limit).lean().exec();
            } else if (result == "static") {
                _count = await SegmentModel.countDocuments({ segmentType: SegmentType.STATIC, [_field]: { $regex: new RegExp(_search, 'i') }});
                _segments = await SegmentModel.find({ segmentType: SegmentType.STATIC, [_field]: { $regex: new RegExp(_search, 'i') } }).sort({ title: 1 }).populate("createdBy").populate("updatedBy").skip(_skip).limit(_limit).lean().exec();
            } else if (result == "progress") {
                _count = await SegmentModel.countDocuments({ segmentStatus: SegmentStatus.SCHEDULED, [_field]: { $regex: new RegExp(_search, 'i') }});
                _segments = await SegmentModel.find({ status: SegmentStatus.PROGRESS, [_field]: { $regex: new RegExp(_search, 'i') } }).sort({ title: 1 }).populate("createdBy").populate("updatedBy").skip(_skip).limit(_limit).lean().exec();
            } else if (result == "disabled") {  console.log("in the disabled block");
                _count = await SegmentModel.countDocuments({ status: SegmentStatus.DISABLED, [_field]: { $regex: new RegExp(_search, 'i') } });
                _segments = await SegmentModel.find({ status: SegmentStatus.DISABLED, [_field]: { $regex: new RegExp(_search, 'i') }}).sort({ title: 1 }).populate("createdBy").populate("updatedBy").skip(_skip).limit(_limit).lean().exec();
            } else {
                _count = await SegmentModel.countDocuments({[_field]: { $regex: new RegExp(_search, 'i') }});
                _segments = await SegmentModel.find({ [_field]: { $regex: new RegExp(_search, 'i') } }).sort({ title: 1 }).populate("createdBy").populate("updatedBy").skip(_skip).limit(_limit).lean().exec();
            }

            return Utils.response(_count, _page, _segments);

        } catch (_e) {
            throw _e;
        }

    };

    groupSeed = async(_req, _field) => { 

        try {
            return await SegmentModel.distinct(_field).exec();
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

            const _count = await SegmentModel.countDocuments(query);
            const _segments = await SegmentModel.find(query).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();

            return Utils.response(_count, _page, _segments);

        } catch (_e) {
            throw _e;
        }

    };

    count = async (_req) => {

        try {
            return await SegmentModel.countDocuments({});
        } catch (_e) {
            throw _e;
        }

    };

    get = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Segment id is missing");
        }

        try {
            const segment = await SegmentModel.findOne({ _id: _req.params.id }).lean();
            segment["rules"] = await SegmentRuleModel.find({ segment: _req.params.id }).lean();
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

        if (!body) {
            throw new Error('Request body is required');
        }

        try {

            if (body.rules) {
                /* Before anything - clear the rules (even if it is for static segment) */
                await SegmentRuleModel.deleteMany({ segment: _req.params.id });
            }

            if (body.retailers) {
                /* Also clear the retailer list */
                await SegmentRetailerModel.deleteMany({ segment: _req.params.id });
            }            

            if (body.segmentType == SegmentType.DYNAMIC) {
                if (body.rules && Array.isArray(body.rules)) {
                    /** Insert the rules */
                    for (let i = 0; i < body.rules.length; i++) {
                        try {
                            const ruleModel = new SegmentRuleModel({...body.rules[i], segment: _req.params.id, createdBy: body["createdBy"]});
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
                            const srModel = new SegmentRetailerModel({
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

            return await SegmentModel.findByIdAndUpdate(_req.params.id, { $set: { ..._req.body, updatedBy: _req.user._id } }, { runValidators: true, new: true });

        } catch (_e) {
            throw _e;
        }

    };

    delete = async (_req) => {
        
        if (!_req.params.id) {
            throw new Error("Segment id is missing");
        }

        try {

            await SegmentRuleModel.deleteMany({ segment: _req.params.id });            
            await SegmentRetailerModel.deleteMany({ segment: _req.params.id });
            await SegmentRetailerExclusionModel.deleteMany({ segment: _req.params.id });
            await SegmentRetailerInclusionModel.deleteMany({ segment: _req.params.id });

            return await SegmentModel.deleteOne({ _id: _req.params.id });            

        } catch (_e) {
            throw _e;
        }

    };

    create = async (_req) => {

        try {

            const errors = [];
            const { body } = _req;

            if (!body) {
                throw new Error('Request body is required');
            }

            body["createdBy"] = _req.user._id;
            const model = new SegmentModel(body);
            const segment = await model.save();     

            if (segment.segmentType == SegmentType.STATIC) {

                if (Array.isArray(body.retailers)) {
                    await Promise.all(body.retailers.map(async (retilerId) => {
                        try {     
                            const srModel = new SegmentRetailerModel({
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
                        const ruleModel = new SegmentRuleModel({...rules[i], segment: segment._id, createdBy: body["createdBy"]});
                        await ruleModel.save();
                    } catch (e) {
                        console.log(e);
                        errors.push(e.message);
                    }
                }          

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

            const page = parseInt(_req.query.page) || 1;
            const skip = (page - 1) * parseInt(process.env.PAGE_SIZE);
            const limit = 10;//parseInt(process.env.PAGE_SIZE);

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
            const segmentRetailers = await SegmentRetailerModel.find({segment: _req.params.id}).select("retailer").lean();
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
            const segmentRetailers = await SegmentRetailerModel.find({segment: _req.params.id}).select("retailer").lean();
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

            SegmentRetailerInclusionModel.aggregate([
                {
                    $lookup: {
                        from: 'cms_system_segment_retailer_inclusion',
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
            if (retailerModel) {

                const segmentRetailers = await SegmentRetailerModel.find({segment: _req.params.id}).select("retailer").lean();            
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
            const segment = await SegmentModel.findById(_req.params.id).lean();
            
            if (segment) {
                if (segment.segmentType == SegmentType.STATIC) {

                    /* It's a static segment */

                    mapping = await Promise.all(body.map(async (retilerId) => {
                        try {  
                            
                            const exist = await SegmentRetailerModel.find({segment: segment._id, retailer: retilerId,}).lean();
                            if (!exist || (Array.isArray(exist) && exist.length == 0)) {
                                const srModel = SegmentRetailerModel({
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
                            
                            const exist = await SegmentRetailerInclusionModel.find({segment: segment._id, retailer: retilerId,}).lean();
                            if (!exist || (Array.isArray(exist) && exist.length == 0)) {
                                const srModel = SegmentRetailerInclusionModel({
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
            const segment = await SegmentModel.findById(_req.params.id).lean();
            
            if (segment) {
                if (segment.segmentType == SegmentType.STATIC) {

                    /* It's a static segment */
                    deleted = await SegmentRetailerModel.deleteMany({retailer: { $in: body}});

                } else {  

                    /* It's a dynamic segment - add it to inclusion list */
                    deleted = await SegmentRetailerInclusionModel.deleteMany({retailer: { $in: body}});

                    await Promise.all(body.map(async (retilerId) => {
                        try { 
                            
                            const exist = await SegmentRetailerExclusionModel.find({segment: segment._id, retailer: retilerId,}).lean();
                            if (!exist || (Array.isArray(exist) && exist.length == 0)) {
                                const sreModel = SegmentRetailerExclusionModel({
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

            const segment = await SegmentModel.findById(_segmentId).lean();

            if (segment) {

                const filterQuery = {};

                if (segment.fromDate) {
                    filterQuery["orderDate"] = { $gte: new Date(segment.fromDate) };
                }

                if (segment.toDate) {
                    filterQuery["orderDate"] = { $lte: new Date(segment.toDate) };
                }

                if ((segment.geography == SegmentGeography.STATE) && (Array.isArray(segment.states) && segment.states.length > 0 )) {
                    filterQuery["states"] = { $in: segment.states };
                }

                if ((segment.geography == SegmentGeography.REGION) && (Array.isArray(segment.regions) && segment.regions.length > 0 )) {
                    filterQuery["regions"] = { $in: segment.regions };
                }

                if (Array.isArray(segment.orderStatus) && segment.orderStatus.length > 0) {
                    filterQuery["orderStatus"] = { $in: segment.orderStatus };
                }

                

            }

            

        } catch (e) {
            console.log(e);
        }

    };

    init = async () => {

        AP.event.on('on_segment_segment_multi_select_list', async (_params, callback) => {   console.log("on_segment_segment_multi_select_list is called");

            try {

                const [_req] = _params;   
                const _entity = _req.query.entity;

                if (_entity) {

                    if (_entity === "segment") {  
                        callback(await SegmentModel.find().lean(), null);
                    } else if (_entity === "distributor") {                        
                        callback(await MYDBM.queryWithConditions("select StoreId, StoreName, StoreCode from stores", []), null);
                    } else if (_entity === "companies") {
                        //callback(await MYDBM.queryWithConditions("select CompanyId, CompanyName from companies", []), null);
                        callback(
                            [
                                {
                                    "CompanyId": 1564,        
                                    "CompanyName": "Abbott Healthcare Private Limited"        
                                },
                                {
                                    "CompanyId": 1842,        
                                    "CompanyName": "Cipla Limited"        
                                },
                                {
                                    "CompanyId": 2062,        
                                    "CompanyName": "Glenmark"        
                                },
                                {
                                    "CompanyId": 2168,        
                                    "CompanyName": "Intas Pharmaceuticals Limited"        
                                },
                                {
                                    "CompanyId": 2306,        
                                    "CompanyName": "Mankind Pharma Limited"        
                                },
                                {
                                    "CompanyId": 2870,
                                    "CompanyName": "Torrent Pharmaceuticals Limited"
                                },
                                {
                                    "CompanyId": 8667,        
                                    "CompanyName": "USV Private Limited"        
                                },
                                {
                                    "CompanyId": 2810,        
                                    "CompanyName": "Sun Pharmaceuticals Industries Limited"        
                                }
                            ]
                            , null);

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

}