import ModuleModel from "../models/module.js";
import EntityModel from "../models/entity.js";
import EM from "../utils/entity.js";
import EntityModuleMappingModel from "../models/entity-module.js";
import { EventEmitter } from 'events';

import Utils from "../utils/utils.js";
import SegmentModel from "../models/segment.js";

export default class SegmentService {

    constructor () {}

    list = async (_req) => {

        try {

            let _users = [];

            const page = parseInt(_req.query.page) || 1;
            const skip = (page - 1) * parseInt(process.env.PAGE_SIZE);
            const limit = parseInt(process.env.PAGE_SIZE);

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

            const _count = await SegmentModel.countDocuments({});
            _users = await SegmentModel.find({}).sort({ title: 1 }).skip(skip).limit(limit).lean();
            
            return Utils.response(_count, page, _users);

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

            const _count = await SegmentModel.countDocuments({ [_field]: { $regex: new RegExp(_search, 'i') } });
            const _roles = await SegmentModel.find({ [_field]: { $regex: new RegExp(_search, 'i') } }).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();

            return Utils.response(_count, _page, _roles);

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
            const _roles = await SegmentModel.find(query).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();

            return Utils.response(_count, _page, _roles);

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
            return await SegmentModel.findOne({ _id: _req.params.id }).lean();
        } catch (_e) {
            throw _e;
        }

    };

    update = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Segment id is missing");
        }

        try {
            return await SegmentModel.findByIdAndUpdate(_req.params.id, { $set: { ..._req.body, updated_by: _req.user._id } }, { runValidators: true, new: true });
        } catch (_e) {
            throw _e;
        }

    };

    delete = async (_req) => {
        
        if (!_req.params.id) {
            throw new Error("Segment id is missing");
        }

        try {
            return await SegmentModel.deleteOne({ _id: _req.params.id });            
        } catch (_e) {
            throw _e;
        }

    };

    create = async (_req) => {

        try {

            const { body } = _req;

            if (!body) {
                throw new Error('Request body is required');
            }

            body["created_by"] = _req.user._id
            const model = new SegmentModel(body);
            const module = await model.save();     

            return {
                status: true,
                message: "Segment "+ module.title +" is created successfully",
                payload: module
            };

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

    init = async () => {

        AP.event.on('on_segment_segment_multi_select_list', async (_params, callback) => { 

            try {

                const [_req] = _params;   
                const _entity = _req.query.entity;

                if (_entity) {

                    if (_entity === "segment") {  
                        callback(await SegmentModel.find().lean(), null);
                    } else if (_entity === "distributor") {                        
                        callback(await MYDBM.queryWithConditions("select StoreId, StoreName, StoreCode from stores", []), null);
                    } else if (_entity === "company") {
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

                    } else if (_entity === "retailer") {
                        //callback(await MYDBM.queryWithConditions("select RetailerId, RetailerName from retailers", []), null);
                        callback(await SegmentModel.find().lean(), null);
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

            } catch (_e) {
                callback(null, _e);
            }

        });

    };

}