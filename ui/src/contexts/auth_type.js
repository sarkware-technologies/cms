export default function AuthTypeContext(_component) {

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
        
        if (_handle === "auth_type_form_title") {
            let name = _value.replace(/\s+/g, '_').toLowerCase();
            this.controller.setInputFieldVal("auth_type_form_handle", name);
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

        if (_action === "NEW_AUTH_TYPE") {
            this.component.currentRecord["auth_type_grid"] = null;
            this.controller.switchView("auth_type_form");
        } else if (_action === "CANCEL_AUTH_TYPE") {     
            this.component.currentRecord["auth_type_grid"] = null;       
            this.controller.switchView("main_view");
        } else if (_action === "SAVE_AUTH_TYPE") {
            this.saveAuthType();
        }

    };

    this.saveAuthType = () => {

        const request = {};    
        const authType = this.component.currentRecord["auth_type_grid"];

        if (authType) {
            /* It's an uppdate call */
            request["method"] = "PUT";
            request["endpoint"] = "/system/v1/auth_type/" + authType._id;
        } else {
            /* It's a new record */
            request["method"] = "POST";
            request["endpoint"] = "/system/v1/auth_type";
        }

        const authTypeForm = this.controller.getField("auth_type_form");
        if (authTypeForm) {

            request["payload"] = authTypeForm.getFormFields();   

            if (request["payload"] && Object.keys(request["payload"]).length > 0) {

                this.controller.docker.dock(request).then((_res) => {
                    this.controller.notify(((_res.payload ? _res.payload.title : _res.title )  + " saved successfully.!"));
                        this.controller.switchView("main_view");
                        this.component.currentRecord["auth_type_grid"] = null;
                })
                .catch((e) => {
                    this.controller.notify(e.message, "error");
                });

            }
        }

    };

};