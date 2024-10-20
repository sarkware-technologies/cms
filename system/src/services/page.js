import AP from "./api.js";
import EM from "../utils/entity.js";

export default class PageService {

    constructor() {}

    init = async () => {

        
        AP.event.on('on_page_page_purge_page', async (_params, callback) => {

            try {

                const [_req] = _params;
                const _page = _req.query.id;

                if (!_page) {
                    callback(null, new Error("page param is missing"));  
                    return;
                }

                const pageModel = await EM.getModel("page"); 
                const pcMapping = await EM.getModel("page_component_mapping");

                /* Remove mapping that belongs to this page */                
                await pcMapping.deleteMany({page: _page});
                /* Remove the page itself */
                callback(await pageModel.deleteOne({_id: _page}).lean());

            } catch (error) {       
                callback(null, error);
            }

        });

        AP.event.on('on_page_page_clone', async (_params, callback) => {

            try {

                const [_req] = _params;
                const _page = _req.query.page;
                
                if (!_page) {
                    callback(null, new Error("page param is missing"));  
                    return;
                }

                const pageModel = await EM.getModel("page"); 
                /* Get the page */
                const page = await pageModel.findById(_page).lean();

                let _checkPage = null;
                let _title = "";
                let _handle = "";

                /* Detrmine the handle */
                for (let i = 1; i < 5000; i++) {
                    _checkPage = await pageModel.findOne({handle: page.handle +"_"+ i}).lean();
                    if (!_checkPage) {
                        _title = page.title +" "+ i;
                        _handle = page.handle +"_"+ i;
                        break;
                    }
                }

                if (_title == "" || _handle == "") {
                    callback(null, new Error("Extremly unlikely, couldn't create the handle"));
                    return;
                }

                const payload = {
                    title: _title,
                    handle: _handle,
                    type: page.type,
                    status: false,
                    sequence: page.sequence,
                    is_default: false
                };

                /* Clone the page */

                const newPage = new pageModel(payload);
                const clonedPage = await newPage.save();

                /* Clone the Component Mapping */
                let mapObj = null;
                const pcMapping = await EM.getModel("page_component_mapping");
                const mappingRecords = await pcMapping.find({page: page._id}).lean();

                for (let i = 0; i < mappingRecords.length; i++) {

                    mapObj = new pcMapping({
                        page: clonedPage._id,
                        component: mappingRecords[i].component,
                        position: mappingRecords[i].position,
                    });

                    await mapObj.save();

                }

                callback(clonedPage, null);

            } catch (error) {       
                callback(null, error);
            }

        });

        AP.event.on('on_page_page_toggle_page_status', async (_params, callback) => {

            try {

                const [_req] = _params;
                const _page = _req.query.page;
                const _status = _req.query.status;

                if (!_page) {
                    callback(null, new Error("page param is missing"));  
                    return;
                }

                const pageModel = await EM.getModel("page"); 
                /* Get the page */
                const page = await pageModel.findById(_page).populate("type").lean();

                if (page.type.handle == "dedicated_page") {
                    if (!_status || _status === "false") {
                        callback(null, new Error("Disable action not allowed for dedicated pages")); 
                    } else {                        
                        await pageModel.findByIdAndUpdate(page._id, { $set: { ...page, status: true } }, { runValidators: true, new: true });
                        callback("Enabled successfully", null);
                    }
                } else {

                    if (page) {

                        /* Disbale not allowed */
                        if (!_status || _status === "false") { 
    
                            /* Check whether this page is default */
                            if (page.is_default) {
                                callback(null, new Error("Default page cannot be disabled"));                        
                            } else {
                                callback(null, new Error("Disable action not allowed"));                        
                            }
    
                            return;
    
                        } 
                    
                        /* get the list of pages of same type */
                        const pageList = await pageModel.find({type: page.type._id, is_default: false}).lean();
    
                        /* Disable the pages */
                        for (let i = 0; i < pageList.length; i++) {
                            if (pageList[i].status) {
                                await pageModel.findByIdAndUpdate(pageList[i]._id, { $set: { ...pageList[i], status: false } }, { runValidators: true, new: true });
                            }
                        }
    
                        /* Enable the current page */
                        await pageModel.findByIdAndUpdate(page._id, { $set: { ...page, status: true } }, { runValidators: true, new: true });
                        callback("Enabled successfully", null);
    
                    } else {
                        callback(null, new Error("Invalid page"));  
                    }

                }

            } catch (error) {       
                callback(null, error);
            }

        });

        AP.event.on('on_page_page_type_create_new_page_type', async (_params, callback) => {

            try {

                const [_req] = _params;

                const PageTypeModel = await EM.getModel("page_type");  
                const model = new PageTypeModel(_req.body);
                const pageType = await model.save();

                /* Add Default Page */
                const PageModel = await EM.getModel("page");

                const pageObj = new PageModel({
                    title: "Template - "+ pageType.title,
                    sequence: [],
                    handle: "template_"+ pageType.handle,
                    status: true,
                    is_default: true,
                    type: pageType._id
                });

                await pageObj.save();

                callback(pageType, null);

            } catch (error) {                
                callback(null, error);
            }

        });

        AP.event.on('on_page_page_type_pagetype_list', async (_params, callback) => {
            
            try {                
                
                const model = await EM.getModel("page_type");

                if (model) {
                    callback(await model.find().lean());                                           
                } else {
                    callback(null, new Error("page_type entity not found"));
                }   

            } catch (error) {                
                callback(null, error);
            }

        });        
        
    };

}