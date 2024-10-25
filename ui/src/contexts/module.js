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
     * 
     * Called after the select box component option's loaded (happens only remote config)
     * 
     */
    this.afterSelectBoxLoaded = (_handle) => {  console.log(_handle);

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

        if (_handle == "module_grid" && _record) {

            const request = {};
            request["method"] = "PUT";  
            request["endpoint"] = "/system/v1/module/"+ _record._id;          

            request["payload"] = {
                status: _status
            };  
            
            const moduleGrid = this.controller.getField("module_grid");

            this.controller.docker.dock(request).then((_res) => {
                window._controller.notify(_record.title +" has been "+ (_status ? "enabled" : "disabled"));                      
                moduleGrid.initFetch(); 
            })
            .catch((e) => {
                moduleGrid.initFetch();
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