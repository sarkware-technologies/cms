import React, {forwardRef, useImperativeHandle, useState, useRef} from "react";

const TextArea = (props, ref) => {

    const dom = useRef(null);
    const contextObj = window._controller.getCurrentModuleInstance();

    const [state, setState] = useState({
        value: ('value' in props.config) ? props.config.value : "",
        rows: ('rows' in props.config) ? props.config.rows : "",
        cols: ('cols' in props.config) ? props.config.cols : "",        
        readonly: ('readonly' in props.config) ? props.config.readonly : false,
        disabled: ('disabled' in props.config) ? props.config.disabled : false,        
        autocomplete: ('autocomplete' in props.config) ? props.config.autocomplete : "on",
        placeholder: ('placeholder' in props.config) ? props.config.placeholder : "",
        classes: ('classes' in props.config) ? props.config.classes : ""
    });

    useImperativeHandle(ref, () => {
        return { 
            getVal: () => state.value,
            setVal: _value => setState({...state, value: _value}),
            enable: () => setState({...state, disabled: false}),
            disable: () => setState({...state, disabled: true}),
            setError: () => {
                if (!state.classes.includes('invalid')) {
                    setState({ ...state, classes: state.classes + " invalid" });
                }
            },
            clearError: () => {
                let _classes = state.classes;               
                setState({...state, classes: _classes.replace('invalid','')});
            },
            getElement: () => dom
        }
    });

    const handleChange = (_e) => {        
        setState({...state, value: _e.target.value});
        if (contextObj && contextObj.onFieldChange) {
            contextObj.onFieldChange((props.namespace + props.config.handle), _e.target.value, _e);
        }
    };

    const handleClick = (_e) => {
        if (contextObj && contextObj.onFieldClick) {
            contextObj.onFieldClick((props.namespace + props.config.handle), _e.target, _e);
        }
    };

    const handleDblClick = (_e) => {
        if (contextObj && contextObj.onFieldDblClick) {
            contextObj.onFieldDblClick((props.namespace + props.config.handle), _e.target, _e);
        }
    };

    const handleKeyDown = (_e) => {
        if (contextObj && contextObj.onFieldKeyDown) {
            contextObj.onFieldKeyDown((props.namespace + props.config.handle), _e.target.value, _e);
        }
    };

    const handleKeyUp = (_e) => {
        if (contextObj && contextObj.onFieldKeyUp) {
            contextObj.onFieldKeyUp((props.namespace + props.config.handle), _e.target.value, _e);
        }
    };

    const handleFocus = (_e) => {
        if (contextObj && contextObj.onFieldInFocus) {
            contextObj.onFieldInFocus((props.namespace + props.config.handle), _e.target);
        }
    };

    const handleBlur = (_e) => {
        if (contextObj && contextObj.onFieldOutFocus) {
            contextObj.onFieldOutFocus((props.namespace + props.config.handle), _e.target);
        }
    };

    const classes = state.disabled ? (state.classes + " disabled") : state.classes;
    return <textarea ref={dom} onChange={handleChange} onClick={handleClick} onDoubleClick={handleDblClick} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} onFocus={handleFocus} onBlur={handleBlur} rows={state.rows} cols={state.cols} value={state.value} className={`pharmarack-cms-form-field textarea ${classes}`} placeholder={state.placeholder}></textarea>;

}

export default forwardRef(TextArea);