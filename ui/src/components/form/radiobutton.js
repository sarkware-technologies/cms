import React, { forwardRef, useImperativeHandle, useState, useRef } from "react";

const RadioButton = (props, ref) => {

    const dom = useRef(null);
    const contextObj = window._controller.getCurrentModuleInstance();

    const [state, setState] = useState({
        classes: ('classes' in props.config) ? props.config.classes : "",
        choices: ('choices' in props.config) ? props.config.choices : [],
        selected: ('value' in props.config) ? props.config.value : "" // Store selected value, since radio buttons allow only one selection
    });

    useImperativeHandle(ref, () => {
        return { 
            loadOptions: (_choices) => { 
                setState({ ...state, choices: _choices, selected: "" }); 
            },
            setChecked: (_choice) => {
                setState({ ...state, selected: _choice }); // Only one value can be selected
            },
            setChoices: (_choices) => { 
                setState({ ...state, choices: _choices });
            },
            getChecked: () => {
                return state.selected; // Return the selected choice
            },
            clearChoices: () => {
                setState({ ...state, selected: "" }); // Clear the selected choice
            },
            getElement: () => dom,
            setError: () => {
                if (!state.classes.includes('invalid')) {
                    setState({ ...state, classes: state.classes + " invalid" });
                }
            },
            clearError: () => {
                let _classes = state.classes;               
                setState({ ...state, classes: _classes.replace('invalid','') });
            }
        };
    });

    const handleOnChange = (_e) => {
        setState({ ...state, selected: _e.target.value });
        if (props.onChange) {
            props.onChange(_e);
        } else if (contextObj && contextObj.onFieldChange) {
            contextObj.onFieldChange((props.namespace + props.config.handle), _e.target.value, _e);
        }
    }

    const buildChoice = (_label, _value, _index) => {
        if (props.config.align === "left") {
            return (
                <li key={"choice_" + _index}>
                    <label>
                        {_label} 
                        <input 
                            type="radio" 
                            name={props.config.handle} 
                            value={_value} 
                            checked={state.selected === _value}
                            onChange={handleOnChange} 
                        />
                    </label>
                </li>
            );
        } else {
            return (
                <li key={"choice_" + _index}>
                    <label>
                        <input 
                            type="radio" 
                            name={props.config.handle} 
                            value={_value} 
                            checked={state.selected === _value}
                            onChange={handleOnChange} 
                        /> 
                        {_label}
                    </label>
                </li>
            );
        }
    }

    const buildChoices = () => {
        return state.choices.map((_item, _index) => {
            return buildChoice(_item[props.config.label_key], _item[props.config.value_key], _index);
        });
    }

    return (
        <ul ref={dom} className={`pharmarack-cms-form-field choices ${props.config.layout} ${state.classes}`}>
            {buildChoices()}
        </ul>
    );
}

export default forwardRef(RadioButton);
