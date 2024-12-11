import React, {forwardRef, useImperativeHandle, useState, useRef, useEffect} from "react";
import MultiSelect from "./multi-select";
import { v4 as uuidv4 } from 'uuid';

const ComponentRule = (props, ref) => {

    const groupKey = props.groupKey;
    const ruleIndex = props.ruleIndex;

    const [rule, setRule] = useState({
        condition: props.record.condition,
        type: props.record.type,                
        segments: props.record.segments,
        distributors: ("distributors" in props.record ? props.record.distributors : "none"),
        companies: ("companies" in props.record ? props.record.companies : "none")    
    });        
  
    const segmentRef = useRef(null);
    const distributorRef = useRef(null);
    const companyRef = useRef(null);
    const conditionTypeRef = useRef(null);
    const ruleTypeRef = useRef(null);    

    const contextObj = window._controller.getCurrentModuleInstance();    

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
        value_key: "_id", 
        label_key: "title", 
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
                segments: "none",                
                distributors: "none",
                companies: "none"
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
                
                if (segmentRef && segmentRef.current) {
                    payload["segments"] = segmentRef.current.getSelectedRecords();
                } else {
                    payload["segments"] = "none";
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

    useEffect(() => {
        props.registerInstance(props.groupKey, props.id, self);
    }, [])

    if (contextObj) {

        let filters = [];

        filters.push(<td key={uuidv4()} className="condition"><select ref={conditionTypeRef} onChange={(_e) => handleConditionTypeChange(_e)} value={rule.condition}><option value="1">Include</option><option value="2">Exclude</option></select></td>);
        filters.push(<td key={uuidv4()} className="type"><select ref={ruleTypeRef} onChange={(_e) => handleRuleTypeChange(_e)} value={rule.type}><option value="1">Retailer</option><option value="2">Distributor</option><option value="3">Company</option></select></td>);
        if (rule.type == 1) {
            /* Retailer */
            filters.push(<td key={uuidv4()} className="filter"><MultiSelect ref={segmentRef} key={uuidv4()} config={segmentMultiSelectConfig} original={window._controller.bucket.segmentRecords} selected={rule.segments} parent={null} child={null} /></td>);
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

export default forwardRef(ComponentRule);
