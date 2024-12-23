import Tableform from "../components/form/tableform";
import SearchMultiselect from "../components/form/multiselect";
import { createRoot } from 'react-dom/client';
import React, { createRef } from "react";

export default function ABtestContext(_component) {

    this.component = _component;
    this.config = this.component.config;
    this.controller = window._controller;
    this.apiOption = createRef(null);
    this.mappingDetails = createRef(null);

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
     * @returns 
     * 
     * Called right before a view is mounting
     * 
     */
    this.beforeViewMount = (_handle, _viewConfig) => {
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
        const abdetails = this.component.currentRecord["ab_tesing_mapping"];
        if (_handle == "ab_testing_form") {
            const _statusHolder = document.getElementById('tableform');
            const statusRoot = createRoot(_statusHolder);
            statusRoot.render(<Tableform ref={this.apiOption} abdetails={abdetails} />);
        }
        else if (_handle == "mapping_screen") {
            setTimeout(() => {
                const _statusHolder = document.getElementById('reatilersearch');
                if (_statusHolder) {
                    const statusRoot = createRoot(_statusHolder);
                    statusRoot.render(<SearchMultiselect ref={this.mappingDetails} abdetails={abdetails?._id} />);
                }
            }, 500)

        }
    };
    this.onTabViewMounted = (_tabHandle, _tabItemHandle) => {

        const abdetails = this.component.currentRecord["ab_tesing"];
        if (_tabItemHandle == "retailer_tab_open") {
            setTimeout(() => {
                const _statusHolder = document.getElementById('reatilersearch');
                const statusRoot = createRoot(_statusHolder);
                statusRoot.render(<SearchMultiselect ref={this.mappingDetails} abdetails={abdetails?._id} />);
            }, 500)

        }

    }

    this.onDatagridRequest = (_handle, _datasource) => {

        let datasource = JSON.parse(JSON.stringify(_datasource));
        const mapped = this.component.currentRecord["ab_tesing_mapping"];

        if (_handle === "retailer_grid" && mapped) {
            datasource.endpoint = "/system/v1/api_manager/mapped/retailers/" + mapped._id;
        }
        else if(_handle == "region_grid" && mapped) {
            datasource.endpoint = "/system/v1/api_manager/mapped/region/" + mapped._id;

        }
        else if(_handle == "build_grid" && mapped) {
            datasource.endpoint = "/system/v1/api_manager/mapped/build/" + mapped._id;

        }
        return datasource;

    };

    this.onRecordButtonClick = (_e, _field, _grid, _record) => {
        let type =_grid=='retailer_grid'?'retailers':_grid=='region_grid'?"region":_grid=='build_grid'?"build":null
        let id =_grid=='retailer_grid'?_record?.RetailerId:_grid=='region_grid'?_record?._id:_grid=='build_grid'?_record?._id:null
        if (type !=null && id !=null && _field == "REMOVE") {            
            console.log(_record.RetailerId);
            const request = {};
            const user = this.component.currentRecord["ab_tesing"];
                request["method"] = "PUT";
                request["endpoint"] = "/system/v1/api_manager/remove/"+type+"/" +user._id;
           
    
                request["payload"] = {id:id};
    
                if (request["payload"] && Object.keys(request["payload"]).length > 0) {
    
                    this.controller.docker.dock(request).then((_res) => {
                        this.controller.notify("removed  successfully.!");
                        this.controller.switchView("mapping_screen");
                    })
                        .catch((e) => {
                            this.controller.notify(e.message, "error");
                        });
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
        if (_action == 'BACK_TO_MAIN') {
            this.component.currentRecord["ab_tesing"] = null;
            this.controller.switchView("main_view");
        }

        // AB Testing action 

        else if (_action == 'ab_testing_form') {
            this.component.currentRecord["ab_tesing"] = null;
            this.controller.switchView("ab_testing_form");
        }
        else if (_action == "SAVE_testing_list") {
            this.SAVE_testing_list();

        }


        // API actions
        else if (_action === "api_list") {
            this.component.currentRecord["ab_tesing"] = null;
            this.controller.switchView("api_list");
        }
        else if (_action === "add_api_form") {
            this.controller.switchView("add_api_form");
        }
        if (_action === "CANCEL_NEW_API") {
            this.component.currentRecord["ab_tesing"] = null;
            this.controller.switchView("api_list");
        }
        else if (_action == 'SAVE_api_list') {
            this.saveApi_list();
        }


        // Build action
        else if (_action === "build_list") {
            this.controller.switchView("build_list");
        }
        else if (_action === "build_form") {
            this.controller.switchView("build_form");
        }
        else if (_action === "CANCEL_build_form") {
            this.component.currentRecord["ab_tesing"] = null;
            this.controller.switchView("build_list");
        }
        else if (_action === "SAVE_build_form") {
            this.save_build_version();
        }


        // mapping 
        else if (_action === "SAVE_FROM_MAPPING") {
            this.SAVE_FROM_MAPPING();
        }
        else if(_action =='EDIT_Mapping'){
            this.controller.switchView("ab_testing_form");
        }

    };
    this.SAVE_testing_list = () => {
        const request = {};
        const user = this.component.currentRecord["ab_tesing_mapping"];

        if (user) {
            /* It's an uppdate call */
            request["method"] = "PUT";
            request["endpoint"] = "/system/v1/api_manager/ablist/" + user._id;
        } else {
            /* It's a new record */
            request["method"] = "POST";
            request["endpoint"] = "/system/v1/api_manager/ablist";
        }

        if (this.apiOption.current) {
            let AbForm = this.apiOption.current.getState();
            let issue = false;
            let payload = {
                testName: AbForm?.testName,
                apis: AbForm?.apis.reduce((acc, element) => {
                    if (element.targetroute == "") {
                        issue = true;
                    }
                    acc[element.default] = element.targetroute;
                    return acc;
                }, {}),
            };
            if (issue) {
                this.controller.notify("Target route is missing.!");
            }
            console.log(payload.testName == "" || payload.testName == null, payload, 678987654)
            if (payload.testName == "" || payload.testName == null) {
                this.controller.notify("TestName is missing.!");
            }

            if (payload && !issue && payload.testName != "" && payload.testName != null) {

                request["payload"] = payload;

                if (request["payload"] && Object.keys(request["payload"]).length > 0) {

                    this.controller.docker.dock(request).then((_res) => {
                        this.controller.notify("AB Test saved successfully.!");
                        this.controller.switchView("main_view");
                        this.component.currentRecord["ab_tesing"] = null;
                    })
                        .catch((e) => {
                            this.controller.notify(e.message, "error");
                        });

                }
            }
        }
    }
    this.save_build_version = () => {
        const request = {};
        const user = this.component.currentRecord["ab_tesing_build_list"];

        if (user) {
            /* It's an uppdate call */
            request["method"] = "PUT";
            request["endpoint"] = "/system/v1/api_manager/build/version/" + user._id;
        } else {
            /* It's a new record */
            request["method"] = "POST";
            request["endpoint"] = "/system/v1/api_manager/build/version";
        }

        const userForm = this.controller.getField("build_form");
        if (userForm) {

            request["payload"] = userForm.getFormFields();

            if (request["payload"] && Object.keys(request["payload"]).length > 0) {

                this.controller.docker.dock(request).then((_res) => {
                    this.controller.notify("Build saved successfully.!");
                    this.controller.switchView("build_list");
                    this.component.currentRecord["ab_tesing"] = null;
                })
                    .catch((e) => {
                        this.controller.notify(e.message, "error");
                    });

            }
        }
    }
    this.SAVE_FROM_MAPPING = () => {
        const abtest = this.component.currentRecord["ab_tesing_mapping"];
        const request = {};
        request["method"] = "POST";
        request["endpoint"] = "/system/v1/api_manager/mapping";
        let payload = {};
        payload['mappingId'] = abtest?._id;
        if (this.mappingDetails.current) {
            let AbForm = this.mappingDetails.current.getState();
            payload['users'] = AbForm;
        }
        let regions = this.controller.getField("dynamic_retailer_tab_regions");
        if (regions) {
            regions= regions.getSelectedRecords()
            payload["region"] = regions;
        }
        let build = this.controller.getField("dynamic_retailer_tab_build");
        if (build) {
            build= build.getSelectedRecords()
            payload["build"] = build;
        }
        
        request['payload'] = payload
        if (request["payload"] && Object.keys(request["payload"]).length > 0) {

            this.controller.docker.dock(request).then((_res) => {
                this.controller.notify("Build saved successfully.!");
                // this.controller.switchView("build_list");
                this.controller.switchView("mapping_screen");
                // this.component.currentRecord["ab_tesing"] = null;
            })
                .catch((e) => {
                    this.controller.notify(e.message, "error");
                });

        }
    }

    this.saveApi_list = () => {
        const request = {};
        const user = this.component.currentRecord["ab_tesing"];

        if (user) {
            /* It's an uppdate call */
            request["method"] = "PUT";
            request["endpoint"] = "/system/v1/api_manager/api/" + user._id;
        } else {
            /* It's a new record */
            request["method"] = "POST";
            request["endpoint"] = "/system/v1/api_manager/api";
        }

        const userForm = this.controller.getField("add_api_form");
        if (userForm) {

            request["payload"] = userForm.getFormFields();

            if (request["payload"] && Object.keys(request["payload"]).length > 0) {

                this.controller.docker.dock(request).then((_res) => {
                    this.controller.notify(_res.title + " saved successfully.!");
                    this.controller.switchView("api_list");
                    this.component.currentRecord["ab_tesing"] = null;
                })
                    .catch((e) => {
                        this.controller.notify(e.message, "error");
                    });

            }
        }
    }

    this.saveUser = () => {

        const request = {};
        const user = this.component.currentRecord["ab_tesing"];

        if (user) {
            /* It's an uppdate call */
            request["method"] = "PUT";
            request["endpoint"] = "/system/v1/user/" + user._id;
        } else {
            /* It's a new record */
            request["method"] = "POST";
            request["endpoint"] = "/system/v1/user";
        }

        const userForm = this.controller.getField("user_form");
        if (userForm) {

            request["payload"] = userForm.getFormFields();

            if (request["payload"] && Object.keys(request["payload"]).length > 0) {

                this.controller.docker.dock(request).then((_res) => {
                    this.controller.notify(_res.title + " saved successfully.!");
                    this.controller.switchView("main_view");
                    this.component.currentRecord["ab_tesing"] = null;
                })
                    .catch((e) => {
                        this.controller.notify(e.message, "error");
                    });

            }
        }

    };

};