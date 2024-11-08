import React from "react";
import { createRoot } from 'react-dom/client';
import EntityMapper from "../components/entity-mapper";

export default function ServiceContext(_component) {

    this.component = _component;
    this.config = this.component.config;
    this.controller = window._controller;

    this.entityMapper = null;
    this.entities = [];

    /**
     * 
     * Context init handler, this is the place where everything get start ( context wise - not global wise ) 
     *
     **/
    this.init = () => {

        this.controller.docker.dock({
            method: "GET",
            endpoint: "/system/v1/entity/all"
        }).then((response) => {
            this.entities = response;
        })
        .catch((e) => {
            console.log(e);
        });

        this.controller.switchView("main_view");

    };  

    /**
     * 
     * @param {*} _handle 
     * @param {*} _datasource 
     * @returns 
     * 
     * Called before making request to server - for datagrid
     * 
     */
    this.onDatagridRequest = (_handle, _datasource) => {

        let datasource = JSON.parse(JSON.stringify(_datasource));
        const currentEntity = this.component.currentRecord["module_grid"];

        if (currentEntity) {
            if (_handle === "module_entity_grid") {                
                datasource["endpoint"] = "/system/v1/module/"+ currentEntity._id +"/entities?populate=true";
            }
        }

        return datasource;

    };

    /**
     * 
     * @param {*} _handle 
     * 
     * Called after the select box component option's loaded (happens only remote config)
     * 
     */
    this.afterSelectBoxLoaded = (_handle) => {

        if (_handle == "module_form_service") {
            const serviceSelect = this.controller.getField("module_form_service");
            const currentRecord = this.component.currentRecord["module_grid"];
            if (serviceSelect && currentRecord) {
                serviceSelect.setVal(currentRecord["service"]);
            }
        }

    };

    /**
     * 
     * @param {*} _handle 
     * @param {*} _toggleHandle 
     * @param {*} _record 
     * @param {*} _status 
     * @returns 
     * 
     * Called whenever toggle field change (in datagrid)
     * This option assumes that it will always be the status field
     * So it will automatically update the record in db as well, unless you return false 
     * 
     */
    this.onRecordToggleStatus = (_handle, _toggleHandle, _record, _status) => {

        if (_handle == "module_entity_grid" && _record) {

            const moduleRecord = this.component.currentRecord["module_grid"];
            const mappingGrid = window._controller.getField("module_entity_grid");

            if (moduleRecord) {

                const request = {};
                request["method"] = "PUT";  

                if (_toggleHandle == "exposed") {
                    request["endpoint"] = "/system/v1/module/"+ moduleRecord._id +"/entities?mapping_id="+ _record._id;          
                    request["payload"] = { exposed: _status };  
                } else if (_toggleHandle == "has_form") {
                    request["endpoint"] = "/system/v1/module/"+ moduleRecord._id +"/entities?mapping_id="+ _record._id;     
                    request["payload"] = { has_form: _status };  
                }

                this.controller.docker.dock(request).then((_res) => {
                    window._controller.notify(_record.entity.title +" has been "+ (_status ? "enabled" : "disabled"));                                          
                    if (mappingGrid) {
                        mappingGrid.initFetch();
                    }
                })
                .catch((e) => {
                    if (mappingGrid) {
                        mappingGrid.initFetch();
                    }
                    this.controller.notify(e.message, "error");
                });
    
                return false;

            }            
            
        }

        return true;

    };

    /**
     * 
     * @param {*} _e 
     * @param {*} _field 
     * @param {*} _grid 
     * @param {*} _record 
     * 
     * Called whenever user click on the datagrid record (button type)
     * 
     */
    this.onRecordButtonClick = (_e, _field, _grid, _record) => {

        const moduleRecord = this.component.currentRecord["module_grid"];

        if (_grid == "module_entity_grid" && _field == "DELETE_MAPPING" && moduleRecord) {

            const request = {};        
            request["method"] = "DELETE";
            request["endpoint"] = "/system/v1/module/"+ moduleRecord._id +"/entities?mapping_id="+ _record._id;
            const mappingGrid = window._controller.getField("module_entity_grid");
            
            this.controller.docker.dock(request).then((_res) => {
                window._controller.notify(_record.entity.title +" mapping has been removed successfully");                                          
                if (mappingGrid) {
                    mappingGrid.initFetch();
                    this.entityMapper.current.initFetch();
                }
            })
            .catch((e) => {
                if (mappingGrid) {
                    mappingGrid.initFetch();
                }
                this.controller.notify(e.message, "error");
            });

        }

    };

    /**
     * 
     * @param {*} _handle 
     * @param {*} _value 
     * @param {*} _e 
     * 
     * Called whenever user click pressing key on any fields or grid cell 
     * 
     */
    this.onFieldKeyUp = ( _handle, _value, _e ) => {
        
        if (_handle === "module_form_title") {
            let name = _value.replace(/\s+/g, '_').toLowerCase();
            this.controller.setInputFieldVal("module_form_handle", name);
        }

    };

    /**     
     * 
     * @param {*} _handle 
     * @returns 
     * 
     * Called right before a view is mounting
     * 
     */
    this.beforeViewMount = (_handle, _viewConfig) => {

        if (_handle === "module_form") {
            const currentEntity = this.component.currentRecord["module_grid"];
            if (currentEntity) {    
                _viewConfig.footer.show = true;
            } else {
                _viewConfig.footer.show = false;
            }
        }

        return _viewConfig;

    };

    /**
     * 
     * @param {*} _tabHandle 
     * @param {*} _tabItemHandle 
     * 
     * Called whenever a Tab Item is go to visible state 
     * 
     */
    this.onTabViewMounted = ( _tabHandle, _tabItemHandle ) => {

        if (_tabHandle === "module_tab") {

            const moduleTab = this.controller.getField("module_tab");
            if (moduleTab) {

                if (_tabItemHandle === "entity_item_tab") {
                    
                    const record = this.component.currentRecord["module_grid"];
                    if (record) {                            
                        const _holder = document.getElementById('entity_mapper_container');
                        const root = createRoot(_holder);
                        this.entityMapper = React.createRef();             
                        root.render(<EntityMapper record={record} entities={this.entities} ref={this.entityMapper} />);
                    }

                }

            }

        }        
        
    }; 

    /**
     * 
     * @param {*} _action 
     * 
     * This handler called for any ( context specific ) action button click events 
     * 
     */
    this.onActionBtnClick = (_action) => {

        if (_action === "NEW_MODULE") {
            this.component.currentRecord["module_grid"] = null;
            this.controller.switchView("module_form");
        } else if (_action === "CANCEL_MODULE") {     
            this.component.currentRecord["module_grid"] = null;       
            this.controller.switchView("main_view");
        } else if (_action === "SAVE_MODULE") {
            this.saveModule();
        }

    };

    this.saveModule = () => {

        const request = {};    
        const module = this.component.currentRecord["module_grid"];

        if (module) {
            /* It's an uppdate call */
            request["method"] = "PUT";
            request["endpoint"] = "/system/v1/module/" + module._id;
        } else {
            /* It's a new record */
            request["method"] = "POST";
            request["endpoint"] = "/system/v1/module";
        }

        const moduleForm = this.controller.getField("module_form");
        if (moduleForm) {

            request["payload"] = moduleForm.getFormFields();   

            if (request["payload"] && Object.keys(request["payload"]).length > 0) {

                this.controller.docker.dock(request).then((_res) => {
                    this.controller.notify(_res.message);
                        this.controller.switchView("main_view");
                        this.component.currentRecord["module_grid"] = null;
                })
                .catch((e) => {
                    this.controller.notify(e.message, "error");
                });

            }
        }

    };

};