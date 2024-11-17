import React from "react";
import ReactDOM from 'react-dom';
import { v4 as uuidv4 } from 'uuid';

import Sequencer from "../components/sequencer"; 
import Search from "../components/search";

export default function PageContext(_component) {

    this.component = _component;
    this.config = this.component.config;
    this.controller = window._controller;

    this.searchRef = null;
    this.companies = [];

    /**
     * 
     * Context init handler, this is the place where everything get start ( context wise - not global wise ) 
     *
     **/
    this.init = () => {
        this.fetchCompanyList();
    };  

    /**
     * 
     * @param {*} _handle 
     * 
     * Called after the select box component option's loaded (happens only remote config)
     * 
     */
    this.afterSelectBoxLoaded = (_handle) => {

        if (_handle == "page_form_type") {
            
            const typeSelect = this.controller.getField("page_form_type");
            const currentRecord = this.component.currentRecord["page_grid"];           

            if (typeSelect && currentRecord) {               
                typeSelect.setVal(currentRecord["type"]);
            }
        }

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

        if (_grid == "page_grid" &&_field == "CLONE") {
            
            const request = {};
            request["method"] = "POST";
            request["endpoint"] = "/system/api/page/page/clone?page="+ _record._id;
            request["payload"] = {}; 

            const pGrid = this.controller.getField("page_grid");

            this.controller.docker.dock(request).then((_res) => {
                window._controller.notify("Cloned successfully");   
                pGrid.initFetch();  
            })
            .catch((e) => {
                pGrid.initFetch();
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

        if (_handle == "page_grid") {

            const request = {};
            request["method"] = "PUT";
            request["endpoint"] = "/system/api/page/page/toggle_page_status?page="+ _record._id +"&status="+ _status;
            request["payload"] = {};                                    

            const pGrid = this.controller.getField("page_grid");

            this.controller.docker.dock(request).then((_res) => {
                this.controller.notify(_res);                      
                pGrid.initFetch();  
            })
            .catch((e) => {
                pGrid.initFetch();
                this.controller.notify(e.message, "error");
            });

            return false;

        }

        return true;

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

        if (_handle === "page_form_type") {

            const _holder = this.controller.getField("company_map_container");   

            if (_e.target.selectedOptions && _e.target.selectedOptions.length > 0 && _e.target.selectedOptions[0].innerHTML == "Dedicated Page") {

                const companyConfig = { 
                    type: "search", 
                    label: "Companies", 
                    handle: "company", 
                    value : "", 
                    placeholder: "Click to search for companies", 
                    searchprompt: "Search for Companies",
                    search_class: "", 
                    popup_class: "",
                    mandatory: true, 
                    readonly: false, 
                    disabled: false, 
                    tabindex: 1, 
                    align: "right", 
                    label_width: 0, 
                    label_position: "top", 
                    prompt_message: "", 
                    validation_message: "", 
                    value_key: "CompanyId", 
                    label_key: "CompanyName", 
                    datasource: {endpoint: "/system/api/master/master/company_search_list", page: 1}
                };
    
                this.searchRef = React.createRef();                             
                ReactDOM.render(<><label>Company</label><Search ref={this.searchRef} key={uuidv4()} config={companyConfig} /></>, _holder);  

                setTimeout(() => {
                    const pageRecord = this.component.currentRecord["page_grid"];
                    if (pageRecord) { console.log(pageRecord);


                        for (let i = 0; i < this.companies.length; i++) {
                            if (this.companies[i].CompanyId == pageRecord.mapped_company) {
                                this.searchRef.current.setCurrentRecord({CompanyName: this.companies[i].CompanyName, CompanyId: pageRecord.mapped_company});
                                break;
                            }
                        }

                        
                    }
                }, 500);

            } else {
                _holder.innerHTML = "";
            }

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

        if (_handle === "page_form_title") {
            let title = _value.replace(/\s+/g, '_').toLowerCase();
            this.controller.setInputFieldVal("page_form_handle", title);
        }

    };

    /**
     * 
     * @param {*} _config 
     * @param {*} _section 
     * @param {*} _row 
     * @param {*} _column 
     * @returns 
     * 
     * Column's render callback (chance to insert your own component into each columns)
     * 
     */
    this.onColumnSectionRendering = (_handle, _config, _section, _row, _column) => {
        let _widgets = [];
        if (_section === "content" && this.component.currentRecord["page_grid"] && _row === 0 && _column === 0) {
            let cssProps = {
                width: "75%"     
            }; 
            _widgets.push(<div key={uuidv4()} style={cssProps} className={`fields-factory-view-column flex-remaining-width ${_config.layout}`}><Sequencer key={uuidv4()} record={this.component.currentRecord["page_grid"]} /></div>);            
        }
        /* 'pos' could be 'before', 'after' or 'replace' */
        return { component: _widgets, pos: "after" };
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

        const page = this.component.currentRecord["page_grid"];
        if (_handle == "page_form" && page) {

            const _vc = JSON.parse(JSON.stringify(_viewConfig));

            if (!page.is_default) {
                _vc.context_header.actions = [
                    { label: "Cancel", theme: "secondary", action: "CANCEL_PAGE", classes: "icon-left", icon: "fa fa-times", tabindex : 8, status: true, shortcut: "" },
                    { label: "Delete", theme: "danger", action: "DELETE_PAGE", classes: "icon-left", icon: "fa fa-trash", tabindex : 8, status: true, shortcut: "" },
                    { label: "Save", theme: "primary", action: "SAVE_PAGE", classes: "icon-left", icon: "fa fa-save", tabindex : 8, status: true, shortcut: "" }
                ]
            }

            _viewConfig = _vc;

        }
        
        return _viewConfig;

    };

    /**
     * 
     * @param {*} _action 
     * 
     * This handler called for any ( context specific ) action button click events 
     * 
     */
    this.onActionBtnClick = (_action) => {

        if (_action === "NEW_PAGE") {
            this.component.currentRecord["page_grid"] = null;
            this.controller.switchView("page_form");
        } else if (_action === "CANCEL_PAGE") {            
            this.component.currentRecord["page_grid"] = null;
            this.controller.switchView("main_view");
        } else if (_action === "SAVE_PAGE") {
            this.savePage();
        } else if (_action === "DELETE_PAGE") {
            this.deletePage();
        }

    };

    this.deletePage = () => {

        const page = this.component.currentRecord["page_grid"];

        if (page) {
            
            const request = {};   
            request["method"] = "DELETE";
            request["endpoint"] = "/system/api/page/page/purge_page?id=" + page._id;

            this.controller.docker.dock(request).then((_res) => {
                this.controller.notify("Removed successfully.!");
                this.controller.switchView("main_view");
                this.component.currentRecord["page_grid"] = null;
            })
            .catch((e) => {
                this.controller.notify(e.message, "error");
            });

        }

    };

    this.savePage = () => {

        const request = {};    
        const page = this.component.currentRecord["page_grid"];

        if (page) {
            /* It's an uppdate call */
            request["method"] = "PUT";
            request["endpoint"] = "/system/api/page/page/update?id=" + page._id;
        } else {
            /* It's a new record */
            request["method"] = "POST";
            request["endpoint"] = "/system/api/page/page/create";
        }

        const pageForm = this.controller.getField("page_form");
        if (pageForm) {
            request["payload"] = pageForm.getFormFields();   
            
            request["payload"]["mapped_company"] = "";

            const pageTypeField = this.controller.getField("page_form_type"); 
            if (pageTypeField.getElement().selectedOptions && pageTypeField.getElement().selectedOptions.length > 0 &&pageTypeField.getElement().selectedOptions[0].innerHTML == "Dedicated Page") {
                const cRecord = this.searchRef.current.getCurrentRecord();
                if (cRecord) {
                    request["payload"]["mapped_company"] = cRecord;
                }                
            }

            if (request["method"] == "PUT") {
                request["payload"]["is_default"] = page["is_default"];
                request["payload"]["status"] = page["status"];
                request["payload"]["status"] = page["status"];
            } else {
                request["payload"]["is_default"] = false;
                request["payload"]["status"] = false;
            }

            if (request["payload"] && Object.keys(request["payload"]).length > 0) {

                this.controller.docker.dock(request).then((_res) => {
                    this.controller.notify(_res.title + " saved successfully.!");
                    this.controller.switchView("main_view");
                    this.component.currentRecord["page_grid"] = null;
                })
                .catch((e) => {
                    this.controller.notify(e.message, "error");
                });

            }
        }

    };

    this.fetchCompanyList = () => {

        this.controller.docker.dock({
            method: "GET",
            endpoint: "/system/api/component/component/multi_select_list?entity=company"
        }).then((_res) => {
            this.companies = _res;   
            this.controller.switchView("main_view");
        })
        .catch((e) => {
            this.controller.notify(e.message, "error");
        });

    };

};