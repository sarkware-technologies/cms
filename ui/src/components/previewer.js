import React, {forwardRef, useImperativeHandle, useState} from "react";
import { v4 as uuidv4 } from 'uuid';
import Select from "./form/select";
import MultiSelect from "./multi-select";

const Previewer = (props, ref) => {    

    const _namespace = "preview_search_";
    const countrySearchRef = React.createRef(); 
    const stateSearchRef = React.createRef();    
    const regionSearchRef = React.createRef(); 
    const retailerSearchRef = React.createRef(); 
    const pageTypeRef = React.createRef(); 

    const countrySearchConfig = {        
        type: "multiselect", 
        label: "Country", 
        handle: "country", 
        value : "",         
        placeholder: "Country(es)", 
        searchprompt: "Search for countries",
        search_class: "", 
        popup_class: "",
        mandatory: true, 
        readonly: false, 
        disabled: false, 
        tabindex: 1, 
        align: "right", 
        label_width: 0, 
        recordsPerPage: 15,
        label_position: "top", 
        prompt_message: "", 
        validation_message: "", 
        value_key: "CountryId", 
        label_key: "Country", 
        source: "local",
        endpoint: ""
    };
    const stateSearchConfig = {
        type: "multiselect", 
        label: "State", 
        handle: "state", 
        value : "",         
        placeholder: "State(s)", 
        searchprompt: "Search for states",
        search_class: "", 
        popup_class: "",
        mandatory: true, 
        readonly: false, 
        disabled: false, 
        tabindex: 1, 
        align: "right", 
        label_width: 0, 
        recordsPerPage: 15,
        label_position: "top", 
        prompt_message: "", 
        validation_message: "", 
        value_key: "StateId", 
        label_key: "Statename", 
        source: "local",
        endpoint: ""
    };
    const regionSearchConfig = {
        type: "multiselect", 
        label: "Region", 
        handle: "region", 
        value : "",         
        placeholder: "Region(s)", 
        searchprompt: "Search for regions",
        search_class: "", 
        popup_class: "",
        mandatory: true, 
        readonly: false, 
        disabled: false, 
        tabindex: 1, 
        align: "right", 
        label_width: 0, 
        recordsPerPage: 15,
        label_position: "top", 
        prompt_message: "", 
        validation_message: "", 
        value_key: "RegionId", 
        label_key: "RegionName", 
        source: "local",
        endpoint: ""
    };
    const retailerSearchConfig = {
        type: "multiselect", 
        label: "Retailer", 
        handle: "retailer", 
        value : "",         
        placeholder: "Retailer(s)", 
        searchprompt: "Search for retailers",
        search_class: "", 
        popup_class: "",
        mandatory: true, 
        readonly: false, 
        disabled: false, 
        tabindex: 1, 
        align: "right", 
        label_width: 0, 
        recordsPerPage: 15,
        label_position: "top", 
        prompt_message: "", 
        validation_message: "", 
        value_key: "RetailerId", 
        label_key: "RetailerName", 
        source: "local",
        endpoint: ""
    };

    const pageTypeConfig = { 
        type: "select", 
        label: "Relation Type", 
        handle: "type", 
        value : "1", 
        value_key: "_id", 
        label_key: "title", 
        options: [], 
        classes : "", 
        mandatory : true, 
        disabled: false, 
        tabindex : 1, 
        align: "right", 
        label_width: 0, 
        label_position: "top", 
        prompt_message: "", 
        validation_message: "", 
        source: "remote", 
        endpoint: "/system/api/page/page_type/pagetype_list" 
    };

    const self = {
        
    };
    useImperativeHandle(ref, () => self);

    const loadCountry = () => {};

    const loadState = () => {};

    const loadRegion = () => {};    

    const loadRetailer = () => {};

    const handlePreviewBtnClick = () => {

    };

    const loadPageList = () => {

    };

    return (
        <div className="pharmarack-cms-preview-container">

            <div className="pharmarack-cms-preview-view">
                <div className="pharmarack-cms-preview-mobile-view">
                    <div>
                        
                    </div>
                </div>
            </div>

            <div className="pharmarack-cms-preview-sidebar">

                <div className="pharmarack-cms-filter-wrapper-div">

                    <div className="pharmarack-cms-preview-filter-row">
                        <label>Country</label>
                        <MultiSelect ref={countrySearchRef} original={props.country} namespace={_namespace} config={countrySearchConfig} parent={null} child={stateSearchRef} />
                    </div>

                    <div className="pharmarack-cms-preview-filter-row">
                        <label>State</label>
                        <MultiSelect ref={stateSearchRef} original={props.state} namespace={_namespace} config={stateSearchConfig} parent={countrySearchRef} child={regionSearchRef} />
                    </div>
                    
                    <div className="pharmarack-cms-preview-filter-row">
                        <label>Region</label>
                        <MultiSelect ref={regionSearchRef} original={props.region} namespace={_namespace} config={regionSearchConfig} parent={stateSearchRef} child={retailerSearchRef} />
                    </div>

                    <div className="pharmarack-cms-preview-filter-row">
                        <label>Retailer</label>
                        <MultiSelect ref={retailerSearchRef} original={props.retailer} namespace={_namespace} config={retailerSearchConfig} parent={regionSearchRef} child={null} />
                    </div>

                </div>
                <label>-- OR --</label>
                <div className="pharmarack-cms-filter-wrapper-div">

                    <div className="pharmarack-cms-preview-filter-row">
                        <label>Retailer ID</label>
                        <input type="text" className="" />
                    </div>

                </div>

                <div className="pharmarack-cms-preview-filter-row page">
                    <label>Page</label>
                    <Select ref={pageTypeRef} config={pageTypeConfig} />
                </div>

                <button className="pharmarack-cms-btn primary" onClick={handlePreviewBtnClick}>Preview</button>

            </div>

        </div>
    );

};

export default React.memo(forwardRef(Previewer));