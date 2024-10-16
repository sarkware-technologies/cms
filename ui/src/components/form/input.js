import React, { forwardRef, useImperativeHandle, useState, useRef, useEffect } from "react";

const Input = (props, ref) => {

    const dom = useRef(null);
    const contextObj = window._controller.getCurrentModuleInstance(); 

    const [state, setState] = useState({
        type: ('type' in props.config) ? props.config.type : "",
        value: ('value' in props.config) ? props.config.value : "",
        min: ('min' in props.config) ? props.config.min : null,
        max: ('max' in props.config) ? props.config.max : null,
        readonly: ('readonly' in props.config) ? props.config.readonly : false,
        disabled: ('disabled' in props.config) ? props.config.disabled : false,
        maxlength: ('maxlength' in props.config) ? props.config.maxlength : 0,
        autocomplete: ('autocomplete' in props.config) ? props.config.autocomplete : "on",
        placeholder: ('placeholder' in props.config) ? props.config.placeholder : "",
        classes: ('classes' in props.config) ? props.config.classes : "",
        errorMessage: ('errorMessage' in props.config) ? props.config.errorMessage : "",
        accept: ('accept' in props.config) ? props.config.accept : "",

    });

    useImperativeHandle(ref, () => {
        return {
            getVal: () => {

                if (state.type == "number") { 
                    if (!isNaN(state.value)) {

                        if (!isNaN(state.min)) {
                            if (parseInt(state.value) < parseInt(state.min)) {
                                return null;
                            }
                        }

                        if (!isNaN(state.max)) {
                            if (parseInt(state.value) > parseInt(state.max)) {
                                return null;
                            }
                        }

                    }
                }

                return state.value;

            },
            setVal: _value => setState({ ...state, value: _value }),
            enable: () => setState({ ...state, readonly: false }),
            disable: () => setState({ ...state, readonly: true }),
            setError: () => {
                if (!state.classes.includes('invalid')) {
                    setState({ ...state, classes: state.classes + " invalid" });
                }
            },
            clearError: () => {
                let _classes = state.classes;
                setState({ ...state, classes: _classes.replace('invalid', '') });
            },
            getElement: () => dom
        }
    });

    const handleChange = (_e) => {
        setState({ ...state, value: _e.target.value });
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

    const determinDate = (_value) => {

        if (_value) {
            if (_value instanceof Date && !isNaN(_value)) {
                _value = _value.toISOString().split('T')[0];
            } else if (typeof _value === 'string') {
                _value = new Date(_value).toISOString().split('T')[0];
            }
        }

        return _value;

    };

    const renderInput = (_e) => {        

        const classes = state.disabled ? (state.classes + " disabled") : state.classes;
        
        if (state.type === "number") {
            return <input ref={dom} type="number" onChange={handleChange} onClick={handleClick} onDoubleClick={handleDblClick} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} onFocus={handleFocus} onBlur={handleBlur} className={`pharmarack-cms-form-field number ${classes}`} min={state.min} max={state.max} step="1" readOnly={state.readonly} defaultValue={state.value} />;
        } else if (state.type === "password") {
            return <div>
                <input ref={dom} type="password" minLength={6} onChange={handleChange} onClick={handleClick} onDoubleClick={handleDblClick} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} onFocus={handleFocus} onBlur={handleBlur} className={`pharmarack-cms-form-field number ${classes}`} readOnly={state.readonly} defaultValue={state.value} />
                <p className="error-message">{state.errorMessage}</p>
            </div>
        } else if (state.type === "color") {
            return <input ref={dom} type="color" onChange={handleChange} onClick={handleClick} onDoubleClick={handleDblClick} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} onFocus={handleFocus} onBlur={handleBlur} className={`pharmarack-cms-form-field color ${classes}`} readOnly={state.readonly} defaultValue={state.value ? state.value : "#000"} />;
        } else if (state.type === "date") {
            return <input ref={dom} type="date" onChange={handleChange} onClick={handleClick} onDoubleClick={handleDblClick} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} onFocus={handleFocus} onBlur={handleBlur} className={`pharmarack-cms-form-field date ${classes}`} readOnly={state.readonly} defaultValue={determinDate(state.value)} />;
        } else if (state.type === "time") {
            return <input ref={dom} type="time" onChange={handleChange} onClick={handleClick} onDoubleClick={handleDblClick} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} onFocus={handleFocus} onBlur={handleBlur} className={`pharmarack-cms-form-field time ${classes}`} readOnly={state.readonly} defaultValue={state.value} />;
        } else if (state.type === "datetime-local") {
            return <input ref={dom} type="datetime-local" onChange={handleChange} onClick={handleClick} onDoubleClick={handleDblClick} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} onFocus={handleFocus} onBlur={handleBlur} className={`pharmarack-cms-form-field datetime ${classes}`} readOnly={state.readonly} defaultValue={determinDate(state.value)} />;
        } else if (state.type === "week") {
            return <input ref={dom} type="week" onChange={handleChange} onClick={handleClick} onDoubleClick={handleDblClick} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} onFocus={handleFocus} onBlur={handleBlur} className={`pharmarack-cms-form-field week ${classes}`} readOnly={state.readonly} defaultValue={state.value} />;
        } else if (state.type === "month") {
            return <input ref={dom} type="month" onChange={handleChange} onClick={handleClick} onDoubleClick={handleDblClick} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} onFocus={handleFocus} onBlur={handleBlur} className={`pharmarack-cms-form-field month ${classes}`} readOnly={state.readonly} defaultValue={state.value} />;
        } else if (state.type === "file") {
            return <input ref={dom} type="file" accept={state.accept} onChange={handleChange} onClick={handleClick} onDoubleClick={handleDblClick} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} onFocus={handleFocus} onBlur={handleBlur} className={`pharmarack-cms-form-field file ${classes}`} readOnly={state.readonly} defaultValue={state.value} />;
        } else {
            return <input ref={dom} type="text" onChange={handleChange} onClick={handleClick} onDoubleClick={handleDblClick} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} onFocus={handleFocus} onBlur={handleBlur} className={`pharmarack-cms-form-field text ${classes}`} placeholder={state.placeholder} readOnly={state.readonly} defaultValue={state.value} />;
        }

    }

    return renderInput();

}

export default forwardRef(Input);