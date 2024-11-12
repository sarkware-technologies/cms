import EntityModel from "../models/entity.js";
import FieldModel from "../models/field.js";
import Utils from "../utils/utils.js";

export default class EntityService {

    constructor() {}

    get = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Entity id is missing");
        }

        try {

            const role = await EntityModel.findOne({ _id: _req.params.id }).lean();
            return role;

        } catch (_e) {
            throw _e;
        }

    };

    list = async (_req) => {

        let _entities = [];

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

        try {
            
            const _count = await EntityModel.countDocuments({});
            _entities = await EntityModel.find({}).sort({ title: 1 }).skip(skip).limit(limit).lean();
            return Utils.response(_count, page, _entities);

        } catch (_e) {
            throw _e;
        }

    };

    listAll = async (_req) => {

        try {
            return await EntityModel.find().lean();
        } catch (_e) {
            throw _e;
        }

    };

    search = async (_req, _page, _skip, _limit, _field, _search) => {

        try {
            const _count = await EntityModel.countDocuments({ [_field]: { $regex: new RegExp(_search, 'i') } });
            const _entities = await EntityModel.find({ [_field]: { $regex: new RegExp(_search, 'i') } }).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();
            return Utils.response(_count, _page, _entities);
        } catch (_e) {
            throw _e;
        }

    };

    groupSeed = async(_req, _field) => {

        try {            
            return await EntityModel.distinct(_field).exec();
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

            const _count = await EntityModel.countDocuments(query);
            const _entities = await EntityModel.find(query).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();

            return Utils.response(_count, _page, _entities);

        } catch (_e) {
            throw _e;
        }

    };

    count = async (_req) => {

        try {
            return await EntityModel.countDocuments({});
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
            const model = new EntityModel(body);
            const entity = await model.save();                            

            return {
                status: true,
                message: "Entity "+ entity.title +" is created successfully",
                payload: entity
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
                message: _e.message || 'An error occurred while creating entity'
            };
        }

    };

    handle = async (_req) => {

        const handle = _req.params.handle;

        try {

            const role = await EntityModel.findOne({handle: handle})
            
            if(!role){
                throw new Error("No entity with the given handle")
            }

            return role;

        } catch (_e) {
            throw _e;
        }

    };


    update = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Entity id is missing");
        }

        try {
            return await EntityModel.findByIdAndUpdate(_req.params.id, { $set: { ..._req.body } }, { runValidators: true, new: true });
        } catch (_e) {
            throw _e;
        }

    };

    delete = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Entity id is missing");
        }

        try {     
            await FieldModel.deleteMany({ entity: _req.params.id });       
            await EntityModel.deleteOne({ _id: _req.params.id });
            return { status: true, message: "Entity removed successfully" };
        } catch (_e) {
            throw _e;
        }

    };

    listFields = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Entity id is missing");
        }

        const limit = 10;
        let _entity = null;
        let _targetId = null;
        const populate = _req.query.populate ? _req.query.populate : false; 
        const page = parseInt(_req.query.page) || 1;
        const skip = (page - 1) * limit;             

        try {

            let _fields = [];
            const _count = await FieldModel.countDocuments({entity: _req.params.id});            

            if (populate) {
                _fields = await FieldModel.find({entity: _req.params.id}).populate('entity').sort({handle:1}).skip(skip).limit(limit).lean().exec();
            } else {
                _fields = await FieldModel.find({entity: _req.params.id}).sort({handle:1}).skip(skip).limit(limit).lean();
            }

            /* If the field type is ObjectId then populate the Foreign Entity */
            for (let i = 0; i < _fields.length; i++) {
                if (_fields[i].type === 5 || _fields[i].type === 6) {                    
                    let options = {};
                    try {

                        options = JSON.parse(_fields[i].options);
                        _targetId = options.entity ? options.entity : options.itemTarget;
                        _entity = await EntityModel.findOne({_id: _targetId});

                        if (_fields[i].type == 5) {
                            _fields[i].options = JSON.stringify({entity: _entity});
                        } else {
                            options.itemTarget = _entity;
                            _fields[i].options = options;
                        }
                        
                    } catch(_e) {
                        /* Ignore */
                    }
                }
            }
            
            return Utils.response(_count, page, _fields, limit);            

        } catch (_e) {
            throw _e; 
        }

    };    

    prepareEntity = async (_entity) => {

        let entity = null;
        let _fields = [];
        const result = {};

        try {

            /* Try with _id */
            entity = await EntityModel.findOne({_id: _entity}).lean();
            
            if (!entity) {
                /* Check with handle */
                entity = await EntityModel.findOne({handle: _entity}).lean();
            }

            if (entity) {
                _fields = await FieldModel.find({entity: entity._id});  
                result[entity.handle] = {
                    id: entity._id,
                    fields: _fields
                }
            }  
            
        } catch (_e) {
            throw _e; 
        }

        return result;

    }

    prepareEntites = async () => {

        const result = {};

        try {                        
            
            let _fields = [];            
            const entities = await EntityModel.find().lean();

            for (let i = 0; i < entities.length; i++) {                        
                _fields = await FieldModel.find({entity: entities[i]._id});                          
                result[entities[i].handle] = {
                    id: entities[i]._id,
                    fields: _fields
                }
            }                                                          

        } catch (_e) {
            throw _e; 
        }

        return result;

    }

}