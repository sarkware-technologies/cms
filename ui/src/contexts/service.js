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
            request["endpoint"] = "/system/service/"+ _record._id;          

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

        if (_action === "NEW_SERVICE") {
            this.component.currentRecord["service_grid"] = null;
            this.controller.switchView("service_form");
        } else if (_action === "CANCEL_SERVICE") {     
            this.component.currentRecord["service_grid"] = null;       
            this.controller.switchView("main_view");
        } else if (_action === "SAVE_SERVICE") {
            this.saveService();
        }

    };

    this.saveService = () => {

        const request = {};    
        const service = this.component.currentRecord["service_grid"];

        if (service) {
            /* It's an uppdate call */
            request["method"] = "PUT";
            request["endpoint"] = "/system/service/" + service._id;
        } else {
            /* It's a new record */
            request["method"] = "POST";
            request["endpoint"] = "/system/service";
        }

        const serviceForm = this.controller.getField("service_form");
        if (serviceForm) {

            request["payload"] = serviceForm.getFormFields();   

            if (request["payload"] && Object.keys(request["payload"]).length > 0) {

                this.controller.docker.dock(request).then((_res) => {
                    this.controller.notify(_res.title + " saved successfully.!");
                        this.controller.switchView("main_view");
                        this.component.currentRecord["service_grid"] = null;
                })
                .catch((e) => {
                    this.controller.notify(e.message, "error");
                });

            }
        }

    };

};