import CapabilityModel from "../models/capability.js";
import ModuleModel from "../models/module.js";
import ServiceModel from "../models/service.js";
import Utils from "../utils/utils.js";

export default class ServiceService {

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
                return await this.search(_req, page, skip, limit, searchFrom, searchFor);
            }

            if (filter !== "") {
                if (filterType === "seeds") {
                    return await this.groupSeed(_req, filter);
                } else {
                    return await this.groupBy(_req, page, skip, limit, filter, filterBy);
                }
            }

            const _count = await ServiceModel.countDocuments({});
            _users = await ServiceModel.find({}).sort({ title: 1 }).skip(skip).limit(limit).lean();
            
            return Utils.response(_count, page, _users);

        } catch (e) {
            throw _e;
        }

    };

    search = async (_req, _page, _skip, _limit, _field, _search) => {

        try {

            const _count = await ServiceModel.countDocuments({ [_field]: { $regex: new RegExp(_search, 'i') } });
            const _roles = await ServiceModel.find({ [_field]: { $regex: new RegExp(_search, 'i') } }).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();

            return Utils.response(_count, _page, _roles);

        } catch (_e) {
            throw _e;
        }

    };

    groupSeed = async(_req, _field) => { 

        try {
            return await ServiceModel.distinct(_field).exec();
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

            const _count = await ServiceModel.countDocuments(query);
            const _roles = await ServiceModel.find(query).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();

            return Utils.response(_count, _page, _roles);

        } catch (_e) {
            throw _e;
        }

    };

    count = async (_req) => {

        try {
            return await ServiceModel.countDocuments({});
        } catch (_e) {
            throw _e;
        }

    };

    get = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Service id is missing");
        }

        try {
            return await ServiceModel.findOne({ _id: _req.params.id }).lean();
        } catch (_e) {
            throw _e;
        }

    };

    update = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Service id is missing");
        }

        try {
            return await ServiceModel.findByIdAndUpdate(_req.params.id, { $set: { ..._req.body } }, { runValidators: true, new: true });
        } catch (_e) {
            throw _e;
        }

    };

    delete = async (_req) => {
        
        if (!_req.params.id) {
            throw new Error("Service id is missing");
        }

        try {

            const modules = await ModuleModel.find({ service: _req.params.id }).lean();
            const moduleIds = modules.map(module => module._id).join(',');

            /* Remove the capabilities */
            await CapabilityModel.deleteMany({_id: { $in: moduleIds}});
            /* Remove the modules */
            await ModuleModel.deleteMany({service: _req.params.id});
            /* Finally remove the service itself */
            return await ServiceModel.deleteOne({ _id: _req.params.id }); 

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

            const model = new ServiceModel(body);
            const service = await model.save();     

            return {
                status: true,
                message: "Service "+ service.title +" is created successfully",
                payload: service
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
                message: e.message || 'An error occurred while registering the user'
            };

        }

    };

}