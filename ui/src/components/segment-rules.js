import React, {forwardRef, useImperativeHandle, useState, useRef, useEffect} from "react";

const SegmentRule = (props, ref) => {

    const contextObj = window._controller.getCurrentModuleInstance();

    const [rules, setRules] = useState(('rules' in props) ? props.rules : [{
        target: "",
        ruleType: 1,
        qtyType: 1,
        from: "",
        to: ""
    }]);

    const handleTargetChange = (_e, _index) => {
        const _rules = [...rules];
        _rules[_index].target = _e.target.value;
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
                    if (rules[i].target && rules[i].ruleType && (rules[i].from || rules[i].to)) {
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
                                    <option value="2">Company</option>
                                </select>
                            </td>
                            <td className="target-td">
                                <label>{rule.ruleType == 1 ? "MDM Code" : "Company Code"}</label>
                                <input type="text" value={rule.target} onChange={(e) => handleTargetChange(e, index)} />
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
            <a href="#" onClick={(e) => handleAddMoreBtnClick(e)}><i className="fa fa-plus"></i> Add more</a>
        </div>
    );

}

export default forwardRef(SegmentRule);