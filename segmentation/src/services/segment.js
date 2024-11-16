import EM from "../utils/entity.js";
import AP from "./api.js";
import MYDBM from "../utils/mysql.js";
import Utils from "../utils/utils.js";
import SegmentBuildManager from "../builders/build-manager.js";

import SegmentType from "../enums/segment-type.js";
import SegmentStatus from "../enums/segment-status.js";
import SegmentQueueStatus from "../enums/segment-queue-status.js";

export default class SegmentService {

    constructor () {
        this.buildManager = new SegmentBuildManager();
    }

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

            const updatedSegment = await segmentModel.findByIdAndUpdate(_req.params.id, { $set: { ...body, updatedBy: _req.user._id } }, { runValidators: true, new: true });

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

                await this.buildManager.processQueue();

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
            const segmentQueueModel = await EM.getModel("cms_segment_queue");
            const segmentBuildStatusModel = await EM.getModel("cms_segment_builder_status");
            const segmentRetailerModel = await EM.getModel("cms_segment_retailer"); 
            const segmentBlacklistedRetailerModel = await EM.getModel("cms_segment_blacklisted_retailer"); 
            const segmentWhitelistedRetailerModel = await EM.getModel("cms_segment_whitelisted_retailer"); 
            

            await segmentRuleModel.deleteMany({ segment: _req.params.id });              
            await segmentRetailerModel.deleteMany({ segment: _req.params.id });
            await segmentBlacklistedRetailerModel.deleteMany({ segment: _req.params.id });
            await segmentWhitelistedRetailerModel.deleteMany({ segment: _req.params.id });
            await segmentQueueModel.deleteMany({ segment: _req.params.id });
            await segmentBuildStatusModel.deleteMany({ segment: _req.params.id });

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
                await this.buildManager.processQueue();                

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

    listWhitelistedRetailers = async (_req) => {

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

            const retailerModel = await EM.getModel("cms_master_retailer");
            const segmentWhitelistedRetailerModel = await EM.getModel("cms_segment_whitelisted_retailer");

            const _count = await segmentWhitelistedRetailerModel.countDocuments({segment: _req.params.id});
            const _retailers = await segmentWhitelistedRetailerModel.find({segment: _req.params.id}).populate("retailer").skip(skip).limit(limit).lean().exec();
            
            const _result = _retailers.map((_item) => _item.retailer);      

            return Utils.response(_count, page, _result, 10);

        } catch (_e) {
            throw _e;
        }

    };

    listBlacklistedRetailers = async (_req) => {

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

            const retailerModel = await EM.getModel("cms_master_retailer");
            const segmentBlacklistedRetailerModel = await EM.getModel("cms_segment_blacklisted_retailer");

            const _count = await segmentBlacklistedRetailerModel.countDocuments({segment: _req.params.id});
            const _retailers = await segmentBlacklistedRetailerModel.find({segment: _req.params.id}).populate("retailer").skip(skip).limit(limit).lean().exec();
            
            const _result = _retailers.map((_item) => _item.retailer);      

            return Utils.response(_count, page, _result, 10);

        } catch (_e) {
            throw _e;
        }

    };

    whitelistedRetailerSearch = async (_req, _page, _skip, _limit, _field, _search) => {

        try {

            const segmentRetailerInclusionModel = await EM.getModel("cms_segment_whitelisted_retailer");
            segmentRetailerInclusionModel.aggregate([
                {
                    $lookup: {
                        from: 'cms_segment_whitelisted_retailer',
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

    whitelistRetailersToSegment = async (_req) => {

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
            const segmentWhitelistedRetailerModel = await EM.getModel("cms_segment_whitelisted_retailer");

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
                            
                            const exist = await segmentWhitelistedRetailerModel.find({segment: segment._id, retailer: retilerId,}).lean();
                            if (!exist || (Array.isArray(exist) && exist.length == 0)) {
                                const srModel = new segmentWhitelistedRetailerModel({
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

    removeWhitelistRetailersFromSegment = async (_req) => {

        try {

            const { body } = _req;

            if (!_req.params.id) {
                throw new Error("Segment id is missing");
            }

            if (!body) {
                throw new Error('Request body is required');
            }

            if (!body.retailers) {
                throw new Error('Retailer ids is missing');
            }

            const segmentWhitelistedRetailerModel = await EM.getModel("cms_segment_whitelisted_retailer");
            return await segmentWhitelistedRetailerModel.deleteMany({ retailer: { $in : body.retailers } });

        } catch (_e) {
            throw _e;
        }

    };

    blacklistRetailersFromSegment = async (_req) => {

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
            const segmentWhitelistedRetailerModel = await EM.getModel("cms_segment_whitelisted_retailer");
            const segmentBlacklistedRetailerModel = await EM.getModel("cms_segment_blacklisted_retailer"); 

            const segment = await segmentModel.findById(_req.params.id).lean();
            
            if (segment) {

                deleted = await segmentRetailerModel.deleteMany({retailer: { $in: body}});

                if (segment.segmentType == SegmentType.DYNAMIC) {  

                    /* It's a dynamic segment - add it to inclusion list */
                    deleted = await segmentRetailerModel.deleteMany({retailer: { $in: body}});

                    await Promise.all(body.map(async (retilerId) => {
                        try { 
                            
                            const exist = await segmentBlacklistedRetailerModel.find({segment: segment._id, retailer: retilerId,}).lean();
                            if (!exist || (Array.isArray(exist) && exist.length == 0)) {
                                const sreModel = new segmentBlacklistedRetailerModel({
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
    
    removeBlacklistRetailersFromSegment = async (_req) => {

        try {

            const { body } = _req;

            if (!_req.params.id) {
                throw new Error("Segment id is missing");
            }

            if (!body) {
                throw new Error('Request body is required');
            }

            if (!body.retailers) {
                throw new Error('Retailer ids is missing');
            }

            const segmentBlacklistedRetailerModel = await EM.getModel("cms_segment_blacklisted_retailer");
            return await segmentBlacklistedRetailerModel.deleteMany({ retailer: { $in : body.retailers } });

        } catch (_e) {
            throw _e;
        }

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