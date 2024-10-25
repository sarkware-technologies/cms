import ModuleModel from "../models/module.js";
import EntityModel from "../models/entity.js";
import EM from "../utils/entity.js";
import EntityModuleMappingModel from "../models/entity-module.js";
import Utils from "../utils/utils.js";
import ComponentService from "./component.js";
import MasterService from "./master.js";
import PageService from "./page.js";
import SegmentService from "./segment.js";

import { EventEmitter } from 'events';
import multer from 'multer';

class ApiManager {

    constructor () {
        
        this.pageService = null;
        this.event = new EventEmitter();
        this.actions = ["record", "list", "count", "create", "update", "bulk_edit", "bulk_update", "delete", "bulk_delete", "bulk_filter_delete", "upload", "export"];    
        
        this.upload = multer({ storage: multer.memoryStorage() });

    }

    init = async() => {

        this.pageService = new PageService();
        this.pageService.init();
        this.componentService = new ComponentService();
        this.componentService.init();
        this.masterService = new MasterService();
        this.masterService.init();
        this.segmentService = new SegmentService();
        this.segmentService.init();

    };

    handle = async (_req, _method) => {
        
        let [module, entity, action] = this.getUrlPathParts(`${_req.protocol}://${_req.get("host")}${_req.originalUrl}`); 

        if (!module) {
            throw new Error("Unknown module");            
        }

        if (!entity) {
            throw new Error("Unknown entity");            
        }

        if (!action) {
            throw new Error("Unknown action");            
        }

        if (this.actions.indexOf(action) === -1) {

            const eventName = ("on_"+ module +"_"+ entity +"_"+ action);

            const listeners = this.event.listeners(eventName);
            if (listeners.length > 0) {  

                try {
                    return await this.triggerEvent(eventName, [_req]);                        
                } catch (_e) {
                    throw _e;
                }           
                
            } else {
                throw new Error("Un supported action");            
            }

        }

        if ((_method === "post" || _method === "put") && !_req.body) {
            throw new Error("Un supported method - request body not found");            
        }

        try {

            if (this.checkModule(module)) {
                if (this.checkEntity(entity)) {
    
                    let response = null;

                    if (action === "record") {
                        response = await this.handleRecord(_req, module, entity);
                    } else if (action === "list") {
                        response = await this.handleList(_req, module, entity);
                    } else if (action === "count") {
                        response = await this.handleCount(_req, module, entity);
                    } else if (action === "create") {
                        response = await this.handleCreate(_req, module, entity);
                    } else if (action === "update") {
                        response = await this.handleUpdate(_req, module, entity);
                    } else if (action === "bulk_edit") {
                        response = await this.handleBulkEdit(_req, module, entity);
                    } else if (action === "bulk_update") {
                        response = await this.handleBulkUpdate(_req, module, entity);
                    } else if (action === "delete") {
                        response = await this.handleDelete(_req, module, entity);
                    } else if (action === "bulk_delete") {
                        response = await this.handleBulkDelete(_req, module, entity);
                    } else if (action === "bulk_filter_delete") {
                        response = await this.handleBulkDeleteWithFilter(_req, module, entity);
                    } else if (action === "upload") {
                        response = await this.handleUpload(_req, module, entity);
                    } else if (action === "export") {
                        response = await this.handleExport(_req, module, entity);
                    }
                    
                    return response;

                }    
            }

        } catch (_e) { 
            throw _e;
        }

    };  

    handleRecord = async (_req, _module, _entity) => {

        if (!_req.query.id) {
            throw new Error("Record id is missing");
        }

        let populateList = [];
        let populate = _req.query.populate;

        if (populate) {             
            
            let paths = populate.split('|');   
            for (let i = 0; i < paths.length; i++) {
                populateList.push({path: paths[i]});
            }

        }

        try {

            let record = {};
            const model = await EM.getModel(_entity);

            if (model) {

                if (Array.isArray(populateList) && populateList.length > 0) {
                    record = await model.findOne({ _id: _req.query.id }).populate(populateList).lean().exec();
                } else {
                    record = await model.findOne({_id: _req.query.id}).lean();
                }                

                return record;

            }    

        } catch (_e) {
            throw _e;
        }

        throw new Error(_entity +" model not found");

    };

