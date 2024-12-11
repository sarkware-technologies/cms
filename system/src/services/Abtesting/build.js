import Utils from "../../utils/utils.js";
import AbBuildVersionModel from "../../models/ab-build-version.js";
import RedisSyncService from "./redisupdate.js";

export default class ABtesingService {
    constructor() {
        this.updateRedisService = new RedisSyncService();
     }


    list = async (_req) => {

        try {

            let _authTypes = [];

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

            const _count = await AbBuildVersionModel.countDocuments({});
            _authTypes = await AbBuildVersionModel.find({}).sort({ title: 1 }).skip(skip).limit(limit).lean();
            
            return Utils.response(_count, page, _authTypes);

        } catch (e) {
            throw _e;
        }

    };

    listAll = async (_req) => {

        try {
            let assigned=  await AbBuildVersionModel.find({}).sort({ title: 1 }).lean();

            let respose =[...assigned];
            respose.map((e) => {
                return e['releaseDetails'] = e.releaseDetails + " - " + e.os+" - " + e.version
            })
            return respose;
        } catch (e) {
            throw e;
        }

    };

    search = async (_req, _page, _skip, _limit, _field, _search) => {

        try {

            const _count = await AbBuildVersionModel.countDocuments({ [_field]: { $regex: new RegExp(_search, 'i') } });
            const _authTypes = await AbBuildVersionModel.find({ [_field]: { $regex: new RegExp(_search, 'i') } }).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();

            return Utils.response(_count, _page, _authTypes);

        } catch (_e) {
            throw _e;
        }

    };

    groupSeed = async(_req, _field) => { 

        try {
            return await AbBuildVersionModel.distinct(_field).exec();
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

            const _count = await AbBuildVersionModel.countDocuments(query);
            const _authTypes = await AbBuildVersionModel.find(query).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();

            return Utils.response(_count, _page, _authTypes);

        } catch (_e) {
            throw _e;
        }

    };

    count = async (_req) => {

        try {
            return await AbBuildVersionModel.countDocuments({});
        } catch (_e) {
            throw _e;
        }

    };

    get = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Build id is missing");
        }

        try {
            return await AbBuildVersionModel.findOne({ _id: _req.params.id }).lean();
        } catch (_e) {
            throw _e;
        }

    };

    update = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Build id is missing");
        }

        try {
            const apibuild= await AbBuildVersionModel.findByIdAndUpdate(_req.params.id, { $set: { ..._req.body, updatedBy: _req.user._id } }, { runValidators: true, new: true });
            this.updateRedisService.bulkUpdate();
            return apibuild;

        } catch (_e) {
            throw _e;
        }

    };

    delete = async (_req) => {
        
        if (!_req.params.id) {
            throw new Error("Build id is missing");
        }

        try {
            return await AbBuildVersionModel.deleteOne({ _id: _req.params.id });            
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

            body["createdBy"] = _req.user._id
            const model = new AbBuildVersionModel(body);
            const authType = await model.save();

            return {
                status: true,
                message: "Build is created successfully",
                payload: authType
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
                message: e.message || 'An error occurred while creating Build'
            };

        }

    };

}