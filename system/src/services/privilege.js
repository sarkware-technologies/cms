import PrivilegeModel from "../models/privilege.js";
import RolePrivilegeMappingModel from "../models/role-privilege-mapping.js";
import Utils from "../utils/utils.js";

export default class PrivilegeService {

    constructor() {}

    get = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Privilege id is missing");
        } 

        try {            
            return await PrivilegeModel.findOne({_id: _req.params.id}).lean();
        } catch (_e) {            
            throw _e;
        }

    }

    listAll = async (_req) => {

        try {
            return await PrivilegeModel.find({}).sort({ title: 1 }).lean();
        } catch (e) {
            throw e;
        }

    };

    list = async (_req) => {

        try {

            let _privileges = [];

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

            const _count = await PrivilegeModel.countDocuments({});
            _privileges = await PrivilegeModel.find({}).sort({ title: 1 }).skip(skip).limit(limit).lean();
            
            return Utils.response(_count, page, _privileges);

        } catch (_e) {            
            throw _e;
        }

    }

    preparePrivilege = async (role) => {
        try{
            const rolePrivileges = await RolePrivilegeMappingModel.find({role: role?.toString()}).populate("privilege")
            return rolePrivileges.map(obj => obj?.privilege)
        } catch(_e){
            throw _e
        }
    }


    search = async (_req, _page, _skip, _limit, _field, _search) => {

        try {

            const _count = await PrivilegeModel.countDocuments({ [_field]: { $regex: new RegExp(_search, 'i') } });
            const _privileges = await PrivilegeModel.find({ [_field]: { $regex: new RegExp(_search, 'i') } }).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();

            return Utils.response(_count, _page, _privileges);

        } catch (_e) {
            throw _e;
        }

    };

    groupSeed = async(_req, _field) => { 

        try {
            return await PrivilegeModel.distinct(_field).exec();
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

            const _count = await PrivilegeModel.countDocuments(query);
            const _privileges = await PrivilegeModel.find(query).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();

            return Utils.response(_count, _page, _privileges);

        } catch (_e) {
            throw _e;
        }

    };

    count = async (_req) => {

        try {
            return await PrivilegeModel.countDocuments({});
        } catch (_e) {            
            throw _e;
        }

    }

    create = async (_req) => {

        try {     
            const model = new PrivilegeModel(_req.body);            
            return await model.save();            
        } catch (_e) {                
            throw _e;
        }

    }

    update = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Privilege id is missing");
        } 

        try {             
            return await PrivilegeModel.findByIdAndUpdate(_req.params.id, { $set: { ..._req.body } }, {runValidators: true, new: true });            
        } catch (_e) {            
            throw _e;
        }

    }

    delete = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Privilege id is missing");
        } 

        try {                 
            return await PrivilegeModel.deleteOne({_id : _req.params.id});           
        } catch (_e) {            
            throw _e;
        }

    }

}