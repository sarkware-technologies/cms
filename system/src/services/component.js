import AP from "./api.js";
import EM from "../utils/entity.js";
import Utils from "../utils/utils.js";
import XlsManager from "../utils/xls-manager.js";
import MYDBM from "../utils/mysql.js";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import multer from 'multer';
import SegmentModel from "../models/segment.js";

export default class ComponentService {

    constructor() {

        this.upload = multer({ storage: multer.memoryStorage() });
        this.s3Client = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY,
                secretAccessKey: process.env.AWS_SECRET_KEY
            }
        });

    }

    cloneGroups = async (_original, _clone) => {

        let _groupObj = null;
        const ruleGroupModel = await EM.getModel("rules_group");
        const _groups = await ruleGroupModel.find({component: _original._id}).lean();

        if (_groups && Array.isArray(_groups)) {
            for (let i = 0; i < _groups.length; i++) {

                _groupObj = new ruleGroupModel({
                    rules: _groups[i].rules,
                    component: _clone._id
                });

                await _groupObj.save();

            }
        }

    };

    prepareCloneHandle = async (_componentObj) => {

        let _title = "";
        let _handle = "";
        let _checkComponent = null;
        const componentModel = await EM.getModel("component");

        for (let i = 1; i < 5000; i++) {
            _checkComponent = await componentModel.findOne({handle: _componentObj.handle +"_"+ i}).lean();
            if (!_checkComponent) {
                _title = _componentObj.title +" "+ i;
                _handle = _componentObj.handle +"_"+ i;
                break;
            }
        }

        return [_title, _handle];

    };

    prepareConfiguration = (componentObj) => {

        let _configuration = componentObj.configuration;   

        if (typeof _configuration === 'string') {
            try {
                _configuration = JSON.parse(_configuration); 
            } catch (_e) {
                _configuration = {};
            }                        
        }

        return _configuration;

    };

    init = async () => {

        AP.event.on('on_component_component_clone', async (_params, callback) => {

            try {

                let result = {};
                const [_req] = _params;                
                const _component = _req.query.component;
                const parentTypes = ["carousel", "product_offer", "card", "crm_bar"];

                const componentModel = await EM.getModel("component");
                const componentObj = await componentModel.findById(_component);
                const componentTypeModel = await EM.getModel("component_type");
                
                if (componentObj) {
                    
                    const componentType = await componentTypeModel.findById(componentObj.type).lean();

                    /* Determine the handle */
                    let [_title, _handle] = await this.prepareCloneHandle(componentObj);

                    if (_title == "" || _handle == "") {
                        callback(null, new Error("Extremly unlikely, couldn't create the handle"));
                        return;
                    }

                    const payload = {
                        title: _title,
                        handle: _handle,    
                        type: componentObj.type,
                        parent: componentObj.parent,
                        configuration: componentObj.configuration,
                        status: componentObj.status,
                        start_date: componentObj.start_date,
                        end_date: componentObj.end_date
                    };

                    /* Clone the component */
                    const newComponent = new componentModel(payload);
                    const clonedComponent = await newComponent.save();
                    result = clonedComponent;

                    if (parentTypes.indexOf(componentType.handle) !== -1) {
                        
                        /* Clone the child components */
                        let childCloneObj = null;
                        let childCloneModel = null;

                        const clonedSequence = [];
                        const originalConfiguration = this.prepareConfiguration(componentObj);
                        const childs = await componentModel.find({ _id: { $in: originalConfiguration.sequence } }).lean();                        

                        for (let i = 0; i < childs.length; i++) {

                            childCloneObj = null;
                            childCloneModel = null;

                            [_title, _handle] = this.prepareCloneHandle(childs[i]);
                            if (_title == "" || _handle == "") {
                                console.log("Extremly unlikely, couldn't create the handle");
                                continue;
                            }

                            childCloneModel = new componentModel({
                                title: _title,
                                handle: _handle,    
                                type: childs[i].type,
                                parent: clonedComponent._id,
                                configuration: childs[i].configuration,
                                status: childs[i].status,
                                start_date: childs[i].start_date,
                                end_date: childs[i].end_date
                            });

                            childCloneObj = await childCloneModel.save();
                            clonedSequence.push(childCloneObj._id);

                            /* Clone the rule groups */
                            await this.cloneGroups(childs[i], childCloneObj);

                        }

                        /* Update sequence */
                        const clonedConfiguration = this.prepareConfiguration(clonedComponent);                       

                        if (!clonedConfiguration["sequence"]) {
                            clonedConfiguration["sequence"] = [];
                        }

                        clonedConfiguration["sequence"] = clonedSequence;
                        
                        await componentModel.findByIdAndUpdate(clonedComponent._id, { $set: { configuration: clonedConfiguration } }, {runValidators: true, new: true });

                    } else {
                        
                        /* Clone the rule groups */
                        await this.cloneGroups(componentObj, clonedComponent);
                        
                        /* Ok, check the component type */
                        if (componentType.is_child) {

                            const parentObj = await componentModel.findById(componentObj.parent).lean();
                            if (parentObj) {

                                const parentConfiguration = this.prepareConfiguration(parentObj);
                                if (parentConfiguration.sequence) {
                                    const index = parentConfiguration.sequence.indexOf(componentObj._id.toString());
                                    if (index !== -1) {
                                        parentConfiguration.sequence.splice((index + 1), 0, clonedComponent._id.toString());
                                        result = await componentModel.findByIdAndUpdate(parentObj._id, { $set: { configuration: parentConfiguration } }, {runValidators: true, new: true });
                                    }
                                }

                            }                          

                        }

                    }                    

                    callback(result, null);

                }

            } catch (_e) {
                callback(null, _e);
            }

        });

        AP.event.on('on_component_page_component_mapping_list_tagged_pages', async (_params, callback) => {
            
            try {

                const [_req] = _params;
                const _page = _req.query.page ? _req.query.page : 1;
                const _component = _req.query.component;

                const pcMapping = await EM.getModel("page_component_mapping");
                const _count = await pcMapping.countDocuments({component: _component});
                const _records = await pcMapping.find({component: _component}).populate("page").lean();

                callback(Utils.response(_count, _page, _records), null);      
                
            } catch (_e) {
                callback(null, _e);
            }

        });

        AP.event.on('on_component_page_component_mapping_check_mapping', async (_params, callback) => {

            try {

                const [_req] = _params;
                const _page = _req.query.page;
                const _component = _req.query.component;

                const pcMapping = await EM.getModel("page_component_mapping");

                callback(await pcMapping.find({page: _page, component: _component}).lean(), null);      
                
            } catch (_e) {
                callback(null, _e);
            }

        });

        AP.event.on('on_component_component_get_page_component', async (_params, callback) => {

            try {

                const [_req] = _params;
                const _page = _req.query.page;
                const _position = _req.query.position;

                if (!_page) {
                    callback(null, new Error("Page parameter is missing"));
                    return;
                }

                if (!_position) {
                    callback(null, new Error("Position parameter is missing"));
                    return;
                }

                const componentModel = await EM.getModel("component");
                const mappingModel = await EM.getModel("page_component_mapping");
                const mappingIds = await mappingModel.find({page: _page, position: _position}).select('component').lean();
                const extractedIds = mappingIds.map(item => item.component.toString());                

                callback(await componentModel.find({_id: { $in: extractedIds }}).lean(), null);

            } catch (_e) {
                callback(null, _e);
            }

        });

        AP.event.on('on_component_component_purge_component', async (_params, callback) => {

            try {

                const [_req] = _params;   
                const componentModel = await EM.getModel("component");
                const ruleModel = await EM.getModel("rule");
                const ruleGroupModel = await EM.getModel("rules_group");          

                /* Remove rules that belongs to this component*/                
                await ruleModel.deleteMany({component: _req.query.id});
                /* Remove rule groups that belongs to this component*/
                await ruleGroupModel.deleteMany({component: _req.query.id});
                /* Remove the component itself */
                callback(await componentModel.deleteOne({_id: _req.query.id}).lean());                                                                                          

            } catch (_e) {
                callback(null, _e);
            }

        });

        AP.event.on('on_component_component_bulk_upload', async (_params, callback) => {

            try {

                const [_req] = _params;   

                this.upload.single('file')(_req, null, async (err) => {

                    if (err) {                        
                        return callback(err, null);
                    }

                    const xlsManager = new XlsManager();
                    const result = await xlsManager.processUpload(_req.file);

                    callback(result, null);
                    return;

                });

            } catch (_e) {
                callback(null, _e);
            }

        });

        AP.event.on('on_component_component_type_designer_data', async (_params, callback) => {
            
            try { 

                const [_req] = _params;
                
                const pageModel = await EM.getModel("page");
                const componentTypeModel = await EM.getModel("component_type");

                if (componentTypeModel) {
                    if (pageModel) {

                        const payload = {
                            page: await pageModel.findById(_req.query.page).lean(),
                            type_list: await componentTypeModel.find().lean()
                        }
                        callback(payload);                                                                          

                    } else {
                        callback(null, new Error("page entity not found"));
                    }
                } else {
                    callback(null, new Error("component_type entity not found"));
                }
                
            } catch (_e) {
                callback(null, _e);
            }

        });    
        
        AP.event.on('on_component_component_type_component_type_list', async (_params, callback) => {

            try {         
                
                const componentTypeModel = await EM.getModel("component_type");

                if (componentTypeModel) {                        
                    callback(await componentTypeModel.find({is_child: false}).lean());                                                                          
                } else {
                    callback(null, new Error("component_type entity not found"));
                }
                
            } catch (_e) {
                callback(null, _e);
            }

        });

        AP.event.on('on_component_component_childrens', async (_params, callback) => {

            try {

                const [_req] = _params;
                const componentModel = await EM.getModel("component");

                if (componentModel) {                        
                    callback(await componentModel.find({parent: _req.query.id}).lean());                                                                          
                } else {
                    callback(null, new Error("component entity not found"));
                }

            } catch (_e) {
                callback(null, _e);
            }

        });

        AP.event.on('on_component_component_parent_list', async (_params, callback) => {

            try {

                let _count = 0;
                let _records = [];

                const [_req] = _params;

                const page = parseInt(_req.query.page) || 1;
                const skip = (page - 1) * parseInt(process.env.PAGE_SIZE);
                const limit = parseInt(process.env.PAGE_SIZE);

                const searchFor = _req.query.search ? _req.query.search : "";
                const searchFrom = _req.query.field ? _req.query.field : "";

                const filter = _req.query.filter ? _req.query.filter : "";
                const filterBy = _req.query.filter_by ? _req.query.filter_by : "";
                const filterType = _req.query.filter_type ? _req.query.filter_type : "";

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
                    callback(await this.componentSearch(_req, "component", page, skip, limit, searchFrom, searchFor, populateList), null);
                    return;
                }

                if (filter !== "") {
                    if (filterType === "seeds") {
                        const _seeds = await this.componentGroupSeed(_req, "component", filter);                        
                        callback(_seeds, null);
                    } else {
                        callback(await this.componentGroupBy(_req, "component", page, skip, limit, filter, filterBy, populateList), null);                        
                    }
                    return;
                }
                    
                const model = await EM.getModel("component");
                const pcMapping = await EM.getModel("page_component_mapping");  

                if (model) {

                    _count = await model.countDocuments({parent: null});

                    if (Array.isArray(populateList) && populateList.length > 0) {
                        _records = await model.find({parent: null}).populate(populateList).sort(sortQuery).skip(skip).limit(limit).lean().exec();
                    } else {
                        _records = await model.find({parent: null}).sort(sortQuery).skip(skip).limit(limit).lean();
                    }

                    let pages = [];
                    let mappingRecords = []
                    /* Fetch the mapped page list */
                    for (let i = 0; i < _records.length; i++) {

                        pages = [];
                        mappingRecords = await pcMapping.find({component: _records[i]._id}).populate("page").lean();

                        for (let j = 0; j < mappingRecords.length; j++) {
                            pages.push(mappingRecords[j].page.title);
                        }

                        _records[i]["pages"] = pages.join(", ");

                    }
                    
                    callback(Utils.response(_count, page, _records), null);

                }       

            } catch (_e) { console.log(_e);
                callback(null, _e);
            }
           
        });   
        
        AP.event.on('on_component_component_s3_upload', async (_params, callback) => {

            try {

                const [_req] = _params;   

                this.upload.single('file')(_req, null, async (err) => {

                    if (err) {                        
                        return callback(err);
                    }
        
                    // Access the processed file from the request object
                    const processedFile = _req.file;
                    const assetKey = `${Date.now().toString()}-${processedFile.originalname}`;
        
                    // Specify S3 upload parameters
                    const params = {
                        Bucket: process.env.AWS_BUCKET,
                        Key: process.env.AWS_BUCKET_ASSET_FOLDER +"/"+ assetKey,
                        Body: processedFile.buffer,
                        ContentType: processedFile.mimetype,
                        ACL: 'public-read', 
                    };

                    const command = new PutObjectCommand(params);
                    const response = await this.s3Client.send(command);
                    const publicUrl = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_BUCKET_ASSET_FOLDER}/${assetKey}`;

                    callback(publicUrl, null);
                    return;

                });

            } catch (_e) {
                callback(null, _e);
            }

        });

        AP.event.on('on_component_component_s3_upload_for_child', async (_params, callback) => {

            try {

                const [_req] = _params;   

                this.upload.single('file')(_req, null, async (err) => {

                    if (err) {                        
                        return callback(err);
                    }

                    let config = {};
                    let result = {};
                    const property = _req.body.property;
                    const componentId = _req.body.componentId;
        
                    // Access the processed file from the request object
                    const processedFile = _req.file;
                    const assetKey = `${Date.now().toString()}-${processedFile.originalname}`;
        
                    // Specify S3 upload parameters
                    const params = {
                        Bucket: process.env.AWS_BUCKET,
                        Key: process.env.AWS_BUCKET_ASSET_FOLDER +"/"+ assetKey,
                        Body: processedFile.buffer,
                        ContentType: processedFile.mimetype,
                        ACL: 'public-read', 
                    };

                    const command = new PutObjectCommand(params);
                    const response = await this.s3Client.send(command);
                    const publicUrl = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_BUCKET_ASSET_FOLDER}/${assetKey}`;

                    /* Update the component configuration */
                    const componentModel = await EM.getModel("component");

                    if (componentModel) {

                        const component = await componentModel.findById(componentId).lean();
                        if (component) {

                            config = component.configuration;
                            if (typeof component.configuration === "string" && component.configuration !== "") {
                                config = JSON.parse(component.configuration);
                            }

                            if (!config) {
                                config = {};
                            }

                            if (config) {
                                config[property] = publicUrl;
                                await componentModel.updateOne(
                                    { _id: componentId },
                                    { $set: { configuration: config } }
                                );
                                result = await componentModel.findById(componentId).lean();
                            }
                            
                        }

                        callback(result, null);
                        return;

                    } else {
                        callback(null, new Error("component entity not found"));
                    }

                    return;

                });                

            } catch (_e) {
                callback(null, _e);
            }

        });  
        
        AP.event.on('on_component_component_remove_asset', async (_params, callback) => { 

            try {

                let config = {};
                let result = {};
                const [_req] = _params;   
                const componentModel = await EM.getModel("component");

                if (componentModel) { 

                    const component = await componentModel.findById(_req.body.componentId).lean();
                    if (component) {

                        config = component.configuration;
                        if (typeof component.configuration === "string" && component.configuration !== "") {
                            config = JSON.parse(component.configuration);
                        } 

                        if (!config) {
                            config = {};
                        }

                        if (config) {
                            config[_req.body.property] = "";
                            await componentModel.updateOne(
                                { _id: _req.body.componentId },
                                { $set: { configuration: config } }
                            );
                            result = await componentModel.findById(_req.body.componentId).lean();
                        }

                        callback(result, null);
                        return;
                    }

                } else {
                    callback(null, new Error("component entity not found"));
                }

            } catch (_e) {
                callback(null, _e);
            }
            
        });

        AP.event.on('on_component_component_multi_select_list', async (_params, callback) => { 

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
                        callback(await MYDBM.queryWithConditions("select RetailerId, RetailerName from retailers", []), null);
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

        AP.event.on('on_component_component_update_sequence', async (_params, callback) => { 

            try {

                let result = null;
                const [_req] = _params;   
                const _componentId = _req.query.id;

                if (_componentId) {
                        
                    const componentModel = await EM.getModel("component");
                    if (componentModel) {

                        const _component = await componentModel.findById(_componentId).lean();
                        if (_component) {

                            let config = _component.configuration;
                            if (typeof _component.configuration === "string" && _component.configuration !== "") {
                                config = JSON.parse(_component.configuration);                                
                            }

                            if (!config) {
                                config = {"sequence": []};
                            }

                            config["sequence"] = _req.body;

                            await componentModel.updateOne(
                                { _id: _componentId },
                                { $set: { configuration: JSON.stringify(config) } }
                            );

                            callback(await componentModel.findById(_componentId).lean(), null);

                        } else {
                            callback(null, new Error("No record found for _id : "+ _componentId));
                        }

                    } else {
                        callback(null, new Error("component entity not found"));
                    }

                } else {
                    callback(null, new Error("component id is required"));
                }

            } catch (_e) {
                callback(null, _e);
            }

        });        

        AP.event.on('on_component_component_fetch_rule_groups', async (_params, callback) => { 

            try {

                const [_req] = _params;   
                const _componentId = _req.query.id;
                const groups = await this.fetchComponentRules(_req.query.id);
                callback(groups, null);

            } catch (_e) {
                callback(null, _e);
            }

        });

        AP.event.on('on_component_rules_group_create_rule', async (_params, callback) => { 

            try {

                const [_req] = _params;   
                const _groupId = _req.query.gid;

                if (_groupId) {

                    const ruleModel = await EM.getModel("rule");
                    const groupRulesModel = await EM.getModel("rules_group");

                    if (ruleModel && groupRulesModel) {
                        
                        const ruleModelObj = new ruleModel(_req.body);
                        const rule = await ruleModelObj.save(); 

                        let group = await groupRulesModel.findById(_groupId);
                        
                        if (!group) {
                            /* Create group */
                            const gModel = new groupRulesModel({
                                component: _req.body.component,
                                rules: []
                            });
                            group = await gModel.save();
                        }

                        if (!group.rules || !Array.isArray(group.rules)) {
                            group.rules = [];
                        }

                        group.rules.push(rule._id);

                        await groupRulesModel.updateOne(
                            { _id: group._id },
                            { $set: { rules: group.rules } }
                        );

                        callback(rule, null);

                    } else {
                        callback(null, new Error("group or rules entity not found"));
                    }

                } else {
                    callback(null, new Error("Rule group id is required"));
                }

            } catch (_e) {
                callback(null, _e);
            }

        });        

        AP.event.on('on_component_rules_group_remove_rule', async (_params, callback) => { 

            try {

                const [_req] = _params;   
                const _groupId = _req.query.gid;
                const _ruleId = _req.query.rid;

                if (_groupId && _ruleId) {

                    const ruleModel = await EM.getModel("rule");
                    const groupRulesModel = await EM.getModel("rules_group");

                    if (ruleModel && groupRulesModel) {

                        await ruleModel.deleteOne({_id : _ruleId});
                        const group = await groupRulesModel.findById(_groupId).lean();

                        if (group) {

                            const _rules = group["rules"];
                            if (_rules && Array.isArray(_rules)) {

                                const rIndex = _rules.indexOf(_ruleId);
                                _rules.splice(rIndex, 1);

                                if (_rules.length > 0) {
                                    callback(await groupRulesModel.findByIdAndUpdate(_groupId, { $set: { rules: _rules } }, {runValidators: true, new: true }), null);
                                } else {
                                    callback(await groupRulesModel.deleteOne({_id : _groupId}), null);
                                }

                            }

                        }

                    } else {
                        callback(null, new Error("group or rules entity not found"));
                    }

                } else {
                    callback(null, new Error("Required param is missing"));
                }


            } catch (_e) {
                callback(null, _e);
            }

        });

        AP.event.on('on_component_rules_group_persist_group_rules', async (_params, callback) => { 

            try {

                const [_req] = _params;   
                const _compId = _req.query.id;

                const model = await EM.getModel("rule");

                if (model) {

                    const ids = Object.keys(_req.body);
                    for (let i = 0; i < ids.length; i++) {

                        try {
                            await model.findByIdAndUpdate(ids[i], { $set: { ..._req.body[ids[i]] } }, {runValidators: true, new: true });
                        } catch (_e) {
                            console.log(_e);
                        }

                    }

                    callback(await this.fetchComponentRules(_compId));

                }

            } catch (_e) {
                callback(null, _e);
            }

        });
        
    };

    fetchComponentRules = async (_componentId) => {

        try {

            let rules = null;
            let groups = null;
            let _groups = null;

            if (_componentId) {

                const ruleModel = await EM.getModel("rule");
                const groupRulesModel = await EM.getModel("rules_group");

                if (ruleModel && groupRulesModel) {
                    
                    groups = {};
                    _groups = await groupRulesModel.find({component: _componentId}).lean();

                    for (let i = 0; i < _groups.length; i++) {

                        if (_groups[i].rules && Array.isArray(_groups[i].rules)) {
                            rules = [];
                            for (let j = 0; j < _groups[i].rules.length; j++) {
                                rules.push(await ruleModel.findById(_groups[i].rules[j]));
                            }
                            groups[_groups[i]._id] = rules;
                        } else {
                            groups[_groups[i]._id] = [];
                        }                           

                    }  
                    
                    return groups;

                } else {
                    throw new Error("group or rules entity not found");
                }

            } else {
                throw new Error("component id is required");
            }

        } catch (_e) {
            throw _e;
        }
    };

    componentSearch = async (_req, _entity, _page, _skip, _limit, _field, _search, _populates) => {

        try {

            let _count = 0;
            
            let query = {};
            query[_field] = { $regex: new RegExp(_search, 'i') }
            
    
            const componentModel = await EM.getModel("component");
    
            if (!componentModel) {
                throw new Error(_entity + " model not found");
            }
    
            let components = await componentModel.find(query)
                .populate({
                    path: 'type',
                    match: { is_child: false }
                })
                .sort({ [_field]: 1 })
                .skip(_skip)
                .limit(_limit)
                .exec();
    
            // Filter out documents where type is null (due to the match condition)
            components = components.filter(component => component.type !== null);
    
            // Count total documents matching the query (after filtering)
            _count = await componentModel.countDocuments(query);
    
            return Utils.response(_count, _page, components);
        } catch (_e) {
            throw _e;
        }

    }; 

    componentGroupSeed = async(_req, _entity, _field) => {

        try {

            const model = await EM.getModel(_entity);
            const pageModel = await EM.getModel("page");

            if (model) {
                const pageIds = await model.distinct(_field).exec();
                return await pageModel.find({ _id: {$in: pageIds}}).select("_id title").lean().exec();
            } else { 
                throw new Error(_entity +" model not found");
            }
            
        } catch (_e) {
            throw _e;
        }

    };
    
    componentGroupBy = async(_req, _entity, _page, _skip, _limit, _field, _match, _populates) => { 
        try {
            let query = {};
            if (_match) {
                query[_field] = { $in: _match.split('|') };
            }
    
            const componentModel = await EM.getModel("component");
    
            if (!componentModel) {
                throw new Error(_entity + " model not found");
            }
    
            let components = await componentModel.find(query)
                .populate({
                    path: 'type',
                    match: { is_child: false }
                })
                .populate("page")
                .sort({ [_field]: 1 })
                .skip(_skip)
                .limit(_limit)
                .exec();
    
            // Filter out documents where type is null (due to the match condition)
            components = components.filter(component => component.type !== null);
    
            // Count total documents matching the query (after filtering)
            const _count = await componentModel.countDocuments(query);
    
            return Utils.response(_count, _page, components);
        } catch (_e) {
            throw _e;
        }
    };

}