    handleList = async (_req, _module, _entity) => {

        let _count = 0;
        let _records = [];

        const page = parseInt(_req.query.page) || 1;
        const skip = (page - 1) * parseInt(process.env.PAGE_SIZE);
        const limit = parseInt(process.env.PAGE_SIZE);

        const searchFor = _req.query.search ? _req.query.search : "";
        const searchFrom = _req.query.field ? _req.query.field : "";

        const filter = _req.query.filter ? _req.query.filter : "";
        const filterBy = _req.query.filter_by ? _req.query.filter_by : "";
        const filterType = _req.query.filter_type ? _req.query.filter_type : "";
        const disablePagination = _req.query.nopage ? _req.query.nopage : false;

        const selectObject = {};
        let selectedFields = [];
        const selectedFieldsParam = _req.query.select ? _req.query.select : null;
        
        if (selectedFieldsParam) {
            selectedFields = selectedFieldsParam.split('|');
            selectedFields.forEach(field => {
                selectObject[field] = 1;
            });
        }

        let populateList = [];
        let populate = _req.query.populate;

        if (populate) {             
            
            let paths = populate.split('|');   
            for (let i = 0; i < paths.length; i++) {
                populateList.push({path: paths[i]});
            }

        }

        let sortQuery = {};
        if (_req.query.sort) {
            sortQuery[_req.query.sort] = 1;
        }

        if (searchFrom !== "") {
            return await this.search(_req, _entity, page, skip, limit, searchFrom, searchFor, populateList, selectObject);
        }

        if (filter !== "") {
            if (filterType === "seeds") {
                return await this.groupSeed(_req, _entity, filter);
            } else {
                return await this.groupBy(_req, _entity, page, skip, limit, filter, filterBy, populateList, selectObject);
            }
        }

        try {
            
            const model = await EM.getModel(_entity);

            if (model) {

                if (!disablePagination) {
                    _count = await model.countDocuments({});

                    if (Array.isArray(populateList) && populateList.length > 0) {
                        _records = await model.find().populate(populateList).select(selectObject).sort(sortQuery).skip(skip).limit(limit).lean().exec();
                    } else {
                        _records = await model.find().select(selectObject).sort(sortQuery).skip(skip).limit(limit).lean();
                    }

                    return Utils.response(_count, page, _records);
                } else {

                    if (Array.isArray(populateList) && populateList.length > 0) { 
                        _records = await model.find().populate(populateList).select(selectObject).sort(sortQuery).lean().exec(); 
                    } else {
                        _records = await model.find().select(selectObject).sort(sortQuery).lean();
                    }

                    return _records;
                }
                

            }

        } catch (_e) {
            throw _e;
        }

        throw new Error(_entity +" model not found");

    };

    handleCount = async (_req, _module, _entity) => {

        try {
            
            const model = await EM.getModel(_entity);

            if (model) {
                return await model.countDocuments({});                
            }
            
        } catch (_e) {            
            throw _e;
        }

        throw new Error(_entity +" model not found");

    };

