export default function ServiceContext(_component) {

    this.component = _component;
    this.config = this.component.config;
    this.controller = window._controller;

    /**
     * 
     * Context init handler, this is the place where everything get start ( context wise - not global wise ) 
     *
     **/
    this.init = () => {
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
        const currentService = this.component.currentRecord["service_grid"];

        if (currentService) {
            if (_handle === "module_grid") {                
                datasource["endpoint"] = "/system/v1/service/"+ currentService._id +"/modules";
            } else if (_handle === "version_grid") {            
                datasource["endpoint"] = "/system/v1/service/"+ currentService._id +"/versions";
            }
        }

        return datasource;

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

        if (_handle == "service_grid" && _record) {

            const request = {};
            request["method"] = "PUT";  
            request["endpoint"] = "/system/v1/service/"+ _record._id;          

            request["payload"] = {
                status: _status
            };  
            
            const serviceGrid = this.controller.getField("service_grid");

            this.controller.docker.dock(request).then((_res) => {
                window._controller.notify(_record.title +" has been "+ (_status ? "enabled" : "disabled"));                      
                serviceGrid.initFetch(); 
            })
            .catch((e) => {
                serviceGrid.initFetch();
                this.controller.notify(e.message, "error");
            });

            return false;
        }

        return true;

    };

        /**
     * 
     * @param {*} _e 
     * @param {*} _handle 
     * @param {*} _targetContext 
     * @param {*} _record 
     * 
     * Called whenever user click on the datagrid record (link type)
     * 
     */
        this.onRecordClick = (_e, _handle, _targetContext, _record) => {        

            if (_handle === "service_grid") {                            
                this.controller.switchView("service_form");                  
            } else if (_handle === "version_grid") {
                this.controller.switchTab("service_tab", "version_form_tab");
            } else if (_handle === "feature_grid") {
                this.controller.switchTab("service_tab", "module_form_tab");
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
        
        if (_handle === "service_form_title") {
            let name = _value.replace(/\s+/g, '_').toLowerCase();
            this.controller.setInputFieldVal("service_form_handle", name);
        } else if (_handle === "service_tab_title") {            
            this.controller.setInputFieldVal("service_tab_handle", _value.replace(/\s+/g, '_').toLowerCase());
        }

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

        if (_tabHandle === "service_tab") {

            const serviceTab = this.controller.getField("service_tab");
            if (serviceTab) {

                if (_tabItemHandle === "version_form_tab") {
                    
                    const version = this.component.currentRecord["version_grid"];
                    if (version) {
                        serviceTab.setFormFields(version);
                    }

                } else if (_tabItemHandle === "module_form_tab") {

                    const module = this.component.currentRecord["module_grid"];
                    if (module) {
                        serviceTab.setFormFields(module);
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

        if (_handle === "service_form") {
            const service = this.component.currentRecord["service_grid"];  
            if (service) {    
                _viewConfig.footer.show = true;
            } else {
                _viewConfig.footer.show = false;
            }
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

        if (_action === "NEW_SERVICE") {
            this.component.currentRecord["service_grid"] = null;
            this.controller.switchView("service_form");
        } else if (_action === "CANCEL_SERVICE") {     
            this.component.currentRecord["service_grid"] = null;       
            this.controller.switchView("main_view");
        } else if (_action === "SAVE_SERVICE") {
            this.saveService();
        } else if (_action === "NEW_VERSION") {                        
            this.controller.switchTab("service_tab", "version_form_tab");
        } else if (_action === "SAVE_VERSION") {
            this.saveVersion();
        } else if (_action === "CANCEL_VERSION") {
            /* Clear the current record */
            this.component.currentRecord["version_grid"] = null;
            this.controller.switchTab("service_tab", "version_tab");
        } else if (_action === "NEW_MODULE") {
            this.controller.switchTab("service_tab", "module_form_tab");
        } else if (_action === "SAVE_MODULE") {
            this.saveModule();
        } else if (_action === "CANCEL_MODULE") {
            /* Clear the current record */
            this.component.currentRecord["module_grid"] = null;
            this.controller.switchTab("service_tab", "module_tab");
        } else {
            /* Ignore */
        }

    };

    this.saveService = () => {

        const request = {};    
        const service = this.component.currentRecord["service_grid"];

        if (service) {
            /* It's an uppdate call */
            request["method"] = "PUT";
            request["endpoint"] = "/system/v1/service/" + service._id;
        } else {
            /* It's a new record */
            request["method"] = "POST";
            request["endpoint"] = "/system/v1/service";
        }

        const serviceForm = this.controller.getField("service_form");
        if (serviceForm) {

            request["payload"] = serviceForm.getFormFields();   

            if (request["payload"] && Object.keys(request["payload"]).length > 0) {

                this.controller.docker.dock(request).then((_res) => {
                    this.controller.notify(((_res.payload ? _res.payload.title : _res.title )  + " saved successfully.!"));
                        this.controller.switchView("main_view");
                        this.component.currentRecord["service_grid"] = null;
                })
                .catch((e) => {
                    this.controller.notify(e.message, "error");
                });

            }
        }

    };

    this.saveVersion = () => {

        const currentService = this.component.currentRecord["service_grid"];
        if (!currentService) {
            return;
        }

        const request = {};        
        if (this.component.currentRecord["version_grid"]) {
            /* It's an uppdate call */
            request["method"] = "PUT";
            request["endpoint"] = "/system/v1/service_version/"+ this.component.currentRecord["version_grid"]._id;
        } else {
            /* It's a new record */
            request["method"] = "POST";
            request["endpoint"] = "/system/v1/service_version";
        }

        request["payload"] = {};
        const serviceTab = this.controller.getField("service_tab");
        if (serviceTab) {
            request["payload"] = serviceTab.getFormFields();
            request["payload"]["service"] = currentService._id;
        }
       
        this.controller.docker.dock(request).then((_res) => {
            this.controller.notify(request["payload"].version + " saved successfully.!");
            this.controller.switchTab("service_tab", "version_tab");
            this.component.currentRecord["version_grid"] = null;
        })
        .catch((e) => {
            this.controller.notify(e.message, "error");
        });

    };

    this.saveModule = () => {

        const currentService = this.component.currentRecord["service_grid"];
        if (!currentService) {
            return;
        }

        const request = {};        
        if (this.component.currentRecord["module_grid"]) {
            /* It's an uppdate call */
            request["method"] = "PUT";
            request["endpoint"] = "/system/v1/module/"+ this.component.currentRecord["module_grid"]._id;
        } else {
            /* It's a new record */
            request["method"] = "POST";
            request["endpoint"] = "/system/v1/module";
        }

        request["payload"] = {};
        const serviceTab = this.controller.getField("service_tab");
        if (serviceTab) {
            request["payload"] = serviceTab.getFormFields();
            request["payload"]["service"] = currentService._id;
        }
       
        this.controller.docker.dock(request).then((_res) => {
            this.controller.notify(request["payload"].version + " saved successfully.!");
            this.controller.switchTab("service_tab", "module_tab");
            this.component.currentRecord["module_grid"] = null;
        })
        .catch((e) => {
            this.controller.notify(e.message, "error");
        });

    };

};