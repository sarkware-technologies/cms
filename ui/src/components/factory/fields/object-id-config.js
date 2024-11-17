import React, {useState, forwardRef, useImperativeHandle, createRef} from "react";
import Search from "../../search";

const ObjectIdFieldConfig = (props, ref) => {

    const [state, setState] = useState({
        required: ('required' in props.config) ? props.config.required : false,   
        default: ('default' in props.config) ? props.config.default : null,             
        entity: ('entity' in props.config) ? props.config.entity : null,

    });

    const entitySearch = React.createRef();
    const entityConfig = { 
        type: "search", 
        label: "Parent", 
        handle: "parent", 
        value : "", 
        placeholder: "Click to search for entities", 
        searchprompt: "Search for Entites",
        search_class: "", 
        popup_class: "",
        mandatory: true, 
        readonly: false, 
        disabled: false, 
        tabindex: 1, 
        align: "right", 
        label_width: 0, 
        label_position: "top", 
        prompt_message: "", 
        validation_message: "", 
        value_key: "_id", 
        label_key: "title", 
        datasource: {endpoint: "/system/v1/entity", page: 0, cached: false}
    };

    const handleRequiredChange = (_e) => {
        setState((prevState) => ({...prevState, required: _e.target.value === 'true'}));
    }   

    const handleCancelBtn = (_e) => {
        props.configCancelAction(_e);
    }

    const handleRemoveBtn = (_e) => {
        props.configRemoveAction(props.config._id);
    }

    const handleUpdateBtn = (_e) => {
        state.entity = entitySearch.current.getCurrentRecord();
        props.configUpdateAction(props.config, state);    
    }

    useImperativeHandle(ref, () => {
        
        return { 
            getConfig: () => state,
            setConfig: (_state) => setState({..._state}),
            getEntityField: () => entitySearch.current
        }

    });

    setTimeout(() => {
        if (entitySearch.current) {
            entitySearch.current.setCurrentRecord(state.entity);
        }
    }, 500);

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
                    <h2>Entity</h2>    
                    <p>Foreign key for other entities (Referencing other Entites)</p>
                </div>  
                <div className="config">
                    <Search ref={entitySearch} config={entityConfig} />
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

export default forwardRef(ObjectIdFieldConfig);