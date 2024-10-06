import React, {forwardRef, useImperativeHandle, useState, useRef, useEffect} from "react";
import MultiSelect from "./multi-select";
import { v4 as uuidv4 } from 'uuid';

const Rule = (props, ref) => {

    const groupKey = props.groupKey;
    const ruleIndex = props.ruleIndex;

    const [rule, setRule] = useState({
        condition: props.record.condition,
        type: props.record.type,
        retailer_lookup: ("retailer_lookup" in props.record ? props.record.retailer_lookup : 2),
        countries: props.record.countries,
        states: props.record.states,
        regions: props.record.regions,
        retailers: props.record.retailers,
        segments: props.record.segments,
        distributors: ("distributors" in props.record ? props.record.distributors : "none"),
        companies: ("companies" in props.record ? props.record.companies : "none")    
    });
        
    const countryRef = useRef(null);
    const stateRef = useRef(null);
    const regionRef = useRef(null);
    const retailerRef = useRef(null);    
    const segmentRef = useRef(null);
    const distributorRef = useRef(null);
    const companyRef = useRef(null);

    const conditionTypeRef = useRef(null);
    const ruleTypeRef = useRef(null);
    const retailerLookupRef = useRef(null);

    const contextObj = window._controller.getCurrentModuleInstance();

    const countryMultiSelectConfig = {        
        type: "multiselect", 
        label: "Country", 
        handle: "country", 
        value : "", 
        parents: {},
        placeholder: "Countries", 
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

    const stateMultiSelectConfig = {
        type: "multiselect", 
        label: "State", 
        handle: "state", 
        value : "", 
        parents: {},
        placeholder: "States", 
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

    const regionMultiSelectConfig = {
        type: "multiselect", 
        label: "Region", 
        handle: "region", 
        value : "", 
        parents: {},
        placeholder: "Regions", 
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

    const retailerMultiSelectConfig = {
        type: "multiselect", 
        label: "Retailer", 
        handle: "retailer", 
        value : "", 
        parents: {},
        placeholder: "Retailers", 
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

    const segmentMultiSelectConfig = {
        type: "multiselect", 
        label: "Segment", 
        handle: "segment", 
        value : "", 
        parents: {},
        placeholder: "Segments", 
        searchprompt: "Search for segments",
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
        value_key: "segmentKey", 
        label_key: "segmentKey", 
        source: "local",
        endpoint: ""
    };

    const distributorMultiSelectConfig = {
        type: "multiselect", 
        label: "Distributor", 
        handle: "distributor", 
        value : "", 
        parents: {},
        placeholder: "Distributors", 
        searchprompt: "Search for distributors",
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
        value_key: "StoreId", 
        label_key: "StoreName", 
        source: "local",
        endpoint: ""
    };

    const companyMultiSelectConfig = {
        type: "multiselect", 
        label: "Company", 
        handle: "company", 
        value : "", 
        parents: {},
        placeholder: "Companies", 
        searchprompt: "Search for companies",
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
        value_key: "CompanyId", 
        label_key: "CompanyName", 
        source: "local",
        endpoint: ""
    };

    const self = {

        getRule: () => {

            const payload = {
                type: 1,
                match: {
                    countries: "none",
                    states: "none",
                    regions: "none",
                    retailers: "none"
                },
                segments: "none",                
                distributors: "none",
                companies: "none",
                retailer_lookup: 2
            };

            if (conditionTypeRef && conditionTypeRef.current) {
                payload["condition"] = conditionTypeRef.current.value;
            } else {
                payload["condition"] = 1;
            }

            if (ruleTypeRef && ruleTypeRef.current) {
                payload["type"] = ruleTypeRef.current.value;
            } else {
                payload["type"] = 1;
            }

            if (payload["type"] == 1) {

                payload["retailer_lookup"] = retailerLookupRef.current.value;

                if(payload["retailer_lookup"] == 1) {
                    /* For hiearachy rule type */
                    if (countryRef && countryRef.current) {
                        payload["match"]["countries"] = countryRef.current.getSelectedRecords();
                    }
                    if (stateRef && stateRef.current) {
                        payload["match"]["states"] = stateRef.current.getSelectedRecords();
                    }
                    if (regionRef && regionRef.current) {
                        payload["match"]["regions"] = regionRef.current.getSelectedRecords();
                    }
                    if (retailerRef && retailerRef.current) {
                        payload["match"]["retailers"] = retailerRef.current.getSelectedRecords();
                    }
                    payload["segments"] = "none";
                } else {
                    /* For segment rule type */
                    if (segmentRef && segmentRef.current) {
                        payload["segments"] = segmentRef.current.getSelectedRecords();
                    } else {
                        payload["segments"] = "none";
                    }
                }

            } else if (payload["type"] == 2) {

                if (distributorRef && distributorRef.current) {
                    payload["distributors"] = distributorRef.current.getSelectedRecords();
                } else {
                    payload["distributors"] = "none";
                }
                
                
            } else if (payload["type"] == 3) {

                if (companyRef && companyRef.current) {
                    payload["companies"] = companyRef.current.getSelectedRecords();
                } else {
                    payload["companies"] = "none";
                }

            }

            return payload;

        }

    };

    /* Expose the component to the consumer */
    useImperativeHandle(ref, () => self);

    /**
     * 
     * This will simple notify the parent object, which will handle the rule removal logic
     * 
     */
    const removeRule = () => {
        props.removeRule(groupKey, ruleIndex, props.id);
    };

    const handleRuleTypeChange = (_e) => {        
        rule.type = _e.target.value;
        setRule({...rule});
    };

    const handleConditionTypeChange = (_e) => {
        rule.condition = _e.target.value;
        setRule({...rule});
    };

    const handleLookupTypeChange = (_e) => {
        rule.retailer_lookup = _e.target.value;
        setRule({...rule});
    };

    useEffect(() => {
        props.registerInstance(props.groupKey, props.id, self);
    }, [])

    if (contextObj) {

        let filters = [];

        filters.push(<td key={uuidv4()} className="condition"><select ref={conditionTypeRef} onChange={(_e) => handleConditionTypeChange(_e)} value={rule.condition}><option value="1">Include</option><option value="2">Exclude</option></select></td>);
        filters.push(<td key={uuidv4()} className="type"><select ref={ruleTypeRef} onChange={(_e) => handleRuleTypeChange(_e)} value={rule.type}><option value="1">Retailer</option><option value="2">Distributor</option><option value="3">Company</option></select></td>);

        if (rule.type == 1) {
            filters.push(<td key={uuidv4()} className="type"><select ref={retailerLookupRef} onChange={(_e) => handleLookupTypeChange(_e)} value={rule.retailer_lookup}><option value="1">Hierarchy</option><option value="2">Segment</option></select></td>);
        }

        if (rule.type == 1) {
            /* Retailer */
            if (rule.retailer_lookup == 1) {

                filters.push(<td key={uuidv4()} className="filter"><MultiSelect ref={countryRef} key={uuidv4()} config={countryMultiSelectConfig} original={window._controller.bucket.countryRecords} selected={rule.countries} parent={null} child={stateRef} /></td>);
                filters.push(<td key={uuidv4()} className="filter"><MultiSelect ref={stateRef} key={uuidv4()} config={stateMultiSelectConfig} original={window._controller.bucket.stateRecords} selected={rule.states} parent={countryRef} child={regionRef} /></td>);
                filters.push(<td key={uuidv4()} className="filter"><MultiSelect ref={regionRef} key={uuidv4()} config={regionMultiSelectConfig} original={window._controller.bucket.regionRecords} selected={rule.regions} parent={stateRef} child={retailerRef} /></td>);
                filters.push(<td key={uuidv4()} className="filter"><MultiSelect ref={retailerRef} key={uuidv4()} config={retailerMultiSelectConfig} original={window._controller.bucket.retailerRecords} selected={rule.retailers} parent={regionRef} child={null} /></td>);
    
            } else {
                filters.push(<td key={uuidv4()} className="filter"><MultiSelect ref={segmentRef} key={uuidv4()} config={segmentMultiSelectConfig} original={window._controller.bucket.segmentRecords} selected={rule.segments} parent={null} child={null} /></td>);
            }
        } else if (rule.type == 2) {
            /* Distributor */
            filters.push(<td key={uuidv4()} className="filter"><MultiSelect ref={distributorRef} key={uuidv4()} config={distributorMultiSelectConfig} original={window._controller.bucket.distributorRecords} selected={rule.distributors} parent={null} child={null} /></td>);
        } else if (rule.type == 3) {
            /* Company */
            filters.push(<td key={uuidv4()} className="filter"><MultiSelect ref={companyRef} key={uuidv4()} config={companyMultiSelectConfig} original={window._controller.bucket.companyRecords} selected={rule.companies} parent={null} child={null} /></td>);
        }        

        return (
            <table key={uuidv4()} className="pharmarack-cms-rule-table">
                <tbody>
                    <tr>                            
                        {filters}
                        <td key={uuidv4()} className="actions">
                            <button className="pharmarack-cms-btn danger icon-left" onClick={removeRule}><i className="fa fa-trash"></i></button>
                        </td>
                    </tr>
                </tbody>
            </table>
        );

    }

    return null;

};

export default forwardRef(Rule);
