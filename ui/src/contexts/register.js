export default function ServiceContext(_component) {

    this.component = _component;
    this.config = this.component.config;
    this.controller = window._controller;

    this.registerRecord = null;

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
     * 
     * Called after the select box component option's loaded (happens only remote config)
     * 
     */
    this.afterSelectBoxLoaded = (_handle) => {

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
            this.registerRecord = _record;
            if (_field == "APPROVE") {                
                this.controller.getUserConfirm("APPROVE", "Are you sure ?");                
            } else if (_field == "REJECT") {                
                this.controller.getUserConfirm("REJECT", "Are you sure ?"); 
            } else if (_field == "EDIT") {                
                this.controller.switchView("register_form");
            }
        } else if (_grid == "register_rejected_grid") {
            this.registerRecord = _record;
            if (_field == "APPROVE") {                
                this.controller.getUserConfirm("APPROVE", "Are you sure ?");                
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

        if (_action === "SAVE_REGISTER") {
            this.saveRegister();
        } else if (_action === "REJECT_REGISTER") {
            this.controller.getUserConfirm("REJECT_REGISTER", "Are you sure ?");        
        } else if (_action === "UPDATE_APPROVE_REGISTER") {
            this.controller.getUserConfirm("UPDATE_APPROVE_REGISTER", "Are you sure ?");             
        }

    };

    /**
     * 
     * Called whenever user click on back button (or cancel button click)
     * 
     */
    this.onBackAction = () => {
        this.component.currentRecord["register_pending_grid"] = null;    
    };

    this.onUserConfirm = (_task, _choice) => {

        if (_choice) {

            if (_task == "APPROVE") {
                this.approveRegister();                
            } else if (_task == "REJECT") {
                this.rejectRegister();
            } else if (_task == "UPDATE_APPROVE_REGISTER") {
                this.updateApproveRegister();
            } else if (_task == "REJECT_REGISTER") {
                const record = this.component.currentRecord["register_pending_grid"];
                if (record) {
                    this.rejectRegister(record);
                } else {
                    this.controller.notify("Couldn't reject, pls try again later", "error");
                }   
            }

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

    this.approveRegister = () => {

        if (!this.registerRecord) {
            return;
        }

        const request = {};    
        request["method"] = "PUT";
        request["endpoint"] = "/system/v1/register/"+ this.registerRecord._id +"/approve";

        const pendingGrid = this.controller.getField("register_pending_grid");

        this.controller.docker.dock(request).then((_res) => {
            this.controller.notify("User "+ this.registerRecord.fullName + " has been approved successfully.!");
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

        const record = _record ? _record : this.registerRecord;

        if (!record) {
            return;
        }

        const request = {};    
        request["method"] = "PUT";
        request["endpoint"] = "/system/v1/register/"+ record._id +"/reject";

        const pendingGrid = this.controller.getField("register_pending_grid");

        this.controller.docker.dock(request).then((_res) => {
            this.controller.notify("User "+ record.fullName + " has been rejected successfully.!");
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