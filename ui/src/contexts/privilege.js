export default function PrivilegeContext(_component) {

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
        
        if (_handle === "privilege_form_title") {
            let name = _value.replace(/\s+/g, '_').toUpperCase();
            this.controller.setInputFieldVal("privilege_form_handle", name);
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

        if (_action === "NEW_PRIVILEGE") {
            this.component.currentRecord["privilege_grid"] = null;
            this.controller.switchView("privilege_form");
        } else if (_action === "CANCEL_PRIVILEGE") {     
            this.component.currentRecord["privilege_grid"] = null;       
            this.controller.switchView("main_view");
        } else if (_action === "SAVE_PRIVILEGE") {
            this.savePrivilege();
        }

    };

    this.savePrivilege = () => {

        const request = {};    
        const privilege = this.component.currentRecord["privilege_grid"];

        if (privilege) {
            /* It's an uppdate call */
            request["method"] = "PUT";
            request["endpoint"] = "/system/v1/privilege/" + privilege._id;
        } else {
            /* It's a new record */
            request["method"] = "POST";
            request["endpoint"] = "/system/v1/privilege";
        }

        const privilegeForm = this.controller.getField("privilege_form");
        if (privilegeForm) {

            request["payload"] = privilegeForm.getFormFields();   

            if (request["payload"] && Object.keys(request["payload"]).length > 0) {

                this.controller.docker.dock(request).then((_res) => {
                    this.controller.notify(((_res.payload ? _res.payload.title : _res.title )  + " saved successfully.!"));
                        this.controller.switchView("main_view");
                        this.component.currentRecord["privilege_grid"] = null;
                })
                .catch((e) => {
                    this.controller.notify(e.message, "error");
                });

            }
        }

    };

};