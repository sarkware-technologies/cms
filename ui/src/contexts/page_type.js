 
export default function PageTypeContext(_component) {

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

        if (_handle === "page_type_form_title") {
            let name = _value.replace(/\s+/g, '_').toLowerCase();
            this.controller.setInputFieldVal("page_type_form_handle", name);
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

        if (_action === "SAVE_PAGE_TYPE") {
            this.savePageType();
        } else if (_action === "INVALIDATE_ALL_CACHE") {
            this.invalidateCache(true);
        } else if (_action === "INVALIDATE_CACHE") {
            this.invalidateCache(false);
        }

    };

    /**
     * 
     * Called whenever user click on back button (or cancel button click)
     * 
     */
    this.onBackAction = () => {
        this.component.currentRecord["page_type_grid"] = null;    
    };

    this.invalidateCache = (_flaq) => {

        const request = {}; 
        request["method"] = "GET";
        request["endpoint"] = "/system/v1/cache/invalidateAllPageCache";

        if (!_flaq) {
            const page = this.component.currentRecord["page_type_grid"];
            if (page) {
                request["endpoint"] = "/system/v1/cache/invalidatePageCache?page="+ page.handle;
            } 
        }

        this.controller.docker.dock(request).then((_res) => {
            this.controller.notify("Page cache invalidated.!"); 
        })
        .catch((e) => {
            this.controller.notify(e.message, "error");
        });

    };

    this.savePageType = () => {

        const request = {};    
        const page = this.component.currentRecord["page_type_grid"];

        if (page) {
            /* It's an uppdate call */
            request["method"] = "PUT";
            request["endpoint"] = "/system/v1/api/page/page_type/update?id=" + page._id;
        } else {
            /* It's a new record */
            request["method"] = "POST";
            request["endpoint"] = "/system/v1/api/page/page_type/create_new_page_type";
        }

        const pageTypeForm = this.controller.getField("page_type_form");
        if (pageTypeForm) {
            request["payload"] = pageTypeForm.getFormFields();   
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