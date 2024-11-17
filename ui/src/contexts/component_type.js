import { v4 as uuidv4 } from 'uuid';

export default function PageContext(_component) {

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
     * @param {*} _value 
     * @param {*} _e 
     * 
     * Called whenever user click pressing key on any fields or grid cell 
     * 
     */
    this.onFieldKeyUp = ( _handle, _value, _e ) => {

        if (_handle === "component_type_form_title") {
            let title = _value.replace(/\s+/g, '_').toLowerCase();
            this.controller.setInputFieldVal("component_type_form_handle", title);
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

        if (_action === "NEW_COMPONENT_TYPE") {
            this.component.currentRecord["component_type_grid"] = null;
            this.controller.switchView("component_type_form");
        } else if (_action === "CANCEL_COMPONENT_TYPE") {            
            this.component.currentRecord["component_type_grid"] = null;
            this.controller.switchView("main_view");
        } else if (_action === "SAVE_COMPONENT_TYPE") {
            this.saveComponentType();
        }

    };

    this.saveComponentType = () => {

        const request = {};    
        const component_type = this.component.currentRecord["component_type_grid"];

        if (component_type) {
            /* It's an uppdate call */
            request["method"] = "PUT";
            request["endpoint"] = "/system/v1/api/component/component_type/update?id=" + component_type._id;
        } else {
            /* It's a new record */
            request["method"] = "POST";
            request["endpoint"] = "/system/v1/api/component/component_type/create";
        }

        const componentTypeForm = this.controller.getField("component_type_form");
        if (componentTypeForm) {
            request["payload"] = componentTypeForm.getFormFields();   
            if (request["payload"] && Object.keys(request["payload"]).length > 0) {

                this.controller.docker.dock(request).then((_res) => {
                    this.controller.notify(_res.title + " saved successfully.!");
                    this.controller.switchView("main_view");
                    this.component.currentRecord["component_type_grid"] = null;
                })
                .catch((e) => {
                    this.controller.notify(e.message, "error");
                });

            }
        }

    };

};