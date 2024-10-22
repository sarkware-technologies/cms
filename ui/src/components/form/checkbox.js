import React, {forwardRef, useImperativeHandle, useState, useRef} from "react";

const CheckBox = (props, ref) => {

    const dom = useRef(null);
    const contextObj = window._controller.getCurrentModuleInstance();

    const [state, setState] = useState({
        classes: ('classes' in props.config) ? props.config.classes : "",
        choices: ('choices' in props.config) ? props.config.choices : [],
        checked: ('choices' in props.config) ? new Array(props.config.choices.length).fill(false) : [false]
    });

    useImperativeHandle(ref, () => {
        return { 
            loadOptions: (_choices) => { setState({choices: _choices, checked: new Array(_choices.length).fill(false)});}, 
            checkAll: () => setState({...state, checked: new Array(state.choices.length).fill(true)}),
            unCheckAll: () => setState({...state, checked: new Array(state.choices.length).fill(false)}),
            setChecked: (_choice, _state) => {
                let currentChoices = state.checked;    
                for (let i = 0; i < state.choices.length; i++) {
                    if (state.choices[i][props.config.value_key] === _choice) {
                        currentChoices[i] = _state;
                        break;
                    }
                }
                setState({...state, checked: currentChoices});
            },           
            setChoices: (_choices) => {                
                let currentChoices = state.checked;                
                for (let i = 0; i < state.choices.length; i++) {
                    for (let j = 0; j < _choices.length; j++) {
                        if (state.choices[i][props.config.value_key] === _choices[j]) {
                            currentChoices[i] = true;
                        } else {
                            currentChoices[i] = false;
                        }
                    }
                }                
                setState({...state, checked: currentChoices});
            },
            getChecked: () => {
                if (props.config.choice === "single") {
                    return state.checked[0];
                } else {
                    let selected = [];
                    for (let i = 0; i < state.checked.length; i++) {
                        if (state.checked[i]) {
                            selected.push(state.choices[i]);
                        }
                    }
                    return selected;
                }
            },
            clearChoices: () => {
                let currentChoices = [];                
                for (let i = 0; i < state.choices.length; i++) {                    
                    currentChoices[i] = false;
                }                
                setState({...state, checked: currentChoices});
            },
            getElement: () => dom,
            setError: () => {
                if (!state.classes.includes('invalid')) {
                    setState({ ...state, classes: state.classes + " invalid" });
                }
            },
            clearError: () => {
                let _classes = state.classes;               
                setState({...state, classes: _classes.replace('invalid','')});
            }
        }
    });

    const handleOnChange = (_e, _index) => {

        let currentChoices = state.checked; 
        currentChoices[_index] = !currentChoices[_index];

        setState({...state, checked: currentChoices});



        if (props.onChange) {
            props.onChange(_e);
        } else if (contextObj && contextObj.onFieldChange) {
            contextObj.onFieldChange((props.namespace + props.config.handle), _e.target.value, _e);
        }

    }

    const buildChoice = (_label, _value, _index) => {
        if (props.config.align === "left") {
            return <li key={"choice_"+ _index} ><label>{_label} <input type="checkbox" checked={state.checked[_index]} value={_value} onChange={(e) => handleOnChange(e, _index)} /></label></li>
        } else {
            return <li key={"choice_"+ _index}><label><input type="checkbox" checked={state.checked[_index]} value={_value} onChange={(e) => handleOnChange(e, _index)} /> {_label} </label></li>
        } 
    }

    const buildChoices = () => {
        if (props.config.choice === "single") { 
            return buildChoice(props.config.label, 0);                       
        } else {
            return state.choices.map((_item, _index) => { return buildChoice(_item[props.config.label_key], _item[props.config.value_key], _index) });
        }
    }

    return <ul ref={dom} className={`pharmarack-cms-form-field choices ${props.config.layout} ${state.classes}`}>{buildChoices()}</ul>;

}

export default forwardRef(CheckBox);