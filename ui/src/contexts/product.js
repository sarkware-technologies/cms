 
export default function ProductContext(_component) {

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

        if (_action === "NEW_PRODUCT") {
            this.component.currentRecord["product_grid"] = null;
            this.controller.switchView("product_form");
        } else if (_action === "CANCEL_PRODUCT") {            
            this.component.currentRecord["product_grid"] = null;
            this.controller.switchView("main_view");
        } else if (_action === "SAVE_PRODUCT") {
            this.saveProduct();
        }

    };

    this.saveProduct = () => {
        
    };

};