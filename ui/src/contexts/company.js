import { v4 as uuidv4 } from 'uuid';

export default function BrandContext(_component) {

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
     * @param {*} _datasource 
     * @returns 
     * 
     * Called before making request to server - for datagrid
     * 
     */
    this.onDatagridRequest = (_handle, _datasource) => {

        let datasource = JSON.parse(JSON.stringify(_datasource));
        const currentCompany = this.component.currentRecord["company_grid"]; 

        if (currentCompany) {
            if (_handle === "product_grid") {
                datasource.endpoint = "/system/v1/api/master/company/products?cid="+ currentCompany.CompanyId;
            }
        }    

        return datasource;
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

        if (_handle === "brand_form_title") {
            let title = _value.replace(/\s+/g, '_').toLowerCase();
            this.controller.setInputFieldVal("brand_form_handle", title);
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

        if (!_handle) {
            return _viewConfig;
        }

        const company = this.component.currentRecord["company_grid"];
        if (company) {
            _viewConfig.footer.show = true;            
        } else {
            _viewConfig.footer.show = false;
        }
        
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
        if (_action === "SAVE_COMPANY") {
            this.saveComapny();
        }
    };  
    
    /**
     * 
     * Called whenever user click on back button (or cancel button click)
     * 
     */
    this.onBackAction = () => {
        this.component.currentRecord["company_grid"] = null;       
    };

    this.saveComapny = () => {

        const request = {};    
        const page = this.component.currentRecord["company_grid"];

        if (page) {
            /* It's an uppdate call */
            request["method"] = "PUT";
            request["endpoint"] = "/system/v1/api/master/company/update?id=" + page._id;
        } else {
            /* It's a new record */
            request["method"] = "POST";
            request["endpoint"] = "/system/v1/api/master/brand/create";
        }

        const companyForm = this.controller.getField("company_form");
        if (companyForm) {
            request["payload"] = companyForm.getFormFields();   
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