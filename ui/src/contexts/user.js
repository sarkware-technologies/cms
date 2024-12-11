export default function UserContext(_component) {

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
     * @param {*} _handle 
     * 
     * Called whenever view is mounted on the DOM
     * 
     */
    this.onViewMounted = (_handle) => {        

        if (_handle == "user_form") {

            const user = this.component.currentRecord["user_grid"];
            if (user) {
                this.controller.docker.dock({
                    method: "GET",
                    endpoint: `/system/v1/user/${user._id}/roles`
                }).then((response) => {
                    
                    if (Array.isArray(response)) {

                        const selectedRoles = [];
                        for (let i = 0; i < response.length; i++) {
                            selectedRoles.push(response[i].role);
                        }

                        const rolesSelector = this.controller.getField("user_form_roles");
                        if (rolesSelector) {
                            rolesSelector.setSelectedRecords(selectedRoles);
                        }

                    }

                })
                .catch((e) => {
                    console.log(e);
                });
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

        if (_action === "NEW_USER") {
            this.component.currentRecord["user_grid"] = null;
            this.controller.switchView("user_form");
        } else if (_action === "CANCEL_USER") {     
            this.component.currentRecord["user_grid"] = null;       
            this.controller.switchView("main_view");
        } else if (_action === "SAVE_USER") {
            this.saveUser();
        }

    };

    /**
     * 
     * Called whenever user click on back button (or cancel button click)
     * 
     */
    this.onBackAction = () => {
        this.component.currentRecord["user_grid"] = null;
    };

    this.saveUser = () => {

        const request = {};    
        const user = this.component.currentRecord["user_grid"];

        if (user) {
            /* It's an uppdate call */
            request["method"] = "PUT";
            request["endpoint"] = "/system/v1/user/" + user._id;
        } else {
            /* It's a new record */
            request["method"] = "POST";
            request["endpoint"] = "/system/v1/user";
        }

        const userForm = this.controller.getField("user_form");
        if (userForm) {

            request["payload"] = userForm.getFormFields();               

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