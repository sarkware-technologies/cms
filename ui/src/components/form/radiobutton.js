import React, { forwardRef, useImperativeHandle, useState, useRef } from "react";

const RadioButton = (props, ref) => {
    const dom = useRef(null);
    const contextObj = window._controller.getCurrentModuleInstance();

    const [state, setState] = useState({
        classes: props.config.classes || "",
        choices: props.config.choices || [],
        selected: props.config.value || "", // Store selected value, since radio buttons allow only one selection
    });

    useImperativeHandle(ref, () => ({
        loadOptions: (_choices) => {
            setState((prevState) => ({
                ...prevState,
                choices: _choices,
                selected: "", // Clear the selection when loading new options
            }));
        },
        setVal: (_choice) => {
            setState((prevState) => ({
                ...prevState,
                selected: _choice, // Update the selected value
            }));
            // Manually trigger the change event for the radio group
            const event = {
                target: { value: _choice }
            };
            handleOnChange(event);
        },
        getVal: () => state.selected,
        setChoices: (_choices) => {
            setState((prevState) => ({
                ...prevState,
                choices: _choices,
            }));
        },
        clearChoices: () => {
            setState((prevState) => ({
                ...prevState,
                selected: "", // Clear the selected choice
            }));
        },
        getElement: () => dom,
        setError: () => {
            if (!state.classes.includes("invalid")) {
                setState((prevState) => ({
                    ...prevState,
                    classes: prevState.classes + " invalid",
                }));
            }
        },
        clearError: () => {
            setState((prevState) => ({
                ...prevState,
                classes: prevState.classes.replace("invalid", "").trim(),
            }));
        },
    }));

    const handleOnChange = (_e) => {
        const newValue = _e.target.value;
        setState((prevState) => ({
            ...prevState,
            selected: newValue,
        }));
        if (props.onChange) {
            props.onChange(_e);
        } else if (contextObj && contextObj.onFieldChange) {
            contextObj.onFieldChange(props.namespace + props.config.handle, newValue, _e);
        }
    };

    const buildChoice = (_label, _value, _index) => (
        <li key={`choice_${_index}`}>
            <label>
                <input
                    type="radio"
                    name={props.config.handle}
                    value={_value}
                    checked={state.selected == _value}
                    onChange={handleOnChange}
                />
                {_label}
            </label>
        </li>
    );

    const buildChoices = () => {
        return state.choices.map((_item, _index) =>
            buildChoice(_item[props.config.label_key], _item[props.config.value_key], _index)
        );
    };

    return (
        <ul ref={dom} className={`pharmarack-cms-form-field choices ${props.config.layout} ${state.classes}`}>
            {buildChoices()}
        </ul>
    );
};

export default forwardRef(RadioButton);
