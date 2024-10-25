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

        if (_handle == "register_form_userType" && this.component.currentRecord["register_pending_grid"]) {

            const registerSelector = this.controller.getField(_handle);
            if (registerSelector) {
                registerSelector.setVal(this.component.currentRecord["register_pending_grid"].userType);
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
     * @param {*} _e 
     * @param {*} _field 
     * @param {*} _grid 
     * @param {*} _record 
     * 
     * Called whenever user click on the datagrid record (button type)
     * 
     */
    this.onRecordButtonClick = (_e, _field, _grid, _record) => {

        if (_grid == "register_pending_grid") {
            if (_field == "APPROVE") {
                this.approveRegister(_record);
            } else if (_field == "REJECT") {
                this.rejectRegister(_record);
            } else if (_field == "EDIT") {                
                this.controller.switchView("register_form");
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

        if (_action === "NEW_REGISTER") {
            this.component.currentRecord["register_pending_grid"] = null;
            this.controller.switchView("register_form");
        } else if (_action === "CANCEL_REGISTER") {     
            this.component.currentRecord["register_pending_grid"] = null;       
            this.controller.switchView("main_view");
        } else if (_action === "SAVE_REGISTER") {
            this.saveRegister();
        } else if (_action === "REJECT_REGISTER") {
            const record = this.component.currentRecord["register_pending_grid"];
            if (record) {
                this.rejectRegister(record);
            } else {
                this.controller.notify("Couldn't reject, pls try again later", "error");
            }            
        } else if (_action === "UPDATE_APPROVE_REGISTER") {
            this.updateApproveRegister();
        }

    };

    this.saveRegister = () => {

        const request = {};    
        const register = this.component.currentRecord["register_pending_grid"];

        if (register) {
            /* It's an uppdate call */
            request["method"] = "PUT";
            request["endpoint"] = "/system/v1/register/" + register._id;
        } else {
            /* It's a new record */
            request["method"] = "POST";
            request["endpoint"] = "/system/v1/register";
        }

        const registerForm = this.controller.getField("register_form");
        if (registerForm) {

            request["payload"] = registerForm.getFormFields();   

            if (request["payload"] && Object.keys(request["payload"]).length > 0) {

                this.controller.docker.dock(request).then((_res) => {
                    this.controller.notify(_res.title + " saved successfully.!");
                    this.controller.switchView("main_view");
                    this.component.currentRecord["register_pending_grid"] = null;
                })
                .catch((e) => {
                    this.controller.notify(e.message, "error");
                });

            }
        }

    };

    this.updateApproveRegister = () => {

        const record = this.component.currentRecord["register_pending_grid"];
        if (record) {
            
            const request = {};    
            request["method"] = "PUT";
            request["endpoint"] = "/system/v1/register/"+ record._id +"/update-approve";
    
            const registerForm = this.controller.getField("register_form");

            if (registerForm) {
                request["payload"] = registerForm.getFormFields();
                this.controller.docker.dock(request).then((_res) => {
                    this.controller.switchView("main_view");
                    this.component.currentRecord["register_pending_grid"] = null;
                    this.controller.notify("User "+ request["payload"].fullName + " has been updated & approved successfully.!");                    
                })
                .catch((e) => {
                    this.controller.notify(e.message, "error");                    
                });
            }

        }

    };

    this.approveRegister = (_record) => {

        const request = {};    
        request["method"] = "PUT";
        request["endpoint"] = "/system/v1/register/"+ _record._id +"/approve";

        const pendingGrid = this.controller.getField("register_pending_grid");

        this.controller.docker.dock(request).then((_res) => {
            this.controller.notify("User "+ _record.fullName + " has been approved successfully.!");
            if (pendingGrid) {
                pendingGrid.initFetch();
            } else {
                this.controller.switchView("main_view");
                this.component.currentRecord["register_pending_grid"] = null;
            }            
        })
        .catch((e) => {
            this.controller.notify(e.message, "error");
            if (pendingGrid) {
                pendingGrid.initFetch();
            } else {
                this.controller.switchView("main_view");
                this.component.currentRecord["register_pending_grid"] = null;
            }
        });

    };

    this.rejectRegister = (_record) => {

        const request = {};    
        request["method"] = "PUT";
        request["endpoint"] = "/system/v1/register/"+ _record._id +"/reject";

        const pendingGrid = this.controller.getField("register_pending_grid");

        this.controller.docker.dock(request).then((_res) => {
            this.controller.notify("User "+ _record.fullName + " has been rejected successfully.!");
            if (pendingGrid) {
                pendingGrid.initFetch();
            } else {
                this.controller.switchView("main_view");
                this.component.currentRecord["register_pending_grid"] = null;
            }
        })
        .catch((e) => {
            this.controller.notify(e.message, "error");
            if (pendingGrid) {
                pendingGrid.initFetch();
            } else {
                this.controller.switchView("main_view");
                this.component.currentRecord["register_pending_grid"] = null;
            }
        });
        
    };

};