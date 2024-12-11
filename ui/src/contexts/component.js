import React from "react";
import { createRoot } from 'react-dom/client';
import Carousel from "../components/factory/editor/carousel";
import CrmBar from "../components/factory/editor/crm-bar";
import Feedback from "../components/factory/editor/feedback";
import Reward from "../components/factory/editor/reward";
import TopWidget from "../components/factory/editor/top-widget";
import Image from "../components/factory/editor/image";
import Video from "../components/factory/editor/video"
import Card from "../components/factory/editor/card";
import Notification from "../components/factory/editor/notification";
import Therapy from "../components/factory/editor/therapy";
import { v4 as uuidv4 } from 'uuid';

export default function ComponentContext(_component) {

    this.component = _component;
    this.config = this.component.config;
    this.controller = window._controller;

    this.componentEditor = null;

    this.mobileAssetUrl = null;
    this.webAssetUrl = null;
    this.previewAssetUrl = null;

    this.appInternalViewList = [];

    this.componentFormConfig = {
        status: { type: "toggle", label: "Status", handle: "status", value : false, classes : "", mandatory : false, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", validation_message: "" },                                 
        title: { type: "text", label: "Title", handle: "title", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
        sub_title: { type: "text", label: "Sub Title", handle: "sub_title", value : "", placeholder: "", classes : "", mandatory : false, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },        
        handle: { type: "text", label: "Handle <span>(Component UID)</span>", handle: "handle", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },        
        start_date: { type: "date", label: "Start Date", handle: "start_date", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
        end_date: { type: "date", label: "End Date", handle: "end_date", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" }
    };

    /* Holds the list of component handle - which needs manual trigger for saving rules */
    this.handles = ["feedback", "reward", "top_widget", "image", "video", "notification", "therapy"];

    /**
     * 
     * Context init handler, this is the place where everything get start ( context wise - not global wise ) 
     *
     **/
    this.init = (_view) => {
        this.controller.switchView(_view);                
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

        if (_handle === "page_component_grid") {
            const component = this.component.currentRecord["component_grid"]; 
            if (component) {
                 datasource.endpoint = datasource.endpoint + component._id; 
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

        if (_handle == "component_form_type") {
            const typeSelect = this.controller.getField("component_form_type");
            const currentRecord = this.component.currentRecord["component_grid"];
            if (typeSelect && currentRecord) {
                typeSelect.setVal(currentRecord["type"]);
            }
        }

    };

    /**
     * 
     * @param {*} _handle 
     * @param {*} _records 
     * 
     * Allows you to modify the records before loading into the datagrid
     * 
     */
    this.beforeLoadingDatagrid = (_handle, _records) => {  
        
        if (_handle === "page_component_grid") {
            for (let i = 0; i < _records.length; i++) {
                for (let j = 0; j < window._controller.bucket.componentTypeList.length; j++) {
                    if (_records[i].position.indexOf(window._controller.bucket.componentTypeList[j]._id) !== -1) {
                        _records[i].position = _records[i].position.replace(window._controller.bucket.componentTypeList[j]._id, window._controller.bucket.componentTypeList[j].handle);
                    }
                }
            }
        }
        
        return _records;
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
        
        if (_grid == "page_component_grid" && _field == "REMOVE") {

            const request = {};   
            request["method"] = "DELETE";
            request["endpoint"] = "/system/v1/api/component/page_component_mapping/delete?id=" + _record._id;

            this.controller.docker.dock(request).then((_res) => {
                const mapGrid = this.controller.getField("page_component_grid");
                if (mapGrid) {
                    mapGrid.initFetch();
                }
            })
            .catch((e) => {
                this.controller.notify(e.message, "error");
            });

        }

    };

    /**
     * 
     * @param {*} _handle 
     * @param {*} _id 
     * @param {*} _status 
     * 
     * Called whenever toggle field change (in datagrid)
     * This option assumes that it will always be the status field
     * So it will automatically update the record in db as well, unless you return false
     * 
     */
    this.onRecordToggleStatus = (_handle, _toggleHandle, _record, _status) => {

        if (_handle == "component_grid") {
            
            const request = {};
            request["method"] = "PUT";
            request["endpoint"] ="/system/v1/api/component/component/update?id="+ _record._id;
            request["payload"] = {};                        
            request["payload"]["status"] = _status;

            const cGrid = this.controller.getField("component_grid");

            this.controller.docker.dock(request).then((_res) => {
                cGrid.initFetch(); 
                window._controller.notify( _record.title + (_status ? " enabled successfully" : " disabled successfully"));
            })
            .catch((e) => {
                cGrid.initFetch(); 
                this.controller.notify(e.message, "error");
            });

            return false;

        }

        return true;
    };

    /**
     * 
     * @param {*} _handle 
     * @param {*} _record 
     * 
     * Called whenever user selecteda record (or cleared) on Search Component
     * 
     */
    this.onSearchRecordSelected = (_handle, _record) => {

        let type = {};
        const typeList = {};
        const options = [];

        if (_record && _record.sequence) {
            for (let i = 0; i < _record.sequence.length; i++) {

                type = this.getComponentTypeRecord(_record.sequence[i]);
                if (type) {
                    if (typeList[type._id]) {
                        typeList[type._id]++;
                    } else {
                        typeList[type._id] = 1;
                    }
                    options.push({label: type.handle +"_"+ typeList[type._id], value: type._id +"_"+ typeList[type._id]});
                }
    
            }
        }

        setTimeout(() => {this.controller.loadFieldChoices("mapping_form_position", options);}, 500);
        
    };

    /**
     * 
     * @param {*} _handle 
     * @param {*} _value 
     * @param {*} _e 
     * 
     * Called whenever a field got changed 
     * 
     */
    this.onFieldChange = ( _handle, _value, _e ) => {

        if (_handle == "component_form_end_date" || _handle == "component_form_start_date") {

            try {

                const sdField = this.controller.getField("component_form_start_date");
                const edField = this.controller.getField("component_form_end_date");

                const sDate = new Date((_handle == "component_form_start_date" ? (_value + 'T00:00:00') : sdField.getVal() + 'T00:00:00' ));
                const eDate = new Date((_handle == "component_form_end_date" ? (_value + 'T00:00:00') : edField.getVal() + 'T00:00:00' ));

                if (sDate && eDate) {
                    if (eDate < sDate) {
                        this.controller.notify("End date should be greater than or equal to Start date", "error");
                        return;
                    }
                } 
                
                if(eDate) {
                    var today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (eDate < today) {
                        this.controller.notify("End date should be greater than or equal to Today", "error");
                        return;
                    }
                }

            } catch (_e) {
                console.log(_e);
            }

        } else if (_handle == "top_widget_type") {           
        
            /* Special case for top_widget component editor */
        
            this.componentEditor.current.updateTopWidgetType(_value);
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

        let title = _value.replace(/\s+/g, '_').toLowerCase();

        if (_handle === "component_form_title") {            
            this.controller.setInputFieldVal("component_form_handle", title);
        } else {

            if (this.componentEditor && this.componentEditor.current) {
                
                let itemFields = null;

                if (_handle === "carousel_item_title") {            
                    itemFields = this.componentEditor.current.getCarouselItemFields();
                    if (itemFields["carousel_item_handle"].current) {
                        itemFields["carousel_item_handle"].current.setVal(title);
                    }
                } else if (_handle === "card_item_title") {
                    itemFields = this.componentEditor.current.getCardItemFields();
                    if (itemFields["card_item_handle"].current) {
                        itemFields["card_item_handle"].current.setVal(title);
                    }
                } else if (_handle === "crm_bar_item_title") {
                    itemFields = this.componentEditor.current.getCrmBarItemFields();
                    if (itemFields["crm_bar_item_handle"].current) {
                        itemFields["crm_bar_item_handle"].current.setVal(title);
                    }        
                } else if (_handle === "product_offer_item_title") {
                    itemFields = this.componentEditor.current.getProductOfferItemFields();
                    if (itemFields["product_offer_item_handle"].current) {
                        itemFields["product_offer_item_handle"].current.setVal(title);
                    }
                }
        
            }

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

        if (!_handle) {
            return _viewConfig;
        }

        const component = this.component.currentRecord["component_grid"];
        if (component) {
            
            _viewConfig.content.rows[0].columns[0].title = "Component";
            _viewConfig.content.rows[0].columns[0].sub_title = "general configuration (Used for CMS)";

            if (_viewConfig.content.rows[0].columns[0].fields) {
                if (_viewConfig.content.rows[0].columns[0].fields.length === 7) {
                    /* Insert component mapping fields */
                    _viewConfig.content.rows[0].columns[0].fields.push({ 
                        type: "view", 
                        label: "", 
                        handle: "mapping_field", 
                        value : "mapping_form", 
                        classes : "",
                        label_width: 0, 
                        label_position: "top" 
                    });
                }
            } 
            
            _viewConfig.context_header.actions = [
                { label: "Cancel", theme: "secondary", method: "cancel", action: "BACK", classes: "icon-left", icon: "fa fa-times", tabindex : 8, status: true, shortcut: "" },
                { label: "Delete", theme: "danger", method: "delete", action: "DELETE_COMPONENT", classes: "icon-left", icon: "fa fa-trash", tabindex : 8, status: true, shortcut: "" },
                { label: "Clone", theme: "warning", method: "post", action: "CLONE_COMPONENT", classes: "icon-left", icon: "fa fa-clone", tabindex : 8, status: true, shortcut: "" },
                { label: "Save", theme: "primary", method: "post", action: "SAVE_COMPONENT", classes: "icon-left", icon: "fa fa-save", tabindex : 8, status: true, shortcut: "" }
            ]

        } else {
            
            if (_viewConfig.content.rows[0].columns[0].fields && _viewConfig.content.rows[0].columns[0].fields.length === 8) {
                _viewConfig.content.rows[0].columns[0].fields.splice(7, 1);
                _viewConfig.context_header.actions = [
                    { label: "Cancel", theme: "secondary", method: "cancel", action: "BACK", classes: "icon-left", icon: "fa fa-times", tabindex : 8, status: true, shortcut: "" },             
                    { label: "Save", theme: "primary", method: "post", action: "SAVE_COMPONENT", classes: "icon-left", icon: "fa fa-save", tabindex : 8, status: true, shortcut: "" }
                ]
            }

            _viewConfig.content.rows[0].columns[0].title = "";
            _viewConfig.content.rows[0].columns[0].sub_title = "";
        }
        
        return _viewConfig;        

    };

    /**
     * 
     * @param {*} _handle 
     * 
     * Called whenever view is mounted on the DOM
     * 
     */
    this.onViewMounted = (_handle) => {
        
        const currentRecord = this.component.currentRecord["component_grid"];
        if (currentRecord) {

            const typeSelect = this.controller.getField("component_form_type");
            if (typeSelect) {
                typeSelect.disable();
            }

            const componentType = this.getComponentTypeRecord(currentRecord.type);
            if (componentType) {

                let widget = null;
                this.componentEditor = React.createRef();

                /* Makesure you are passing component configuration as an object not as string */
                if (currentRecord.configuration && typeof currentRecord.configuration === 'string') {
                    currentRecord["configuration"] = JSON.parse(currentRecord.configuration);
                }

                if (componentType.handle === "carousel") {
                    widget = <Carousel ref={this.componentEditor} key={uuidv4()} config={componentType.configuration} record={currentRecord} />;
                } else if (componentType.handle === "top_widget") {
                    widget = <TopWidget ref={this.componentEditor} key={uuidv4()} config={componentType.configuration} record={currentRecord} />;
                } else if (componentType.handle === "feedback") {
                    widget = <Feedback ref={this.componentEditor} key={uuidv4()} config={componentType.configuration} record={currentRecord} />;
                } else if (componentType.handle === "card") {
                    widget = <Card ref={this.componentEditor} key={uuidv4()} config={componentType.configuration} record={currentRecord} />;
                } else if (componentType.handle === "reward") {
                    widget = <Reward ref={this.componentEditor} key={uuidv4()} config={componentType.configuration} record={currentRecord} />;
                } else if (componentType.handle === "crm_bar") {
                    widget = <CrmBar ref={this.componentEditor} key={uuidv4()} config={componentType.configuration} record={currentRecord} />;
                } else if (componentType.handle === "image") {
                    widget = <Image ref={this.componentEditor} key={uuidv4()} config={componentType.configuration} record={currentRecord} />;
                } else if (componentType.handle === "video") {
                    widget = <Video ref={this.componentEditor} key={uuidv4()} config={componentType.configuration} record={currentRecord} />;
                } else if (componentType.handle === "notification") {
                    widget = <Notification ref={this.componentEditor} key={uuidv4()} config={componentType.configuration} record={currentRecord} />;
                } else if (componentType.handle === "therapy") {
                    widget = <Therapy ref={this.componentEditor} key={uuidv4()} config={componentType.configuration} record={currentRecord} />; 
                }

                const _editorHolder = document.getElementById('component_editor_container');
                const editorRoot = createRoot(_editorHolder);
        
                editorRoot.render(<div key={uuidv4()} style={{width: "100%"}} className={`pharmarack-cms-view-column flex-remaining-width`}>{widget}</div>);

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

        if (_action === "NEW_COMPONENT") {
            this.component.currentRecord["component_grid"] = null;
            this.controller.switchView("component_form");
        } else if (_action === "SAVE_COMPONENT") {
            this.saveComponent();
        } else if (_action === "DELETE_COMPONENT") {
            this.deleteComponent();
        } else if (_action === "MAP_PAGE") {
            this.mapComponentPage();
        } else if (_action === "CLONE_COMPONENT") {
            this.cloneComponent();
        }

    };

    /**
     * 
     * Called whenever user click on back button (or cancel button click)
     * 
     */
    this.onBackAction = () => {
        this.component.currentRecord["component_grid"] = null; 
    };

    /**
     * 
     * @param {*} _target 
     * @param {*} _handle 
     * 
     * This handler will be called whenever media field is changed by the user
     * 
     */
    this.handleMediaChange = async (_target, _handle) => {
    
        const file = _target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {

            const _url = await this.controller.docker.upload('/system/v1/api/component/component/s3_upload', formData);

            if (_handle == "asset_url" || _handle == "mobile_asset_url" ) {
                this.mobileAssetUrl = _url;
            } else if (_handle == "preview_asset_url") {
                this.previewAssetUrl = _url;
            } else {
                this.webAssetUrl = _url;
            }
            
        } catch (_e) {
            console.error(_e);
        }
    };

    /**
     * 
     * @param {*} _handle 
     * 
     * This handler will be called whenever user delete existing media
     * 
     */
    this.handleMediaDelete = (_handle) => {

        const component = this.component.currentRecord["component_grid"];
        if (component) {

            const request = {};
            request["method"] = "POST";
            request["endpoint"] = "/system/v1/api/component/component/remove_asset";
            request["payload"] = {
                componentId: component._id,
                property: _handle
            };    
            
            this.controller.docker.dock(request).then((_res) => {
                if (_handle == "asset_url" || _handle == "mobile_asset_url" ) {
                    this.mobileAssetUrl = "";
                } else if (_handle == "preview_asset_url") {
                    this.previewAssetUrl = "";
                } else {
                    this.webAssetUrl = "";
                }
                
                const configFields = this.componentEditor.current.getConfigFields();
                if (configFields["image_"+ _handle]) {
                    configFields["image_"+ _handle].current.setVal("");
                }
                if ( configFields["video_"+ _handle]) {
                    configFields["video_"+ _handle].current.setVal("");
                }
            })
            .catch((e) => {
                this.controller.notify(e.message, "error");
            });
            
        }

    };

    this.cloneComponent = () => {

        const component = this.component.currentRecord["component_grid"];

        if (component) {

            const request = {};   
            request["method"] = "POST";
            request["endpoint"] = "/system/v1/api/component/component/clone?component="+ component._id;

            this.controller.docker.dock(request).then((_res) => {
                this.controller.notify("Cloned successfully.!");
                this.component.currentRecord["component_grid"] = null;
                this.controller.switchView("main_view");   
            })
            .catch((e) => {
                this.controller.notify(e.message, "error");
            });

        }

    };

    this.mapComponentPage = () => { 

        const component = this.component.currentRecord["component_grid"];

        if (component) {

            const pageField = this.controller.getField("mapping_form_page");
            const positionField = this.controller.getField("mapping_form_position");

            const _pageRecord = pageField.getCurrentRecord();
            const _position = positionField.getVal();

            if (!_pageRecord) {
                this.controller.notify("Page not selected", "error");
                return;
            }

            if (!_position) {
                this.controller.notify("Position not selected", "error");
                return;
            }

            let componentType = null;
            for (let i = 0; i < window._controller.bucket.componentTypeList.length; i++) {
                if (component.type == window._controller.bucket.componentTypeList[i]._id) {
                    componentType = window._controller.bucket.componentTypeList[i];
                }                
            }

            if (componentType) {
                /* Validate the position type */
                const posType = _position.split("_");
                if(posType && posType[0] && (posType[0] != componentType._id)) {
                    this.controller.notify("This position is not compatible", "error");
                    return;
                }
            }

            let request = {};   
            request["method"] = "GET";
            request["endpoint"] = "/system/v1/api/component/page_component_mapping/check_mapping?page="+ _pageRecord +"&component="+ component._id;
            
            this.controller.docker.dock(request).then((_res) => {
                if (_res && Array.isArray(_res) && _res.length == 0) {

                    request["method"] = "POST";
                    request["endpoint"] = "/system/v1/api/component/page_component_mapping/create";
                    
                    request["payload"] = {
                        page: _pageRecord,
                        component: component._id,
                        position: _position
                    }

                    this.controller.docker.dock(request).then((_res) => {
                        this.controller.notify("Mapped successfully.!");                            
                        const mapGrid = this.controller.getField("page_component_grid");
                        if (mapGrid) {
                            mapGrid.initFetch();
                        }
                    })
                    .catch((e) => {
                        this.controller.notify(e.message, "error");
                    });

                } else {
                    this.controller.notify("Already mapped.!");
                }
            })
            .catch((e) => {
                this.controller.notify(e.message, "error");
            });


            this.controller.dock(request, 
                (_req, _res) => {
                    
                    

                }, 
                (_req, _res) => {
                    this.controller.notify(_res, "error");
                }
            );
           
        }

    };

    this.deleteComponent = () => {

        const component = this.component.currentRecord["component_grid"];

        if (component) {
            
            const request = {};   
            request["method"] = "DELETE";
            request["endpoint"] = "/system/v1/api/component/component/purge_component?id=" + component._id;

            this.controller.docker.dock(request).then((_res) => {
                this.controller.notify("Removed successfully.!");
                this.component.currentRecord["component_grid"] = null;
                this.controller.switchView("main_view");      
            })
            .catch((e) => {
                this.controller.notify(e.message, "error");
            });

        }

    };

    this.saveComponent = () => {

        const sdField = this.controller.getField("component_form_start_date");
        const edField = this.controller.getField("component_form_end_date");

        const sDate = new Date(sdField.getVal());
        const eDate = new Date(edField.getVal());        

        if (sDate && eDate) {
            sDate.setHours(0,0,0,0);
            eDate.setHours(0,0,0,0);
            if (eDate < sDate) {
                edField.setError();
                window._controller.notify("End date should be greater than or equal to Start date", "error");
                return;
            }
        } 
        
        if(eDate) {
            eDate.setHours(0,0,0,0);
            var today = new Date();
            today.setHours(0, 0, 0, 0);
            if (eDate < today) {
                edField.setError();
                window._controller.notify("End date should be greater than or equal to Today", "error");
                return;
            }
        }

        let configurations = {};
        const request = {};    
        const component = this.component.currentRecord["component_grid"];

        if (component) {
            /* It's an uppdate call */
            request["method"] = "PUT";
            request["endpoint"] = "/system/v1/api/component/component/update?id=" + component._id;

            if(this.componentEditor.current) {

                configurations = this.componentEditor.current.getComponentConfiguration();
                if (!configurations) {
                    console.error("Something not right, configuration widget not found");
                    return;
                }

                let componentType = this.getComponentTypeRecord(component.type);
                if (componentType) {
                    if (this.handles.indexOf(componentType.handle) !== -1) {
                        this.componentEditor.current.updateComponentRules();
                    }
                }

            }

        } else {
            
            /* It's a new record */
            request["method"] = "POST";
            request["endpoint"] = "/system/v1/api/component/component/create";
            configurations = JSON.stringify({ sequence: [] });

        }

        const componentForm = this.controller.getField("component_form");
        if (componentForm) {

            request["payload"] = componentForm.getFormFields(); 
            
            if (request["payload"]["type"]) {
                let componentType = this.getComponentTypeRecord(request["payload"]["type"]);
                if (componentType) {

                    /* For field type image and video - update the asset url */
                    if (componentType.handle == "image") {
                        if (this.mobileAssetUrl) {
                            configurations["mobile_asset_url"] = this.mobileAssetUrl;
                        }
                        if (this.webAssetUrl) {
                            configurations["web_asset_url"] = this.webAssetUrl;
                        }
                    } else if (componentType.handle == "video") {
                        if (this.mobileAssetUrl) {
                            configurations["asset_url"] = this.mobileAssetUrl;
                        }
                        if (this.previewAssetUrl) {
                            configurations["preview_asset_url"] = this.previewAssetUrl;
                        }
                    }
                    
                }
            }

            request["payload"]["configuration"] = configurations;            
            /* Since this saveComponet method will be used only for parent component */
            request["payload"]["parent"] = null;

            if (request["payload"] && Object.keys(request["payload"]).length > 0) {

                this.controller.docker.dock(request).then((_res) => {

                    if (request["method"] == "POST") {
                        this.controller.notify(_res.payload.title + " saved successfully.!");
                    } else {
                        this.controller.notify(_res.title + " updated successfully.!");
                    }                   
                    this.component.triggerBack();  
                    
                })
                .catch((e) => {
                    this.controller.notify(e.message, "error");
                });

            }
        } else {
            console.error("Component form instance not found");
        }

    };

    this.getComponentTypeRecord = (_typeId) => {

        for (let i = 0; i < window._controller.bucket.componentTypeList.length; i++) {
            if (_typeId == window._controller.bucket.componentTypeList[i]._id) {
                return window._controller.bucket.componentTypeList[i];
            }                
        }

        return null;

    };

};