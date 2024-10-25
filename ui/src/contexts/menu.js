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
    this.afterSelectBoxLoaded = (_handle) => {

        if (_handle == "menu_form_parent") {
            const parentSelect = this.controller.getField("menu_form_parent");
            const currentRecord = this.component.currentRecord["menu_grid"];
            if (parentSelect && currentRecord) {
                parentSelect.setVal(currentRecord["parent"]);
            }
        }

        if (_handle == "menu_form_module") {
            const moduleSelect = this.controller.getField("menu_form_module");
            const currentRecord = this.component.currentRecord["menu_grid"];
            if (moduleSelect && currentRecord) {
                moduleSelect.setVal(currentRecord["module"]);
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
        
        if (_handle === "menu_form_title") {
            let name = _value.replace(/\s+/g, '_').toLowerCase();
            this.controller.setInputFieldVal("menu_form_handle", name);
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

        if (_action === "NEW_MENU") {
            this.component.currentRecord["menu_grid"] = null;
            this.controller.switchView("menu_form");
        } else if (_action === "CANCEL_MENU") {     
            this.component.currentRecord["menu_grid"] = null;       
            this.controller.switchView("main_view");
        } else if (_action === "SAVE_MENU") {
            this.saveMenu();
        }

    };

    this.saveMenu = () => {

        const request = {};    
        const menu = this.component.currentRecord["menu_grid"];

        if (menu) {
            /* It's an uppdate call */
            request["method"] = "PUT";
            request["endpoint"] = "/system/v1/menu/" + menu._id;
        } else {
            /* It's a new record */
            request["method"] = "POST";
            request["endpoint"] = "/system/v1/menu";
        }

        const menuForm = this.controller.getField("menu_form");
        if (menuForm) {

            request["payload"] = menuForm.getFormFields();   

            if (request["payload"] && Object.keys(request["payload"]).length > 0) {

                this.controller.docker.dock(request).then((_res) => {
                    this.controller.notify(_res.title + " saved successfully.!");
                        this.controller.switchView("main_view");
                        this.component.currentRecord["menu_grid"] = null;
                })
                .catch((e) => {
                    this.controller.notify(e.message, "error");
                });

            }
        }

    };

};