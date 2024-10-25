import React, {useState, useEffect, forwardRef, useImperativeHandle} from "react";
import Search from "../../search";

const ArrayFieldConfig = (props, ref) => { console.log(props);
    
    let options = {};
    if (props.config.options) {
        options = props.config.options;
    }

    const [state, setState] = useState({
        required: ('required' in options) ? options.required : false,        
        default: ('default' in options) ? options.default : [],
        itemType: ('itemType' in options) ? options.itemType : "",
        itemTarget: ('itemTarget' in options) ? options.itemTarget : null,
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
        datasource: {endpoint: "/system/v1/entity", page: 0}
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
        state.itemTarget = entitySearch.current.getCurrentRecord();
        props.configUpdateAction(props.config, state);    
    }

    const handleTypeChange = (_e) => {
        setState({...state, itemType: _e.target.value});   
    }

    useImperativeHandle(ref, () => {
        return { 
            getConfig: () => state,
            setConfig: (_state) => setState({..._state})
        }
    });

    setTimeout(() => {
        entitySearch.current.setCurrentRecord(state.itemTarget);
    }, 500);

    useEffect(() => {

        if (state.itemType === "ObjectId") {
            entitySearch.current.setCurrentRecord(state.itemTarget);
        }

    }, [state]);

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
                    <h2>Type</h2>    
                    <p>Choose the array item's type</p>
                </div>
                <div className="config">               

                    <select value={state.itemType} onChange={handleTypeChange}>
                        <option value="">-- Select Item Type --</option>
                        <option value="String">String</option>
                        <option value="Number">Number</option>
                        <option value="Date">Date</option>
                        <option value="Boolean">Boolean</option>                        
                        <option value="ObjectId">ObjectId</option>                                             
                        <option value="BigInt">BigInt</option>                                             
                        <option value="Mixed">Mixed</option>                                             
                    </select>

                </div>
            </div>            

            <div className="pharmarack-cms-field-configure-row" style={{ display: state.itemType === "ObjectId" ? "flex" : "none" }}>
                <div className="label">
                    <h2>Entity Type</h2>    
                    <p>Choose the target entity for array item</p>
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

export default forwardRef(ArrayFieldConfig);