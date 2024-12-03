import React, {forwardRef, useImperativeHandle, useState, useRef, useEffect, useMemo} from "react";
import DropDown from "./dropdown";
import Search from "./search";

const SegmentRule = (props, ref) => {

    const selectorRefs = useRef({});
    const contextObj = window._controller.getCurrentModuleInstance();    

    const [rules, setRules] = useState(('rules' in props) ? props.rules : []);

    const mdmSelectorConfig = useMemo(() => ({ 
        type: "search", 
        label: "Mdm Product Code", 
        handle: "mdmCodeSearch", 
        value : "", 
        placeholder: "Search mdm product codes", 
        searchprompt: "Mdm product codes",
        search_class: "", 
        popup_class: "",
        mandatory: true, 
        readonly: false, 
        disabled: false, 
        tabindex: 1, 
        align: "right", 
        label_width: 0, 
        label_position: "top",          
        validation_message: "", 
        value_key: "MDM_PRODUCT_CODE", 
        label_key: "ProductName", 
        datasource: {endpoint: "/segmentation/v1/api/segment/segment/multi_select_list?entity=mdms", cached: false, recordsPerPage: 10}
    }), []);

    const brandSelectorConfig = useMemo(() => ({ 
        type: "search", 
        label: "Brands", 
        handle: "brandSearch", 
        value : "", 
        placeholder: "Search Brands", 
        searchprompt: "Brands",
        search_class: "", 
        popup_class: "",
        mandatory: true, 
        readonly: false, 
        disabled: false, 
        tabindex: 1, 
        align: "right", 
        label_width: 0, 
        label_position: "top", 
        prompt_message: "", 
        validation_message: "", 
        value_key: "BrandId", 
        label_key: "Name", 
        datasource: {endpoint: "/segmentation/v1/api/segment/segment/multi_select_list?entity=brands", cached: false, recordsPerPage: 10}
    }), []);

    const categorySelectorConfig = useMemo(() => ({ 
        type: "search", 
        label: "Categories", 
        handle: "catSearch", 
        value : "", 
        placeholder: "Search Categories", 
        searchprompt: "Categories",
        search_class: "", 
        popup_class: "",
        mandatory: true, 
        readonly: false, 
        disabled: false, 
        tabindex: 1, 
        align: "right", 
        label_width: 0, 
        label_position: "top", 
        prompt_message: "", 
        validation_message: "", 
        value_key: "Name", 
        label_key: "Name", 
        datasource: {endpoint: "/segmentation/v1/api/segment/segment/multi_select_list?entity=categories", cached: false, recordsPerPage: 10}
    }), []);

    const citySelectorConfig = useMemo(() => ({ 
        type: "search", 
        label: "Cities", 
        handle: "citySearch", 
        value : "", 
        placeholder: "Search Cities", 
        searchprompt: "Cities",
        search_class: "", 
        popup_class: "",
        mandatory: true, 
        readonly: false, 
        disabled: false, 
        tabindex: 1, 
        align: "right", 
        label_width: 0, 
        label_position: "top", 
        prompt_message: "", 
        validation_message: "", 
        value_key: "City", 
        label_key: "City", 
        datasource: {endpoint: "/segmentation/v1/api/segment/segment/multi_select_list?entity=cities", cached: true, recordsPerPage: 10}
    }), []);

    const handleTargetChange = (_value, _index) => {
        const _rules = [...rules];
        _rules[_index].target = _value;
        setRules(_rules);
    };

    const handleFromChange = (_e, _index) => {        
        const _rules = [...rules];
        _rules[_index].from = _e.target.value;
        setRules(_rules);
    };

    const handleToChange = (_e, _index) => {
        const _rules = [...rules];
        _rules[_index].to = _e.target.value;
        setRules(_rules);
    };

    const handleRuleTypeChange = (_e, _index) => {  
        const _rules = [...rules];     
        _rules[_index].ruleType = _e.target.value;
        setRules(_rules);
    };

    const handleQtyTypeChange = (_value, _index) => {
        const _rules = [...rules];
        _rules[_index].qtyType = _value;
        setRules(_rules);
    };

    const handleAddMoreBtnClick = (_e) => {
        _e.preventDefault();
        const _rules = [...rules];
        _rules.push({
            target: "",
            ruleType: 1,
            qtyType: 1,
            from: "",
            to: ""
        });
        setRules(_rules);
    }

    const handleRemoveRuleBtnClick = (_e, _index) => {
        _e.preventDefault();
        const _rules = [...rules];
        _rules.splice(_index, 1);
        setRules(_rules);
    };

    const getSelectorLabel = (_ruleType) => {

        if (_ruleType == 1) {
            return "Mdm Code";
        } else if (_ruleType == 2) {
            return "Brand";
        } else if (_ruleType == 3) {
            return "Category";
        } else {
            return "City";
        }

    };

    const renderSelector = (_index, _ruleType) => {

        let _config = null;        

        if (_ruleType == 1) {
            _config = mdmSelectorConfig;
        } else if (_ruleType == 2) {
            _config = brandSelectorConfig;
        } else if (_ruleType == 3) {
            _config = categorySelectorConfig;
        } else if (_ruleType == 4) {
            _config = citySelectorConfig;
        }

        if (!selectorRefs.current[`selector_${_index}`]) {
            selectorRefs.current[`selector_${_index}`] = React.createRef();
        }

        return <Search key={"selector_"+ _index} ref={selectorRefs["selector_"+ _index]} config={_config} value={rules[_index].target} index={_index} onRecordSelected={handleTargetChange}/>

    };

    useEffect(() => {

        if (contextObj && contextObj.onFieldChange) {
            contextObj.onFieldChange("segment_previewer", null, null);
        }

    }, [rules]);

    useImperativeHandle(ref, () => {
        return {
            getRules: () => {
                const _rules = [];
                for (let i = 0; i < rules.length; i++) {
                    if (rules[i].target && rules[i].ruleType) {
                        _rules.push({
                            target: rules[i].target,
                            ruleType: rules[i].ruleType,
                            qtyType: rules[i].qtyType,
                            from: rules[i].from ? rules[i].from : -1,
                            to: rules[i].to ? rules[i].to : -1
                        });
                    }
                }                
                return _rules;
            },
            setRules: (_rules) => setRules(_rules)
        }        
    });


    const renderRules = () => {

        return rules.map((rule, index) => (
            <div key={`rules_${index}`} className="pharmarack-cms-segment-rule-box">
                <table>
                    <tbody>
                        <tr>
                            <td className="rule-type">
                                <label>Rule Type</label>
                                <select onChange={(e) => handleRuleTypeChange(e, index)} value={rule.ruleType} >
                                    <option value="1">Product</option>
                                    <option value="2">Brand</option>                                   
                                    <option value="3">Category</option>                                    
                                </select>
                            </td>
                            <td className="target-td">
                                <label>{getSelectorLabel(rule.ruleType)}</label>
                                {renderSelector(index, rule.ruleType)}                                
                            </td>
                            <td className="qty-td">
                                <div className="pharmarack-cms-segment-rule-type-box">
                                    <label><input type="radio" name={`pharmarack-cms-segment-qty-type-${index}`} checked={rule.qtyType == 1} onChange={(e) => handleQtyTypeChange(1, index)} /> Quantity</label>
                                    <label><input type="radio" name={`pharmarack-cms-segment-qty-type-${index}`} checked={rule.qtyType == 2} onChange={(e) => handleQtyTypeChange(2, index)} /> Amount</label>
                                </div>
                                <div className="pharmarack-cms-segment-rule-qty-box">
                                    <input type="number" value={rule.from} onChange={(e) => handleFromChange(e, index)} placeholder="From" />
                                    <input type="number" value={rule.to} onChange={(e) => handleToChange(e, index)} placeholder="To" />
                                </div>
                            </td>
                            <td className="remove-td">
                                <a href="#" onClick={(e) => handleRemoveRuleBtnClick(e, index)}><i className="fa fa-times"></i></a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        ));

    };

    return (
        <div className="pharmarack-cms-segment-rules-container">
            {renderRules()}
            <a href="#" onClick={(e) => handleAddMoreBtnClick(e)}><i className="fa fa-plus"></i> Add rule</a>
        </div>
    );

}

export default forwardRef(SegmentRule);