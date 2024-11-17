 
export default function RetailerContext(_component) {

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

        if (_action === "NEW_RETAILER") {
            this.component.currentRecord["retailer_grid"] = null;
            this.controller.switchView("retailer_form");
        } else if (_action === "CANCEL_RETAILER") {            
            this.controller.switchView("main_view");
        } else if (_action === "SAVE_RETAILER") {
            this.saveRetailer();
        }

    };

    this.saveRetailer = () => {

        const request = {};    
        const retailer = this.component.currentRecord["retailer_grid"];

        if (retailer) {
            /* It's an uppdate call */
            request["method"] = "PUT";
            request["endpoint"] = "/system/api/master/retailer/update?id=" + retailer._id;
        } else {
            /* It's a new record */
            request["method"] = "POST";
            request["endpoint"] = "/system/api/master/retailer/create";
        }

        const retailerForm = this.controller.getField("retailer_form");
        if (retailerForm) {
            request["payload"] = retailerForm.getFormFields();   
            if (request["payload"] && Object.keys(request["payload"]).length > 0) {

                this.controller.docker.dock(request).then((_res) => {
                    this.controller.notify(_res.RetailerName + " saved successfully.!");
                    this.controller.switchView("main_view");
                    this.component.currentRecord["retailer_grid"] = null;
                })
                .catch((e) => {
                    this.controller.notify(e.message, "error");
                });

            }
        }

    };

};