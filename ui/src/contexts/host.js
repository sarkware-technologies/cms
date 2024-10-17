import Capability from "../components/capability";

export default function HostContext(_component) {

    this.component = _component;
    this.config = this.component.config;
    this.controller = window._controller;

    this.authPolicies = [];
    this.authTypes = [];

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
    this.afterSelectBoxLoaded = (_handle) => {

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

        if (_action === "NEW_HOST") {
            this.component.currentRecord["host_grid"] = null;
            this.controller.switchView("host_form");
        } else if (_action === "CANCEL_HOST") {     
            this.component.currentRecord["host_grid"] = null;       
            this.controller.switchView("main_view");
        } else if (_action === "SAVE_HOST") {
            this.saveHost();
        }

    };

    this.saveHost = () => {

        const request = {};    
        const host = this.component.currentRecord["host_grid"];

        if (host) {
            /* It's an uppdate call */
            request["method"] = "PUT";
            request["endpoint"] = "/system/host/" + host._id;
        } else {
            /* It's a new record */
            request["method"] = "POST";
            request["endpoint"] = "/system/host";
        }

        const hostForm = this.controller.getField("host_form");
        if (hostForm) {

            request["payload"] = hostForm.getFormFields();   

            if (request["payload"] && Object.keys(request["payload"]).length > 0) {

                this.controller.docker.dock(request).then((_res) => {
                    this.controller.notify(_res.name + " saved successfully.!");
                    this.controller.switchView("main_view");
                    this.component.currentRecord["host_grid"] = null;
                })
                .catch((e) => {
                    this.controller.notify(e.message, "error");
                });

            }
        }

    };

};