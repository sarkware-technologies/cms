import CapabilityModel from "../models/capability.js";
import HostModel from "../models/host.js";
import ModuleModel from "../models/module.js";
import ServiceVersionModel from "../models/service-version.js";
import ServiceModel from "../models/service.js";
import Utils from "../utils/utils.js";

export default class ServiceService {

    constructor () {}

    list = async (_req) => {

        try {

            let _services = [];

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
            _services = await ServiceModel.find({}).sort({ title: 1 }).skip(skip).limit(limit).lean();
            
            return Utils.response(_count, page, _services);

        } catch (e) {
            throw _e;
        }

    };

    listAll = async (_req) => {

        try {
            return await ServiceModel.find({}).sort({ title: 1 }).lean();
        } catch (e) {
            throw e;
        }

    };

    listModules = async (_req) => {

        const page = parseInt(_req.query.page) || 1;
        const skip = (page - 1) * parseInt(process.env.PAGE_SIZE);
        const limit = parseInt(process.env.PAGE_SIZE);
        const serviceId = _req.params.id ? _req.params.id : null;
    
        if (serviceId) {

            try {
                
                const _count = await ModuleModel.countDocuments({ service: serviceId });
                const _modules = await ModuleModel.find({ service: serviceId })                                
                .skip(skip)
                .limit(limit)
                .lean();  console.log(_modules);
                return Utils.response(_count, page, _modules);

            } catch (_e) {
                throw _e;
            }
            
        }
    
        return Utils.response(0, 0, []);

    };

    listVersions = async (_req) => {

        const page = parseInt(_req.query.page) || 1;
        const skip = (page - 1) * parseInt(process.env.PAGE_SIZE);
        const limit = parseInt(process.env.PAGE_SIZE);
        const serviceId = _req.params.id ? _req.params.id : null;
    
        if (serviceId) {

            try {
                
                const _count = await ServiceVersionModel.countDocuments({ service: serviceId });
                const _versions = await ServiceVersionModel.find({ service: serviceId })
                .populate("host")
                .sort({ version: 1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec();
                return Utils.response(_count, page, _versions);

            } catch (_e) {
                throw _e;
            }

        }
    
        return Utils.response(0, 0, []);

    };

    search = async (_req, _page, _skip, _limit, _field, _search) => {

        try {

            const _count = await ServiceModel.countDocuments({ [_field]: { $regex: new RegExp(_search, 'i') } });
            const _services = await ServiceModel.find({ [_field]: { $regex: new RegExp(_search, 'i') } }).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();

            return Utils.response(_count, _page, _services);

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
            const _services = await ServiceModel.find(query).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();

            return Utils.response(_count, _page, _services);

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
            return await ServiceModel.findByIdAndUpdate(_req.params.id, { $set: { ..._req.body, updatedBy: _req.user._id } }, { runValidators: true, new: true });
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

            body["createdBy"] = _req.user._id;
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
                message: e.message || 'An error occurred while creating service'
            };

        }

    };

    prepareRoutes = async () => {

        try {
            let host = {},
                _hosts = {},
                _versions = {},
                _features = [];
    
            const routes = {
                hosts: {},
                services: {},
            };

            const _services = await ServiceModel.find({}).lean();
            const _lists = await HostModel.find({}).lean();

            for (let i = 0; i < _lists.length; i++) {
                _hosts[_lists[i]._id] = _lists[i];
            }
            routes.hosts = _hosts;
    
            /* Fetch version */
            for (let i = 0; i < _services.length; i++) {

                routes.services[_services[i].handle] = {
                    service: _services[i],
                    features: {},
                    versions: {},
                };
    
                _features = await ModuleModel.find({ service: _services[i]._id });            
                _versions = await ServiceVersionModel.find({ service: _services[i]._id });
    
                for (let j = 0; j < _versions.length; j++) {
                    routes.services[_services[i].handle].versions[_versions[j].route] = _versions[j];
                }
    
                for (let j = 0; j < _features.length; j++) {
                    routes.services[_services[i].handle].features[_features[j].handle] = _features[j];
                }
            }
                
            return routes;

        } catch (_e) {
            throw _e;
        }

    };

}