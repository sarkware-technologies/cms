import React, {forwardRef, useImperativeHandle, useState, useRef} from "react";

const Toggle = (props, ref) => {

    const dom = useRef(null);

    const [state, setState] = useState({                
        status: ('value' in props.config) ? (typeof props.config.value !== 'undefined' ? props.config.value : false ) : false,
        disabled: ('disabled' in props.config) ? props.config.disabled : false,
    });

    useImperativeHandle(ref, () => {
        return { 
            getStatus: () => state.status,
            setStatus: _status => setState({...state, status: _status}),
            enable: () => setState({...state, disabled: false}),
            disable: () => setState({...state, disabled: true})
        }
    });

    const handleChange = (_e) => {
        const checked = _e.target.checked;
        setState({...state, status: checked});
        window._controller.getCurrentModuleInstance().onToggleStatus((props.namespace + props.config.handle), checked);        
    };

    return (
        <div className="toggle-container">
            <label className="pharmarack-cms-toggle-switch">
                <input ref={dom} type="checkbox" className="pharmarack-cms-toggle-field" onChange={handleChange} checked={state.status} />
                <span className="pharmarack-cms-toggle-slider"></span>
            </label>            
        </div>
    );

}

export default forwardRef(Toggle);