import React, {forwardRef, useImperativeHandle, useState, useRef, useEffect} from "react";

const SegmentRule = (props, ref) => {

    const contextObj = window._controller.getCurrentModuleInstance();

    const [rules, setRules] = useState(('rules' in props) ? props.rules : [{
        mdmProductCode: "",
        ruleType: 1,
        from: "",
        to: ""
    }]);

    const handleMdmProductCodeChange = (_e, _index) => {
        const _rules = [...rules];
        _rules[_index].mdmProductCode = _e.target.value;
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

    const handleRuleTypeChange = (_ruleType, _index) => {  
        const _rules = [...rules];
        _rules[_index].ruleType = _ruleType;
        setRules(_rules);
    };

    const handleAddMoreBtnClick = (_e) => {
        _e.preventDefault();
        const _rules = [...rules];
        _rules.push({
            mdmProductCode: "",
            ruleType: 1,
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
                    if (rules[i].mdmProductCode && rules[i].ruleType && (rules[i].from || rules[i].to)) {
                        _rules.push({
                            mdmProductCode: rules[i].mdmProductCode,
                            ruleType: rules[i].ruleType,
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
                            <td>
                                <label>Product MDM Code</label>
                                <input type="text" value={rule.mdmProductCode} onChange={(e) => handleMdmProductCodeChange(e, index)} />
                            </td>
                            <td>
                                <div className="pharmarack-cms-segment-rule-type-box">
                                    <label><input type="radio" name="pharmarack-cms-segment-rule-type" checked={rule.ruleType == 1} onChange={(e) => handleRuleTypeChange(1, index)} /> Quantity</label>
                                    <label><input type="radio" name="pharmarack-cms-segment-rule-type" checked={rule.ruleType == 2} onChange={(e) => handleRuleTypeChange(2, index)} /> Amount</label>
                                </div>
                                <div className="pharmarack-cms-segment-rule-qty-box">
                                    <input type="number" value={rule.from} onChange={(e) => handleFromChange(e, index)} />
                                    <input type="number" value={rule.to} onChange={(e) => handleToChange(e, index)} />
                                </div>
                            </td>
                            <td>
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