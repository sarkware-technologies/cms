export default function UserContext(_component) {

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
                    this.controller.notify(_res.title + " saved successfully.!");
                        this.controller.switchView("main_view");
                        this.component.currentRecord["user_grid"] = null;
                })
                .catch((e) => {
                    this.controller.notify(e.message, "error");
                });

            }
        }

    };

};