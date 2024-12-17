import { createRef } from "react";
import { createRoot } from 'react-dom/client';
import KeywordsManager from "../components/keywords-manager";
import SponsoredSummary from "../components/sponsored-summary";

export default function SponsoredProductContext(_component) {

    this.component = _component;
    this.config = this.component.config;
    this.controller = window._controller;

    this.keywordManagerRef = createRef(null);
    this.sponsoredSummaryRef = createRef(null);

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
    this.onDatagridRequest = (_handle, _datasource) => {  console.log("onDatagridRequest is called for : "+ _handle);

        let datasource = JSON.parse(JSON.stringify(_datasource));        
        const record = this.component.currentRecord["sponsored_product_grid"];

        if (_handle === "sponsored_product_analytic_grid" && record) {                        
            datasource.endpoint = `/system/v1/sponsored_product/${record._id}/performance`;            
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
        
        if (_handle === "auth_type_form_title") {
            let name = _value.replace(/\s+/g, '_').toLowerCase();
            this.controller.setInputFieldVal("auth_type_form_handle", name);
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

        const record = this.component.currentRecord["sponsored_product_grid"];
        if (!record && _handle == "sponsored_product_form") {
            const newConfig =  JSON.parse(JSON.stringify(_viewConfig));
            newConfig.content.rows[0].columns.splice(1, 1);
            return newConfig;
        }

        return _viewConfig;
    };    

    /**
     * 
     * @param {*} _handle 
     * 
     * Called whenever view is mounted on the DOM
     * 
     */
    this.onViewMounted = (_handle) => {    console.log("onViewMounted is called : "+ _handle);

        if (_handle == "sponsored_product_form") {

            const record = this.component.currentRecord["sponsored_product_grid"];
            const _keywords = record ? record.keywords : [];
            const _keywordHolder = document.getElementById('sponsored_product_keyword_container');
            const keywordRoot = createRoot(_keywordHolder); 
            keywordRoot.render(<KeywordsManager ref={this.keywordManagerRef} keywords={_keywords} />);
            
            if (record) {

                const _summaryHolder = document.getElementById('sponsored_product_analytics_container');
                const summaryRoot = createRoot(_summaryHolder); 
                summaryRoot.render(<SponsoredSummary ref={this.sponsoredSummaryRef} />);            
                
                const _segmentField = this.controller.getField("sponsored_product_form_segments");            
                if (_segmentField) {
                    setTimeout(() => {
                        _segmentField.setSelectedRecords(record.segments);
                    }, 1000);                
                }

                /* Retrieve the mdm record */
                if (record.mdmProductCode) {
                    
                    const request = {};  
                    request["method"] = "GET";
                    request["endpoint"] = "/segmentation/v1/segment/mdmLookUp/"+ record.mdmProductCode;

                    this.controller.docker.dock(request).then((_res) => {
                            
                        const _mdmProductCodeField = this.controller.getField("sponsored_product_form_mdmProductCode");            
                        if (_mdmProductCodeField && Array.isArray(_res) && _res.length > 0) {                            
                            _mdmProductCodeField.setCurrentRecord(_res[0]);                            
                        }
                            
                    })
                    .catch((e) => {
                        console.log(e);
                    }); 

                }

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
        if (_action === "SAVE_SPONSORED_PRODUCT") {
            this.saveSponsoredProduct();
        }
    };

    /**
     * 
     * Called whenever user click on back button (or cancel button click)
     * 
     */
    this.onBackAction = () => {
        this.component.currentRecord["sponsored_product_grid"] = null;
    };

    this.saveSponsoredProduct = () => {

        const request = {};    
        const sponsoredProduct = this.component.currentRecord["sponsored_product_grid"];

        if (sponsoredProduct) {
            /* It's an uppdate call */
            request["method"] = "PUT";
            request["endpoint"] = "/system/v1/sponsored_product/" + sponsoredProduct._id;
        } else {
            /* It's a new record */
            request["method"] = "POST";
            request["endpoint"] = "/system/v1/sponsored_product";
        }

        const sponsoredProductForm = this.controller.getField("sponsored_product_form");
        if (sponsoredProductForm) {

            if (!this.validateDates()) {
                return;
            }

            request["payload"] = sponsoredProductForm.getFormFields();   
            const _segmentField = this.controller.getField("sponsored_product_form_segments");
            const _mdmProductCodeField = this.controller.getField("sponsored_product_form_mdmProductCode");
            if (this.keywordManagerRef.current && _segmentField && _mdmProductCodeField) {

                const _keywords = this.keywordManagerRef.current.getVal();
                if (_keywords && _keywords.length > 0) {

                    const _segments = _segmentField.getSelectedRecords();
                    if (_segments != "none") {

                        request["payload"]["keywords"] = _keywords;

                        const mdmRecord = _mdmProductCodeField.getCurrentRecordWhole();
                        request["payload"]["mrp"] = mdmRecord.MRP;
                        request["payload"]["ptr"] = mdmRecord.PTR;
                        request["payload"]["productName"] = mdmRecord.name; 

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

                    } else {
                        this.controller.notify("Please select one or more segments", "error");
                    }

                } else {
                    this.controller.notify("Keywords cannot be empty", "error");
                }

            }

        }

    };

    this.validateDates = () => {

        const fromDateField = this.controller.getField("sponsored_product_form_validFrom");
        const toDateField = this.controller.getField("sponsored_product_form_validUpto");

        if (fromDateField  && toDateField) {

            const sDate = new Date(fromDateField.getVal());
            const eDate = new Date(toDateField.getVal());        

            if (sDate && eDate) {

                sDate.setHours(0,0,0,0);
                eDate.setHours(0,0,0,0);

                if (eDate < sDate) {                   
                    window._controller.notify("To date should be greater than or equal to From date", "error");
                    return false;
                }

            }       

        }
       
        

        return true;

    };

};