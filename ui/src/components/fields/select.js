import React, {forwardRef, useImperativeHandle, useState, useRef, useEffect} from "react";

const Select = (props, ref) => {

    const dom = useRef(null);  

    const [state, setState] = useState({
        classes: ('classes' in props.config) ? props.config.classes : "",
        current: ('value' in props.config) ? props.config.value : "",
        options: ('options' in props.config) ? props.config.options : []
    });

    useImperativeHandle(ref, () => {
        return { 
            loadOptions: _options => setState({...state, options: _options}),            
            setVal: _option => {
                setState({...state, current: _option});                
                // Trigger the onChange event programmatically
                if (dom.current) {
                    dom.current.value = _option;
                    const event = new Event('change', { bubbles: true });
                    dom.current.dispatchEvent(event);
                }
            },
            getVal: () => {      
                if (dom.current) {                    
                    const selectedOption = dom.current.querySelector('option:checked');
                    if (selectedOption) {                    
                        return selectedOption.value;
                    }
                }                
                return state.current;
            },
            getElement: () => dom.current,
            setError: () => {
                if (!state.classes.includes('invalid')) {
                    setState({ ...state, classes: state.classes + " invalid" });
                }
            },
            clearError: () => {
                let _classes = state.classes;               
                setState({...state, classes: _classes.replace('invalid','')});
            },
            enable: () => {
                let _classes = state.classes;               
                setState({...state, classes: _classes.replace('disabled','')});
            },
            disable: () => {
                if (!state.classes.includes('disabled')) {
                    setState({ ...state, classes: state.classes + " disabled" });
                }
            }
        }
    });
    
    const handleChange = (_e) => {     
        setState({...state, current: _e.target.value});   
        window._controller.getCurrentModuleInstance().onFieldChange((props.namespace + props.config.handle), _e.target.value, _e);
    };

    const handleFocus = (_e) => window._controller.getCurrentModuleInstance().onFieldInFocus((props.namespace + props.config.handle), _e.target);
    const handleBlur = (_e) => window._controller.getCurrentModuleInstance().onFieldOutFocus((props.namespace + props.config.handle), _e.target);

    useEffect(() => {

        if (props.config.source === "remote") {
            const request = {
                method: "GET",
                endpoint: props.config.endpoint
            };        
            
            window._controller.dock(request, 
                (_req, _res) => {                      
                    if (Array.isArray(_res)) {
                        if (props.config.placeholder) {
                            _res.push();
                            _res.splice(0, 0, { [props.config["value_key"]]: "", [props.config["label_key"]]: props.config.placeholder });
                        }                        
                        setState((prevState) => ({...prevState, options: _res})); 
                        /* Let context knows */
                        setTimeout(() => {
                            window._controller.getCurrentModuleInstance().afterSelectBoxLoaded((props.namespace + props.config.handle));
                        }, 500);
                    }                    
                }, 
                (_req, _res) => {
                    console.error(_req);
                }
            );
        } else {
            if (props.config.value !== undefined) {
                setState((prevState) => ({ ...prevState, current: props.config.value }));
              }
        }

    }, []);   

    return <select ref={dom} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} value={state.current} className={`fields-factory-form-field select ${state.classes}`}>{state.options.map((_item, _index) => { return <option key={"option_"+ _index} value={_item[props.config.value_key]}>{_item[props.config.label_key]}</option> })}</select>;

}

export default forwardRef(Select);