import React from "react";
import { v4 as uuidv4 } from 'uuid';
import SegmentPreview from "../components/segment-preview";

export default function SegmentContext(_component) {

    this.component = _component;
    this.config = this.component.config;
    this.controller = window._controller;
    this.segmentPreviewRef = null;

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
     * @param {*} _value 
     * @param {*} _e 
     * 
     * Called whenever a field got changed 
     * 
     */
    this.onFieldChange = ( _handle, _value, _e ) => {
    
        if (_handle == "segment_form_segmentType") {

            const segmentFormTab = this.controller.getField("segment_form_tab");
            if (segmentFormTab) {
                const tabView = (_value == 1) ? "dynamic_segment_tab" : "static_segment_tab";
                segmentFormTab.switchTab(tabView);
            } 

        }

    };

    /**
     * 
     * @param {*} _config 
     * @param {*} _section 
     * @param {*} _row 
     * @param {*} _column 
     * @returns 
     * 
     * Column's render callback (chance to insert your own component into each columns)
     * 
     */
    this.onColumnSectionRendering = (_handle, _config, _section, _row, _column) => {  

        let _widgets = [];
        
        if (_handle === "segment_form" && _section === "content" && _row === 0 && _column === 1) {
            
            this.segmentPreviewRef = React.createRef();
            let widget = <SegmentPreview ref={this.segmentPreviewRef} />;                
            _widgets.push(<div key={uuidv4()} style={{width: "66.6666%"}} className={`fields-factory-view-column flex-remaining-width`}>{widget}</div>);
            
            return { component: _widgets, pos: "replace" };
        }

        /* 'pos' could be 'before', 'after' or 'replace' */
        return { component: _widgets, pos: "after" };

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

        if (_action === "NEW_SEGMENT") {
            this.component.currentRecord["segment_grid"] = null;
            this.controller.switchView("segment_form");
        } else if (_action === "CANCEL_SEGMENT") {     
            this.component.currentRecord["segment_grid"] = null;       
            this.controller.switchView("main_view");
        } else if (_action === "SAVE_SEGMENT") {
            this.saveSegment();
        }

    };

    this.saveSegment = () => {

        const request = {};    
        const authType = this.component.currentRecord["auth_type_grid"];

        if (authType) {
            /* It's an uppdate call */
            request["method"] = "PUT";
            request["endpoint"] = "/system/auth-type/" + authType._id;
        } else {
            /* It's a new record */
            request["method"] = "POST";
            request["endpoint"] = "/system/auth-type";
        }

        const authTypeForm = this.controller.getField("auth_type_form");
        if (authTypeForm) {

            request["payload"] = authTypeForm.getFormFields();   

            if (request["payload"] && Object.keys(request["payload"]).length > 0) {

                this.controller.docker.dock(request).then((_res) => {
                    this.controller.notify(_res.title + " saved successfully.!");
                        this.controller.switchView("main_view");
                        this.component.currentRecord["auth_type_grid"] = null;
                })
                .catch((e) => {
                    this.controller.notify(e.message, "error");
                });

            }
        }

    };

};