 
import React, {useState, forwardRef, useImperativeHandle} from "react";

const MixedFieldConfig = (props, ref) => {

    const [state, setState] = useState({
        required: ('required' in props.config) ? props.config.required : false,        
        default: ('default' in props.config) ? props.config.default : null               
    });

    const handleRequiredChange = (_e) => {
        setState((prevState) => ({...prevState, required: _e.target.value === 'true'}));
    }

    const handleDefaultChange = (_e) => {
        setState((prevState) => ({...prevState, default: _e.target.value}));
    }  
    
    const handleCancelBtn = (_e) => {
        props.configCancelAction(_e);
    }

    const handleRemoveBtn = (_e) => {
        props.configRemoveAction(props.config._id);
    }

    const handleUpdateBtn = (_e) => {
        props.configUpdateAction(props.config, state);
    }

    useImperativeHandle(ref, () => {
        return { 
            getConfig: () => state,
            setConfig: (_state) => setState({..._state})
        }
    });

    return (
        <div className="pharmarack-cms-field-configure-view">

            <div className="pharmarack-cms-field-configure-row">
                <div className="label">                    
                    <h2>Required</h2>    
                    <p>Whether this field is mandatory or not</p>
                </div>
                <div className="config">
                    <ul className="horizontal">
                        <li><label><input type="radio" value="true" name="required_option" checked={state.required} onChange={handleRequiredChange} /> Yes</label></li>
                        <li><label><input type="radio" value="false" name="required_option" checked={!state.required} onChange={handleRequiredChange} /> No</label></li>
                    </ul>
                </div>
            </div>
            <div className="pharmarack-cms-field-configure-row">
                <div className="label">
                    <h2>Default</h2>    
                    <p>Default value for this field, If no value supplied by the user</p>
                </div>
                <div className="config">                    
                    <textarea onChange={handleDefaultChange} value={state.default}></textarea>
                </div>
            </div>          
            <div className="pharmarack-cms-field-configure-action">
                <button className="pharmarack-cms-btn secondary icon-left" onClick={handleCancelBtn}><i className="far fa-times"></i> Cancel</button>
                <button className="pharmarack-cms-btn danger icon-left" onClick={handleRemoveBtn}><i className="far fa-trash"></i> Remove</button>
                <button className="pharmarack-cms-btn primary icon-left" onClick={handleUpdateBtn}><i className="far fa-save"></i> Update</button>
            </div>
        </div>
    );

}

export default forwardRef(MixedFieldConfig);