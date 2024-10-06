import React, {useState, forwardRef, useImperativeHandle} from "react";

const StringFieldConfig = (props, ref) => {
    
    const [state, setState] = useState({
        required: ('required' in props.config) ? props.config.required : false,
        default: ('default' in props.config) ? props.config.default : "",
        match: ('match' in props.config) ? props.config.match : null, 
        trim: ('trim' in props.config) ? props.config.trim : false,
        enum: ('enum' in props.config) ? props.config.enum : [],  
        minLength: ('minLength' in props.config) ? props.config.minLength : -1,  
        maxLength: ('maxLength' in props.config) ? props.config.maxLength : -1,  
        lowercase: ('lowercase' in props.config) ? props.config.lowercase : false,
        uppercase: ('uppercase' in props.config) ? props.config.uppercase : false
    });

    const handleRequiredChange = (_e) => {
        setState((prevState) => ({...prevState, required: _e.target.value === 'true'}));
    }

    const handleTrimChange = (_e) => {
        setState((prevState) => ({...prevState, trim: _e.target.value === 'true'}));
    }

    const handleMatchChange = (_e) => {
        setState((prevState) => ({...prevState, match: _e.target.value}));
    }

    const handleDefaultChange = (_e) => {
        setState((prevState) => ({...prevState, default: _e.target.value}));
    }

    const handleEnumChange = (_e) => {
        setState((prevState) => ({...prevState, enum: _e.target.value}));
    }

    const handleMinimumChange = (_e) => {
        setState((prevState) => ({...prevState, minLength: _e.target.value}));
    }

    const handleMaximumChange = (_e) => {
        setState((prevState) => ({...prevState, maxLength: _e.target.value}));
    }

    const handleLowerCaseChange = (_e) => {
        setState((prevState) => ({...prevState, lowercase: _e.target.value === 'true'}));
    }

    const handleUpperCaseChange = (_e) => {
        setState((prevState) => ({...prevState, uppercase: _e.target.value === 'true'}));
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
                        <li><label><input type="radio" value={true} name="required_option" checked={state.required} onChange={handleRequiredChange} /> Yes</label></li>
                        <li><label><input type="radio" value={false} name="required_option" checked={!state.required} onChange={handleRequiredChange} /> No</label></li>
                    </ul>
                </div>
            </div>
            <div className="pharmarack-cms-field-configure-row">
                <div className="label">
                    <h2>Default</h2>    
                    <p>Default value for this field, If the field is not supplied by the user</p>
                </div>
                <div className="config">
                    <input type="text" value={state.default} onChange={handleDefaultChange} />
                </div>
            </div>
            <div className="pharmarack-cms-field-configure-row">
                <div className="label">
                    <h2>Match</h2>    
                    <p>RegEx for this fields validation</p>
                </div>
                <div className="config">
                    <textarea value={state.match} onChange={handleMatchChange}></textarea>
                </div>
            </div>
            <div className="pharmarack-cms-field-configure-row">
                <div className="label">
                    <h2>Trim</h2>    
                    <p>Trim the whitespace at both ends of this field</p>
                </div>
                <div className="config">
                    <ul className="horizontal">
                        <li><label><input type="radio" value={true} name="trim_option" checked={state.trim} onChange={handleTrimChange} /> Yes</label></li>
                        <li><label><input type="radio" value={false} name="trim_option" checked={!state.trim} onChange={handleTrimChange} /> No</label></li>
                    </ul>
                </div>
            </div>
            <div className="pharmarack-cms-field-configure-row">
                <div className="label">
                    <h2>Enumeration</h2>    
                    <p>Check the field's value that is present on the predefined list</p>
                </div>
                <div className="config">
                    <textarea value={state.enum} onChange={handleEnumChange}></textarea>
                </div>
            </div>
            <div className="pharmarack-cms-field-configure-row">
                <div className="label">
                    <h2>Minimum Length</h2>    
                    <p>Validate this field's characters length is not less than the given number</p>
                </div>  
                <div className="config">
                    <input type="number" value={state.minLength} onChange={handleMinimumChange} />
                </div>                  
            </div>
            <div className="pharmarack-cms-field-configure-row">
                <div className="label">
                    <h2>Maximum Length</h2>    
                    <p>Validate this field's characters length is not greater than the given number</p>
                </div>
                <div className="config">
                    <input type="number" value={state.maxLength} onChange={handleMaximumChange} />
                </div>
            </div>
            <div className="pharmarack-cms-field-configure-row">
                <div className="label">
                    <h2>Lower Case</h2>    
                    <p>Transform this field's characters to lower case while storing</p>
                </div>
                <div className="config">
                    <ul className="horizontal">
                        <li><label><input type="radio" value={true} name="lowercase_option" checked={state.lowercase} onChange={handleLowerCaseChange} /> Yes</label></li>
                        <li><label><input type="radio" value={false} name="lowercase_option" checked={!state.lowercase} onChange={handleLowerCaseChange} /> No</label></li>
                    </ul>
                </div>
            </div>
            <div className="pharmarack-cms-field-configure-row">
                <div className="label">
                    <h2>Upper Case</h2>    
                    <p>Transform this field's characters to upper case while storing</p>
                </div>
                <div className="config">
                    <ul className="horizontal">
                        <li><label><input type="radio" value={true} name="uppercase_option" checked={state.uppercase} onChange={handleUpperCaseChange} /> Yes</label></li>
                        <li><label><input type="radio" value={false} name="uppercase_option" checked={!state.uppercase} onChange={handleUpperCaseChange} /> No</label></li>
                    </ul>
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

export default forwardRef(StringFieldConfig);