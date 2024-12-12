import { createRef } from "react";
import { createRoot } from 'react-dom/client';
import KeywordsManager from "../components/keywords-manager";

export default function SponsoredProductContext(_component) {

    this.component = _component;
    this.config = this.component.config;
    this.controller = window._controller;

    this.keywordManagerRef = createRef(null);

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

        if (_handle == "sponsored_product_form") {

            const record = this.component.currentRecord["sponsored_product_grid"];
            const _keywords = record ? record.keywords : [];

            const _keywordHolder = document.getElementById('sponsored_product_keyword_container');
            const keywordRoot = createRoot(_keywordHolder); 
            keywordRoot.render(<KeywordsManager ref={this.keywordManagerRef} keywords={_keywords} />);
            
            const _segmentField = this.controller.getField("sponsored_product_form_segments");            
            if (record && _segmentField) {
                setTimeout(() => {
                    _segmentField.setSelectedRecords(record.segments);
                }, 1000);                
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

            request["payload"] = sponsoredProductForm.getFormFields();   
            const _segmentField = this.controller.getField("sponsored_product_form_segments");
            if (this.keywordManagerRef.current && _segmentField) {

                const _keywords = this.keywordManagerRef.current.getVal();
                if (_keywords && _keywords.length > 0) {

                    const _segments = _segmentField.getSelectedRecords();
                    if (_segments != "none") {

                        request["payload"]["keywords"] = _keywords;
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
                        this.controller.notify("Please select some or all segments", "error");
                    }

                } else {
                    this.controller.notify("Keywords cannot be empty", "error");
                }

            }

        }

    };

};