    handleCreate = async (_req, _module, _entity) => {

        try {   
            
            const model = await EM.getModel(_entity);

            if (model) {  
                
                const { body } = _req.body;

                body["createdBy"] = _req.user._id
                const modelObj = new model(body);
                const record = await modelObj.save();   
                
                let _message = "";
                if (record.title) {
                    _message = "Record "+ record.title +" is created successfully";
                } else if (record.name) {
                    _message = "Record "+ record.name +" is created successfully";
                } else {
                    _message = "Record created successfully";
                }

                return {
                    status: true,
                    message: _message,
                    payload: authType
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
                message: e.message || 'An error occurred while creating auth type'
            };
        }

        throw new Error(_entity +" model not found");

    };

    handleUpdate = async (_req, _module, _entity) => {

        if (!_req.query.id) {
            throw new Error("Record id is missing");
        } 

        try {

            const model = await EM.getModel(_entity);

            if (model) {

                const record = await model.findByIdAndUpdate(_req.query.id, { $set: { ..._req.body, updatedBy: _req.user._id } }, {runValidators: true, new: true });                 
                return record;

            }           

        } catch (_e) {            
            throw _e;
        }

        throw new Error(_entity +" model not found");

    };

    handleBulkEdit = async (_req, _module, _entity) => {

        if (!_req.body.ids) {
            throw new Error("Record ids are missing");
        }

        if (!Array.isArray(_req.body.ids)) {
            throw new Error("Record ids is not an ARRAY");
        }

        if (!_req.body.record) {
            throw new Error("Record data is missing");
        }

        let _success = {};
        let _failed = {};

        try {

            const model = await EM.getModel(_entity);

            if (model) {

                for (let i = 0; i < _req.body.ids.length; i++) {

                    try {
                        _success[_req.body.ids[i]] = await model.findByIdAndUpdate(_req.body.ids[i], { $set: { ..._req.body.record, updatedBy: _req.user._id } }, {runValidators: true, new: true });
                    } catch (_e) {
                        _failed[_req.body.ids[i]] = _e.message;
                    }

                }

                return {
                    success: _success,
                    failed: _failed
                };
            }           

        } catch (_e) {            
            throw _e;
        }

        throw new Error(_entity +" model not found");

    };

    handleBulkUpdate = async (_req, _module, _entity) => {

        if (!_req.body) {
            throw new Error("Request body is missing");
        }        

        let _success = {};
        let _failed = {};

        try {

            const model = await EM.getModel(_entity);

            if (model) {

                const ids = Object.keys(_req.body);
                for (let i = 0; i < ids.length; i++) {

                    try {
                        _success[ids[i]] = await model.findByIdAndUpdate(ids[i], { $set: { ..._req.body[ids[i]], updatedBy: _req.user._id } }, {runValidators: true, new: true });
                    } catch (_e) {
                        _failed[ids[i]] = _e.message;
                    }

                }

                return {
                    success: _success,
                    failed: _failed
                };

            }

        } catch (_e) {            
            throw _e;
        }

        throw new Error(_entity +" model not found");

    };

    handleDelete = async (_req, _module, _entity) => {

        if (!_req.query.id) {
            throw new Error("Record id is missing");
        } 

        try {              
            
            const model = await EM.getModel(_entity);

            if (model) {
                
                const record = await model.deleteOne({_id : _req.query.id});  
                //await axios.get(process.env.COMPOSER_SERVER  +"/cms/api/invalidateAllPageCache");           
                return record;

            }

        } catch (_e) {            
            throw _e;
        }

        throw new Error(_entity +" model not found");

    };

    handleBulkDelete = async (_req, _module, _entity) => {

    };

    handleBulkDeleteWithFilter = async (_req, _module, _entity) => {

        if (!_req.query.field) {
            throw new Error("Field is missing");
        }

        if (!_req.query.value) {
            throw new Error("Field value is missing");
        }

        try {              
            
            const model = await EM.getModel(_entity);

            if (model) {
                return await model.deleteMany( { [_req.query.field]: _req.query.value } );
            }

        } catch (_e) {            
            throw _e;
        }

        throw new Error(_entity +" model not found");

    };

    handleUpload = async (_req, _module, _entity) => {

        return new Promise((resolve, reject) => {

            this.upload.single('file')(_req, null, async (err) => {

                if (err) {
                    console.error(err);
                    reject(err);
                }
    
                //const session = await mongoose.startSession();
                //session.startTransaction();
    
                try {
                    const model = await EM.getModel(_entity);
                    if (!model) {
                        throw new Error(`${_entity} model not found`);
                    }
    
                    // Parse JSON from the uploaded file buffer
                    const jsonData = JSON.parse(_req.file.buffer.toString());    
    
                    // Insert products into MongoDB within a transaction
                    //const result = await model.insertMany(jsonData, { session });
                    const result = await model.insertMany(jsonData);
    
                    // Commit the transaction
                    //await session.commitTransaction();
                    //session.endSession();   
                    
                    resolve(result);

                } catch (_e) {
                    console.error(_e);
                    // Rollback the transaction if an error occurs
                   // await session.abortTransaction();
                    //session.endSession();
                    reject(_e);
                }

            });

        });

    };    

    handleExport = async (_req, module, entity) => {

    };    
    
    checkModule = async (_module) => {

        try {            
            const module = await ModuleModel.findOne({handle: _module}).lean();
            if (module) {
                if (module.status) {
                    return true
                } else {
                    throw new Error(_module +" is in offline mode");   
                }
            }
        } catch (_e) {
            throw _e
        }

        throw new Error(_module +" is not found");

    };

    checkEntity = async (_entity) => {
        
        try {
            const entity = await EntityModel.findOne({handle: _entity}).lean();
            if (entity) {
                if (entity.status) {

                    const mapping = await EntityModuleMappingModel.findOne({entity: entity._id}).lean();
                    if (mapping) {
                        if (mapping.exposed) {
                            return true
                        } else {
                            throw new Error(_entity +" is not available for API");
                        }
                    }                    
                    
                } else {
                    throw new Error(_entity +" is disabled");   
                }
            }
        } catch (_e) {
            throw _e
        }

        throw new Error(_entity +" is not found");

    };

    search = async (_req, _entity, _page, _skip, _limit, _field, _search, _populates, _selectObject) => {

        try {

            let _count = 0;
            let _records = [];

            const model = await EM.getModel(_entity);

            if (model) {

                _count = await model.countDocuments({ [_field]: { $regex: new RegExp('^' + _search, 'i') } });

                if (_populates && Object.keys(_populates).length > 0) {
                    _records = await model.find({ [_field]: { $regex: new RegExp('^' + _search, 'i') } }).populate(_populates).select(_selectObject).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean().exec();
                } else {
                    _records = await model.find({ [_field]: { $regex: new RegExp('^' + _search, 'i') } }).select(_selectObject).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();
                }

            } else {
                throw new Error(_entity +" model not found");
            }

            return Utils.response(_count, _page, _records);

        } catch (_e) {
            throw _e;
        }

    }; 

    groupSeed = async(_req, _entity, _field) => {

        try {

            const model = await EM.getModel(_entity);

            if (model) {
                return await model.distinct(_field).exec();
            } else {
                throw new Error(_entity +" model not found");
            }
            
        } catch (_e) {
            throw _e;
        }

    };

    groupBy = async(_req, _entity, _page, _skip, _limit, _field, _match, _populates, _selectObject) => { 

        try {

            let query = {};
            if (_match) {
                query[_field] = { $in: _match.split('|') };
            }

            let _count = 0;
            let _records = [];
            const model = await EM.getModel(_entity);

            if (model) {

                _count = await model.countDocuments(query);

                if (_populates && Object.keys(_populates).length > 0) {
                    _records = await model.find(query).populate(_populates).select(_selectObject).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean().exec();
                } else {
                    _records = await model.find(query).sort({ [_field]: 1 }).select(_selectObject).skip(_skip).limit(_limit).lean();
                }

            } else {
                throw new Error(_entity +" model not found");
            }

            return Utils.response(_count, _page, _records);

        } catch (_e) {
            throw _e;
        }

    };

    triggerEvent = (_event, _params) => {

        return new Promise(async (resolve, reject) => {
            try {
                
                this.event.emit(_event, _params, (result, error) => {
                    
                    if (result) {                                                
                        resolve(result);
                    } else {
                        reject(error);
                    }
                    
                }); 
                
            } catch (_e) {
                reject(_e);
            }
        });

    };
    
    getUrlPathParts = (_url) => {
        
        const parsedUrl = new URL(_url);
        const pathname = parsedUrl.pathname;
        const parts = pathname.split("/").filter((part) => part !== "");
    
        if (parts && Array.isArray(parts) && parts.length >= 4) {
          return [parts[2], parts[3], parts[4]];
        }
    
        return [null, null, null];

    };

}

const AP = new ApiManager();
export default AP;