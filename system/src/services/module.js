import CapabilityModel from "../models/capability.js";
import ModuleModel from "../models/module.js";
import Utils from "../utils/utils.js";

export default class ModuleService {

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

            const _count = await ModuleModel.countDocuments({});
            _users = await ModuleModel.find({}).sort({ title: 1 }).skip(skip).limit(limit).lean();
            
            return Utils.response(_count, page, _users);

        } catch (e) {
            throw _e;
        }

    };

    search = async (_req, _page, _skip, _limit, _field, _search) => {

        try {

            const _count = await ModuleModel.countDocuments({ [_field]: { $regex: new RegExp(_search, 'i') } });
            const _roles = await ModuleModel.find({ [_field]: { $regex: new RegExp(_search, 'i') } }).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();

            return Utils.response(_count, _page, _roles);

        } catch (_e) {
            throw _e;
        }

    };

    groupSeed = async(_req, _field) => { 

        try {
            return await ModuleModel.distinct(_field).exec();
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

            const _count = await ModuleModel.countDocuments(query);
            const _roles = await ModuleModel.find(query).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();

            return Utils.response(_count, _page, _roles);

        } catch (_e) {
            throw _e;
        }

    };

    count = async (_req) => {

        try {
            return await ModuleModel.countDocuments({});
        } catch (_e) {
            throw _e;
        }

    };

    get = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Module id is missing");
        }

        try {
            return await ModuleModel.findOne({ _id: _req.params.id }).lean();
        } catch (_e) {
            throw _e;
        }

    };

    update = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Module id is missing");
        }

        try {
            return await ModuleModel.findByIdAndUpdate(_req.params.id, { $set: { ..._req.body } }, { runValidators: true, new: true });
        } catch (_e) {
            throw _e;
        }

    };

    delete = async (_req) => {
        
        if (!_req.params.id) {
            throw new Error("Module id is missing");
        }

        try {
            await CapabilityModel.deleteMany({ module: _req.params.id });
            return await ModuleModel.deleteOne({ _id: _req.params.id });            
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

            const model = new ModuleModel(body);
            const module = await model.save();     

            return {
                status: true,
                message: "Module "+ module.title +" is created successfully",
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
                message: e.message || 'An error occurred while registering the user'
            };

        }

    };

}