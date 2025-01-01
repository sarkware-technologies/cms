import EM from "../utils/entity.js";
import AP from "./api.js";
import MYDBM from "../utils/mysql.js";
import Utils from "../utils/utils.js";
import SegmentBuildManager from "../builders/segment-build-manager.js";
import HK from "../utils/house-keep.js";

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
            const segmentBuildStatus = await EM.getModel("cms_segment_builder_status");

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
                return this.search(_req, page, skip, limit, searchFrom, searchFor, result);
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
            } else if (result == "scheduled") {
                _count = await segmentModel.countDocuments({segmentStatus: SegmentStatus.SCHEDULED});
                _segments = await segmentModel.find({segmentStatus: SegmentStatus.SCHEDULED}).sort({ title: 1 }).populate("createdBy").populate("updatedBy").skip(skip).limit(limit).lean().exec();
            } else if (result == "disabled") {
                _count = await segmentModel.countDocuments({status: false});
                _segments = await segmentModel.find({status: false}).sort({ title: 1 }).populate("createdBy").populate("updatedBy").skip(skip).limit(limit).lean().exec();
            } else {
                _count = await segmentModel.countDocuments({});
                _segments = await segmentModel.find({}).sort({ title: 1 }).populate("createdBy").populate("updatedBy").skip(skip).limit(limit).lean().exec();
            }

            for (let i = 0; i < _segments.length; i++) {
                
                if (_segments[i].segmentType == SegmentType.DYNAMIC) {

                    const queueItems = await segmentQueueModel.find({segment: _segments[i]._id }).lean();

                    if (queueItems) {

                        let isBuilding = false;
                        _segments[i]["build"] = "Completed";
                        
                        for (let j = 0; j < queueItems.length; j++) {
                            if (queueItems[j].queueStatus == SegmentQueueStatus.BUILDING) {
                                isBuilding = true;
                                break;
                            }
                        }

                        if (!isBuilding) {
                            for (let j = 0; j < queueItems.length; j++) {
                                if (queueItems[j].queueStatus == SegmentQueueStatus.WAITING) {
                                    _segments[i]["build"] = "Waiting";
                                    break;
                                }
                            }
                        } else {
                            _segments[i]["build"] = "Building";
                        }

                    } else {
                        /* Check the build status */
                        const segmentStatus = await segmentBuildStatus.findOne({ segment: _segments[i]._id }).lean();                        
                        _segments[i]["build"] = (segmentStatus && !segmentStatus.status) ? "Ready" : "Not Ready" ;
                    }
                } else {

                    _segments[i]["build"] = "Ready";

                }
                
            }

            return Utils.response(_count, page, _segments);

        } catch (_e) {
            throw _e;
        }

    };

    mdmCodeLookUp = async (_req) => {

        if (!_req.params.code) {
            throw new Error("Mdm code is missing");
        }

        try {

            const _record = await MYDBM.queryWithConditions(
                `SELECT mgpm.MDM_PRODUCT_CODE,                         
                    CONCAT(mgpm.MDM_PRODUCT_CODE, ' - ', mgpm.PRODUCT_NAME) AS ProductName,
                    mgpm.PTR, mgpm.MRP, mgpm.PRODUCT_NAME as name 
                 FROM mdm_golden_product_master mgpm
                 WHERE mgpm.MDM_PRODUCT_CODE=?`, 
                [_req.params.code]
            );

            return _record;

        } catch (e) {
            throw e;
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

    houseKeep = async (_req) => {

        try {
            await HK.check();
            return { status: true, message : "House keeping done" }
        } catch (e) {
            console.log(e);
            throw e;
        }

    };

    search = async (_req, _page, _skip, _limit, _field, _search, _result) => {

        try {

            let _count = 0;
            let _segments = [];
            const segmentModel = await EM.getModel("cms_segment");

            if (_result == "dynamic") {
                _count = await segmentModel.countDocuments({ segmentType: SegmentType.DYNAMIC, [_field]: { $regex: new RegExp(_search, 'i') }});
                _segments = await segmentModel.find({ segmentType: SegmentType.DYNAMIC, [_field]: { $regex: new RegExp(_search, 'i') } }).sort({ title: 1 }).populate("createdBy").populate("updatedBy").skip(_skip).limit(_limit).lean().exec();
            } else if (_result == "static") {
                _count = await segmentModel.countDocuments({ segmentType: SegmentType.STATIC, [_field]: { $regex: new RegExp(_search, 'i') }});
                _segments = await segmentModel.find({ segmentType: SegmentType.STATIC, [_field]: { $regex: new RegExp(_search, 'i') } }).sort({ title: 1 }).populate("createdBy").populate("updatedBy").skip(_skip).limit(_limit).lean().exec();
            } else if (_result == "progress") {
                _count = await segmentModel.countDocuments({ segmentStatus: SegmentStatus.SCHEDULED, [_field]: { $regex: new RegExp(_search, 'i') }});
                _segments = await segmentModel.find({ status: SegmentStatus.PROGRESS, [_field]: { $regex: new RegExp(_search, 'i') } }).sort({ title: 1 }).populate("createdBy").populate("updatedBy").skip(_skip).limit(_limit).lean().exec();
            } else if (_result == "disabled") {  console.log("in the disabled block");
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
        const segmentRetailerRuleSummary = await EM.getModel("cms_segment_retailer_rules_summary");

        if (!body) {
            throw new Error('Request body is required');
        }

        try {

            if (body.rules) {

                const _rules = await segmentRuleModel.find({ segment: _req.params.id }).lean();
                for (let i = 0; i < _rules.length; i++) {
                    await segmentRetailerRuleSummary.deleteOne({ segmentRule: _rules[i]._id });
                }
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

            return await segmentModel.findByIdAndUpdate(_req.params.id, { $set: { ...body, updatedBy: _req.user._id } }, { runValidators: true, new: true });

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
            const segmentRetailerSummaryModel = await EM.getModel("cms_segment_retailer_summary");
            const segmentRetailerRuleSummaryModel = await EM.getModel("cms_segment_retailer_rules_summary");
            const segmentBatchOptionModel = await EM.getModel("cms_segment_batch_options");
            const segmentBuildLogModel = await EM.getModel("cms_segment_build_log");
            
            const retailerRules = await segmentRuleModel.find({ segment: _req.params.id }).lean();
            for (let i = 0; i < retailerRules.length; i++) {
                await segmentRetailerRuleSummaryModel.deleteMany({ segmentRule: retailerRules[i]._id });
            }

            await segmentRuleModel.deleteMany({ segment: _req.params.id });              
            await segmentRetailerModel.deleteMany({ segment: _req.params.id });
            await segmentBlacklistedRetailerModel.deleteMany({ segment: _req.params.id });
            await segmentWhitelistedRetailerModel.deleteMany({ segment: _req.params.id });
            await segmentQueueModel.deleteMany({ segment: _req.params.id });
            await segmentBuildStatusModel.deleteMany({ segment: _req.params.id });
            await segmentRetailerSummaryModel.deleteMany({ segment: _req.params.id });
            await segmentBatchOptionModel.deleteMany({ segment: _req.params.id });
            await segmentBuildLogModel.deleteMany({ segment: _req.params.id });

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

            body["status"] = true;
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
                
                // const segmentQueueModel = await EM.getModel("cms_segment_queue");
                // const segmentQueue = new segmentQueueModel({
                //     segment: segment._id,
                //     queueStatus: SegmentQueueStatus.WAITING
                // });
                
                // await segmentQueue.save();                    
                // await this.buildManager.processQueue();                

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

    segmentSummary = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Segment id is missing");
        }

        try {
            
            const segmentRetailerModel = await EM.getModel("cms_segment_retailer");
            const segmentWhitelistedRetailerModel = await EM.getModel("cms_segment_whitelisted_retailer");
            const segmentBlacklistedRetailerModel = await EM.getModel("cms_segment_blacklisted_retailer");
            

            const retailerCount = await segmentRetailerModel.countDocuments({ segment: _req.params.id });
            const whitelistCount = await segmentWhitelistedRetailerModel.countDocuments({ segment: _req.params.id });
            const blacklistCount = await segmentBlacklistedRetailerModel.countDocuments({ segment: _req.params.id });

            return {
                retailer: retailerCount,
                whitelisted: whitelistCount,
                balcklisted: blacklistCount 
            }
            
        } catch (_e) {
            throw _e;
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

    listSegmentRetailersAll = async (_req) => {

        try {

            if (!_req.params.id) {
                throw new Error("Segment id is missing");
            }            

            const segmentRetailerModel = await EM.getModel("cms_segment_retailer");
            return await segmentRetailerModel.find({segment: _req.params.id}).select("retailer").lean();            

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
            const retailerModel = await EM.getModel("cms_master_retailer");
            const segmentRetailerModel = await EM.getModel("cms_segment_retailer");

            if (retailerModel) {

                const segmentRetailers = await segmentRetailerModel.find({segment: _req.params.id}).select("retailer").lean();            
                const retailerIds = segmentRetailers.map(record => record.retailer);

                _count = await retailerModel.countDocuments({ 
                    _id: { $in: retailerIds }, 
                    [_field]: { $regex: new RegExp(_search, 'i') } 
                });
                _retailers = await retailerModel.find({ 
                    _id: { $in: retailerIds }, 
                    [_field]: { $regex: new RegExp(_search, 'i') } 
                }).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();
            }

            return Utils.response(_count, _page, _retailers);

        } catch (_e) { console.log(_e);
            throw _e;
        }

    };

    retailerGroupSeed = async(_req, _field) => { 

        try {
            let _seeds = [];
            const retailerModel = await EM.getModel("cms_master_retailer");
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
            const retailerModel = await EM.getModel("cms_master_retailer");
            if (retailerModel) {
                _count = await retailerModel.countDocuments(query);
                _retailers = await retailerModel.find(query).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();
            }

            return Utils.response(_count, _page, _retailers);

        } catch (_e) {
            throw _e;
        }

    };

    mapAllRetailers = async (_segmentId, _segmentType) => {

        try {

            const chunkSize = 100;
            const retailerModel = await EM.getModel("cms_master_retailer");
            const _modelName = (SegmentType.STATIC == _segmentType) ? "cms_segment_retailer" : "cms_segment_whitelisted_retailer";
            const segmentRetailerModel = await EM.getModel(_modelName);
    
            // Flush current retailer mapping
            await segmentRetailerModel.deleteMany({ segment: _segmentId });
    
            const cursor = retailerModel.find().select('_id').lean().cursor();
    
            let chunk = [];
            for await (const retailer of cursor) {
                chunk.push({
                    retailer: retailer._id,
                    segment: _segmentId,
                });
    
                if (chunk.length === chunkSize) {
                    try {
                        await segmentRetailerModel.insertMany(chunk, { ordered: false });
                    } catch (_e) {
                        console.error('Error during bulk insert:', _e.message);
                    }
                    chunk = [];
                }
            }
    
            // Insert any remaining chunk
            if (chunk.length > 0) {
                try {
                    await segmentRetailerModel.insertMany(chunk, { ordered: false });
                } catch (_e) {
                    console.error('Error during bulk insert:', _e.message);
                }
            }
    
        } catch (e) {
            console.error('Error in mapAllRetailers:', e.message);
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

                if (!Array.isArray(body) && body == "all") {

                    /* This means all retailers should be whitelisted */
                    await this.mapAllRetailers(segment._id, segment.segmentType);                        

                } else {

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

            if (!Array.isArray(body)) {
                throw new Error('Request body is required');
            }

            const segmentWhitelistedRetailerModel = await EM.getModel("cms_segment_whitelisted_retailer");
            return await segmentWhitelistedRetailerModel.deleteMany({ segment: _req.params.id, retailer: { $in : body } });

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

            if (!Array.isArray(body)) {
                throw new Error('Request body is required');
            }

            const segmentBlacklistedRetailerModel = await EM.getModel("cms_segment_blacklisted_retailer");
            return await segmentBlacklistedRetailerModel.deleteMany({ segment: _req.params.id, retailer: { $in : body } });

        } catch (_e) {
            throw _e;
        }

    };

    searchBrands = async (_req) => {

        try {

            const pageSize = 10;
            const page = parseInt(_req.query.page) || 1;
            const skip = (page - 1) * pageSize;                       
            const search = _req.query.search ? `%${_req.query.search}%` : "%";

            const _records = await MYDBM.queryWithConditions(
                'SELECT * FROM brands b WHERE b.IsDeleted = 0 AND b.IsApproved = 1 AND LOWER(Name) LIKE LOWER(?) LIMIT ?, ?',
                [search, skip, pageSize]
            );
            const totalCountResult = await MYDBM.queryWithConditions(
                'SELECT COUNT(*) as TotalCount FROM brands b WHERE b.IsDeleted = 0 AND b.IsApproved = 1 AND LOWER(Name) LIKE LOWER(?)',
                [search]
            );

            const count = totalCountResult[0]?.TotalCount || 0;
            
            return  {
                count,
                page,
                pageSize,
                records: _records,
            };

        } catch (e) {
            throw e;
        }

    };

    searchCategories = async (_req) => {

        try {

            const pageSize = 10;
            const page = Math.max(parseInt(_req.query.page, 10) || 1, 1); // Ensure page is at least 1
            const skip = (page - 1) * pageSize;
            const search = _req.query.search ? `%${_req.query.search}%` : "%";
    
            // Fetch paginated records
            const _records = await MYDBM.queryWithConditions(
                `SELECT DISTINCT(s.Category) AS Name
                 FROM storeproducts s
                 WHERE LOWER(s.Category) LIKE LOWER(?)
                 ORDER BY s.Category
                 LIMIT ? OFFSET ?`,
                [search, pageSize, skip]
            );
    
            // Fetch total count
            const totalCountResult = await MYDBM.queryWithConditions(
                `SELECT COUNT(DISTINCT s.Category) AS TotalCount
                 FROM storeproducts s
                 WHERE LOWER(s.Category) LIKE LOWER(?)`,
                [search]
            );
    
            const count = totalCountResult[0]?.TotalCount || 0;
    
            return {
                count,
                page,
                pageSize,
                records: _records,
            };
    
        } catch (e) {
            console.error("Error in searchCategories:", e.message);
            throw e;
        }

    };    

    searchMdmProducts = async (_req) => {

        try {
            
            const pageSize = 10;
            const page = Math.max(parseInt(_req.query.page, 10) || 1, 1);
            const skip = (page - 1) * pageSize;
            const search = _req.query.search ? `%${_req.query.search}%` : `%`;
    
            // Fetch paginated records
            const _records = await MYDBM.queryWithConditions(
                `SELECT mgpm.MDM_PRODUCT_CODE, 
                    CONCAT(mgpm.MDM_PRODUCT_CODE, ' - ', mgpm.PRODUCT_NAME) AS ProductName,
                    mgpm.PTR, mgpm.MRP, mgpm.PRODUCT_NAME as name 
                 FROM mdm_golden_product_master mgpm
                 WHERE (LOWER(mgpm.PRODUCT_NAME) LIKE LOWER('${search}') 
                        OR LOWER(mgpm.MDM_PRODUCT_CODE) LIKE LOWER('${search}'))
                 LIMIT ${skip}, ${pageSize}`, 
                []
            );
    
            // Fetch total count
            const totalCountResult = await MYDBM.queryWithConditions(
                `SELECT COUNT(*) AS TotalCount
                 FROM mdm_golden_product_master mgpm
                 WHERE (LOWER(mgpm.PRODUCT_NAME) LIKE LOWER('${search}') 
                        OR LOWER(mgpm.MDM_PRODUCT_CODE) LIKE LOWER('${search}'))`,
                []
            );    

            const count = totalCountResult[0]?.TotalCount || 0;

            return {
                count,
                page,
                pageSize,
                records: _records
            };
    
        } catch (e) {            
            throw e;
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

                        callback(await segmentModel.find({ status: true }).lean(), null);

                    } else if (_entity === "brands") {

                        const {count, page, records} = await this.searchBrands(_req);
                        callback(Utils.response(count, page, records), null);

                    } else if (_entity === "mdms") {

                        const {count, page, records} = await this.searchMdmProducts(_req);
                        callback(Utils.response(count, page, records, 10), null);

                    } else if (_entity === "categories") { 
                        
                        const {count, page, records} = await this.searchCategories(_req);
                        callback(Utils.response(count, page, records), null);

                    } else if (_entity === "companies") {

                        callback(await MYDBM.query("select c.CompanyId, c.CompanyName from companies c where c.IsDeleted = 0 AND c.IsApproved = 1"), null);

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

            const { body } = _req;

            if (!_req.params.id) {
                throw new Error("Segment id is missing");
            }

            if (body) {

                /* Update the batch options - if provided */

                const {
                    chunkSize,                    
                    maxThread,                    
                    recordsPerBatch
                } = _req.body;
    
                if (chunkSize && maxThread && recordsPerBatch) {  
                    try {
                        const batchOptionModel = await EM.getModel("cms_segment_batch_options");
                        await batchOptionModel.findOneAndUpdate(
                            { segment: _req.params.id },
                            {            
                                chunkSize,                            
                                maxThread,                                
                                recordsPerBatch,
                                segment: _req.params.id
                            },
                            { upsert: true, new: true }
                        );
                    } catch (e) {
                        console.log(e);
                    }                    
                }                

            }

            /* Check the queue status */

            let canItBeAdded = true;
            const segmentQueueModel = await EM.getModel("cms_segment_queue");
            const segmentQueue = await segmentQueueModel.find({ segment: _req.params.id }).lean();

            if (Array.isArray(segmentQueue) && segmentQueue.length > 0) {
                for (let i = 0; i < segmentQueue.length; i++) {
                    if (segmentQueue[i].queueStatus == SegmentQueueStatus.WAITING) {
                        canItBeAdded = false;
                        break;
                    }
                }
            }

            if (canItBeAdded) {

                const queueObj = new segmentQueueModel({
                    segment: _req.params.id,
                    queueStatus: SegmentQueueStatus.WAITING
                });
                await queueObj.save();

                /* Update the segment collection */
                const segmentModel = await EM.getModel("cms_segment");
                await segmentModel.findByIdAndUpdate(
                    _req.params.id,
                    { segmentStatus: SegmentStatus.SCHEDULED }
                );
                
                await this.buildManager.processQueue();

                return { status: true, message: "Segment is added to the build queue" };

            } else {
                return { status: true, message: "Segment is already in the queue" };
            }                 

        } catch (e) {
            throw e;
        }

    };

    buildStatus = async (_req) => {

        try {

            if (!_req.params.id) {
                throw new Error("Segment id is missing");
            }

            const segmentBuildStatusModel = await EM.getModel("cms_segment_builder_status");
            const buildStatus = await segmentBuildStatusModel.findOne({ segment: _req.params.id }).lean();

            if (buildStatus) {
                return { status: true, buildStatus };
            }

            return { status: false, message: "No status found" };

        } catch (e) {
            throw e;
        }

    };

    buildHistory = async (_req) => {

        try {

            if (!_req.params.id) {
                throw new Error("Segment id is missing");
            }

            const segmentBuildLogModel = await EM.getModel("cms_segment_build_log");
            const page = parseInt(_req.query.page) || 1;
            const skip = (page - 1) * parseInt(process.env.PAGE_SIZE);
            const limit = parseInt(process.env.PAGE_SIZE);

            const _count = await segmentBuildLogModel.countDocuments({ segment: _req.params.id });
            const logs = await segmentBuildLogModel.find({ segment: _req.params.id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

            return Utils.response(_count, page, logs);

        } catch (e) {
            throw e;
        }        

    };

}