import CapabilityModel from "../models/capability.js";
import ModuleModel from "../models/module.js";
import MenuModel from "../models/menu.js"
import RoleModel from "../models/role.js";
import Utils from "../utils/utils.js";
import PrivilegeModel from "../models/privilege.js";
import RolePrivilegeMappingModel from "../models/role-privilege-mapping.js";
import cache from "../utils/cache.js"

export default class RoleService {

    constructor () {}

    list = async (_req) => {

        try {

            let _roles = [];

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

            const _count = await RoleModel.countDocuments({});
            _roles = await RoleModel.find({}).sort({ title: 1 }).skip(skip).limit(limit).lean();
            
            return Utils.response(_count, page, _roles);

        } catch (e) {
            throw _e;
        }

    };

    search = async (_req, _page, _skip, _limit, _field, _search) => {

        try {

            const _count = await RoleModel.countDocuments({ [_field]: { $regex: new RegExp(_search, 'i') } });
            const _roles = await RoleModel.find({ [_field]: { $regex: new RegExp(_search, 'i') } }).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();

            return Utils.response(_count, _page, _roles);

        } catch (_e) {
            throw _e;
        }

    };

    groupSeed = async(_req, _field) => { 

        try {
            return await RoleModel.distinct(_field).exec();
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

            const _count = await RoleModel.countDocuments(query);
            const _roles = await RoleModel.find(query).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();

            return Utils.response(_count, _page, _roles);

        } catch (_e) {
            throw _e;
        }

    };

    count = async (_req) => {

        try {
            return await RoleModel.countDocuments({});
        } catch (_e) {
            throw _e;
        }

    };

    get = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Role id is missing");
        }

        try {
            return await RoleModel.findOne({ _id: _req.params.id }).lean();
        } catch (_e) {
            throw _e;
        }

    };

    getAll = async (_req) => {

        try {
            return await RoleModel.find().lean();
        } catch (_e) {
            throw _e;
        }

    };

    update = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Role id is missing");
        }

        try {
            return await RoleModel.findByIdAndUpdate(_req.params.id, { $set: { ..._req.body, updatedBy: _req.user._id } }, { runValidators: true, new: true });
        } catch (_e) {
            throw _e;
        }

    };

    delete = async (_req) => {
        
        if (!_req.params.id) {
            throw new Error("Role id is missing");
        }

        try {
            await CapabilityModel.deleteMany({ role: _req.params.id });
            return await RoleModel.deleteOne({ _id: _req.params.id });            
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
            const model = new RoleModel(body);
            const role = await model.save();
            await this.initCapabilities(role._id, _req.user._id);            

            return {
                status: true,
                message: 'You request submitted, please wait until the administrator approve your reguest',
                payload: role
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
                message: e.message || 'An error occurred while creating role'
            };

        }

    };

    loadCapabilities = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Role id is missing");
        }

        try {

            const _modules = await ModuleModel.find().lean();
            const _caps = await CapabilityModel.find({ role: _req.params.id }).lean();

            return {
                modules: _modules,
                capabilities: _caps
            }

        } catch (_e) {
            throw _e;
        }

    }

    updateCapabilities = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Role id is missing");
        }
        
        try {

            let cId = null;
            const capabilities = _req.body;
            
            for (let i = 0; i < capabilities.length; i++) {
                cId = capabilities[i]._id;
                delete capabilities[i]._id;
                await CapabilityModel.findByIdAndUpdate(cId, { $set: { ...capabilities[i], updatedBy: _req.user._id } }, { runValidators: true, new: false });                               
            }

            cache.setCapability(_req.params.id);

            return {status: true};

        } catch (_e) {            
            throw _e;
        }

    }

    initCapabilities = async (_roleId, _userId) => { 

        try {

            let model = null;
            let _modules = await ModuleModel.find({}).lean();
            
            for (let i = 0; i < _modules.length; i++) {

                const capExist = await CapabilityModel.findOne({role: _roleId, module: _modules[i]._id});
                if (!capExist) {
                    const cap = {
                        role            : _roleId,
                        module          : _modules[i]._id,
                        can_read        : false,
                        can_create      : false,
                        can_update      : false,
                        can_delete      : false,
                        createdBy      : _userId
                    };
    
                    model = new CapabilityModel(cap);
                    await model.save();
                }

            }

        } catch (_e) {
            throw _e;
        }

        return true;

    }

    prepareModulesAndCapabilities = async (_roleId) => {
        
        let menu = {};
        let menus = [];        
        let capabilities = [];

        try {                        
            
            capabilities = await CapabilityModel.find({ role: _roleId }).populate({
                path: 'module',
                match: { status: true }
            }).lean();

            for (let i = 0; i < capabilities.length; i++) {

                if (capabilities[i].can_read || capabilities[i].can_create || capabilities[i].can_delete || capabilities[i].can_update) {
                    
                    menu = await MenuModel.findOne({ module: capabilities[i].module._id }).lean();
                    if (menu) {
                        delete menu["createdBy"];
                        delete menu["updatedBy"];

                        menu["capability"] = {
                            get: capabilities[i].can_read,
                            post: capabilities[i].can_create,
                            delete: capabilities[i].can_delete,
                            put: capabilities[i].can_update
                        }
                        menus.push(menu);
                    }
                }

            }

        } catch (_e) {
            throw _e;
        }

        return menus;

    };

    loadPrivileges = async (_req) => {

        if (!_req.params.id) {
          throw new Error("Role id is missing");
        }
    
        let _count = 0;
        let _privileges = [];
    
        try {

            _privileges = await RolePrivilegeMappingModel.find({
                role: _req.params.id,
            }).lean();
        
            if (_privileges) {
                _count = _privileges.length;
            }        
            
            const rolePrivileges = _privileges;
            const allPrivileges = await PrivilegeModel.find({}).lean();
            _count = allPrivileges.length;
    
            _privileges = {
                privileges: allPrivileges,
                assigned: rolePrivileges,
            };            
    
            return Utils.response(_count, 0, _privileges);

        } catch (_e) {
            throw _e;
        }

    };
    
    addPrivilege = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Role id is missing");
        }
    
        if (!_req.body.privilege) {
            throw new Error("Privilege is missing");
        }
    
        try {
            const model = new RolePrivilegeMappingModel({
                role: _req.params.id,
                privilege: _req.body.privilege,
            });
            await model.save();
        
            const rolePrivileges = await RolePrivilegeMappingModel.find({
                role: _req.params.id,
            }).lean();
            const allPrivileges = await PrivilegeModel.find({}).lean();

            await cache.setPrivilege(_req.params.id);
        
            return {
                privileges: allPrivileges,
                assigned: rolePrivileges,
            };
        } catch (_e) {
            throw _e;
        }

    };
    
    removePrivilege = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Role id is missing");
        }
    
        if (!_req.body.privilege) {
            throw new Error("Privilege is missing");
        }
    
        try {
            await RolePrivilegeMappingModel.deleteOne({
                role: _req.params.id,
                privilege: _req.body.privilege,
            });
    
            const rolePrivileges = await RolePrivilegeMappingModel.find({
                role: _req.params.id,
            }).lean();
            const allPrivileges = await PrivilegeModel.find({}).lean();

            await cache.setPrivilege(_req.params.id);
    
            return {
                privileges: allPrivileges,
                assigned: rolePrivileges,
            };

        } catch (_e) {
            throw _e;
        }

    };

}