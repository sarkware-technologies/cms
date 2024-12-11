import { v4 as uuidv4 } from 'uuid';

export default function DistributorContext(_component) {

    this.component = _component;
    this.config = this.component.config;
    this.controller = window._controller;

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
     * @param {*} _value 
     * @param {*} _e 
     * 
     * Called whenever user click pressing key on any fields or grid cell 
     * 
     */
    this.onFieldKeyUp = ( _handle, _value, _e ) => {

        if (_handle === "distributor_form_title") {
            let title = _value.replace(/\s+/g, '_').toLowerCase();
            this.controller.setInputFieldVal("distributor_form_handle", title);
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

        if (_action === "NEW_DISTRIBUTOR") {
            this.component.currentRecord["distributor_grid"] = null;
            this.controller.switchView("distributor_form");
        } else if (_action === "CANCEL_DISTRIBUTOR") {            
            this.component.currentRecord["distributor_grid"] = null;
            this.controller.switchView("main_view");
        } else if (_action === "SAVE_DISTRIBUTOR") {
            this.saveDistributor();
        }

    };

    /**
     * 
     * Called whenever user click on back button (or cancel button click)
     * 
     */
    this.onBackAction = () => {
        this.component.currentRecord["distributor_grid"] = null; 
    };

    this.saveDistributor = () => {

        const request = {};    
        const page = this.component.currentRecord["distributor_grid"];

        if (page) {
            /* It's an uppdate call */
            request["method"] = "PUT";
            request["endpoint"] = "/system/v1/api/master/distributor/update?id=" + page._id;
        } else {
            /* It's a new record */
            request["method"] = "POST";
            request["endpoint"] = "/system/v1/api/master/distributor/create";
        }

        const distributorForm = this.controller.getField("distributor_form");
        if (distributorForm) {
            request["payload"] = distributorForm.getFormFields();   
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
        }

    };

};