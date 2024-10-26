import EntityModel from "../models/entity.js";
import FieldModel from "../models/field.js";
import Utils from "../utils/utils.js";
import cache from "../utils/cache.js";
import EntityService from "./entity.js";

export default class FieldService {

    constructor() {
        this.entityService = new EntityService();
    }

    get = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Field id is missing");
        }

        try {

            return await FieldModel.findOne({ _id: _req.params.id }).lean();            

        } catch (_e) {
            throw _e;
        }

    };

    list = async (_req) => {

        let _fields = [];
        
        const page = parseInt(_req.query.page) || 1;
        const skip = (page - 1) * parseInt(process.env.PAGE_SIZE);
        const limit = parseInt(process.env.PAGE_SIZE);
        const populate = _req.query.populate ? _req.query.populate : false;

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

        try {
            
            const _count = await FieldModel.countDocuments({});

            if (populate) {                
                _fields = await FieldModel.find({}).populate('entity').sort({ title: 1 }).skip(skip).limit(limit).lean().exec();                
            } else {
                _fields = await FieldModel.find({}).sort({ title: 1 }).skip(skip).limit(limit).lean();
            }
            
            return Utils.response(_count, page, _fields);

        } catch (_e) {
            throw _e;
        }

    };

    search = async (_req, _page, _skip, _limit, _field, _search) => {

        try {            
            const _count = await FieldModel.countDocuments({ [_field]: { $regex: new RegExp(_search, 'i') } });
            const _fields = await FieldModel.find({ [_field]: { $regex: new RegExp(_search, 'i') } }).sort({ [_field]: 1 }).populate('entity').skip(_skip).limit(_limit).lean().exec();
            return Utils.response(_count, _page, _fields);
        } catch (_e) {
            throw _e;
        }

    };

    groupSeed = async(_req, _field) => { 

        try {
            if (_field === "entity") {
                const seeds = [];
                const eIds = await FieldModel.distinct(_field).exec();
                for (let i = 0; i < eIds.length; i++) {
                    seeds.push(await EntityModel.findById(eIds[i]).lean());
                }
                return seeds; 
            } 
            return await FieldModel.distinct(_field).exec();
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

            const _count = await FieldModel.countDocuments(query);
            const _fields = await FieldModel.find(query).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();

            return Utils.response(_count, _page, _fields);

        } catch (_e) {
            throw _e;
        }

    };

    count = async (_req) => {

        try {
            return await FieldModel.countDocuments({});
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
            const model = new FieldModel(body);
            const field = await model.save(); 
            
            await this.updateEntityCache(field.entity);
            
            return {
                status: true,
                message: "Field "+ field.title +" is created successfully",
                payload: field
            };

        } catch (_e) {                        

            if (_e.name === 'ValidationError') {
                return {
                    status: false,
                    message: _e.errors
                };
            }
    
            return {
                status: false,
                message: _e.message || 'An error occurred while creating field'
            };

        }

    };

    // to get role data based on role name
    handle = async (_req) => {

        const handle = _req.params.handle

        try {

            const field = await FieldModel.findOne({handle: handle})
            
            if(!field){
                throw new Error("No Field with the given handle")
            }

            return field;

        } catch (_e) {
            throw _e;
        }

    };


    update = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Field id is missing");
        }

        try {

            const field = await FieldModel.findByIdAndUpdate(_req.params.id, { $set: { ..._req.body, updatedBy: _req.user._id } }, { runValidators: true, new: true });
            await this.updateEntityCache(field.entity);
            return field;

        } catch (_e) {
            throw _e;
        }

    };

    delete = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Field id is missing");
        }

        try {                        
            const field = await FieldModel.findById(_req.params.id).lean();
            const res = await FieldModel.deleteOne({ _id: _req.params.id });
            if (field) {
                this.updateEntityCache(field.entity);
            }
            return res;
        } catch (_e) {
            throw _e;
        }

    };

    updateEntityCache = async (_entityId) => {
        
        try {

            const entityObj = await EntityModel.findOne({_id: _entityId}).lean();
            if (entityObj) {
                const entityCacheObj = await this.entityService.prepareEntity(_entityId);
                cache.setEntity(entityObj.handle, entityCacheObj);
            }

        } catch (_e) {
            throw _e;
        }

    };

}