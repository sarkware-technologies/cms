import React, {forwardRef, useImperativeHandle, useState, useEffect} from "react";
import Toggle from "./form/toggle";
import { v4 as uuidv4 } from 'uuid';

const EntityMapper = (props, ref) => {    

    const _namespace = "entity_mapper_";

    const entitySelect = React.createRef();
    const exposeToggle = React.createRef();
    const hasFormToggle = React.createRef();

    const exposeConfig = {
        handle: "expose_toggle",
        value: false
    };

    const hasFormConfig = {
        handle: "hasform_toggle",
        value: false
    };

    const [state, setState] = useState({
        entities: props.entities,
        mapped: []
    });

    const self = {
        
    };
    useImperativeHandle(ref, () => self);

    const fetchEntities = () => {

        const request = {
            method: "GET",
            endpoint: "/system/v1/module/"+ props.record._id +"/entities"
        }; 
        
        window._controller.docker.dock(request).then((_res) => {
            setState((prevState) => ({ ...prevState, mapped: _res}));
        })
        .catch((e) => {
            console.error(_req);
        });
        
    };

    const handleFieldToggleChange = (_e, _property, _record) => {

        const request = {};        
        request["method"] = "PUT";
        request["endpoint"] = "/system/v1/module/"+ props.record._id +"/entities?mapping_id="+ _record._id;
        request["payload"] = {
            [_property]: _e.target.checked
        };

        window._controller.dock(request, 
            (_req, _res) => {                    
                setState((prevState) => ({...prevState, mapped: _res}));                              
                window._controller.notify( "Updated successfully" );                  
            }, 
            (_req, _res) => {
                this.controller.notify( "Failed to update.!", "error" );                                
            }
        );

    };

    const handleRemoveBtnClick = (_e, _record) => {

        const request = {};        
        request["method"] = "DELETE";
        request["endpoint"] = "/system/v1/module/"+ props.record._id +"/entities?mapping_id="+ _record._id;

        window._controller.dock(request, 
            (_req, _res) => {                    
                setState((prevState) => ({...prevState, mapped: _res}));                              
                window._controller.notify( "Removed successfully" );                  
            }, 
            (_req, _res) => {
                this.controller.notify( "Failed to remove.!", "error" );                                
            }
        );

    };

    const handleNewMappingClick = () => {

        if (entitySelect.current && entitySelect.current.value) {

            const request = {};        
            request["method"] = "POST";
            request["endpoint"] = "/system/v1/module/"+ props.record._id +"/entities";
            request["payload"] = {
                entity          : entitySelect.current.value,                                         
                exposed         : exposeToggle.current.getStatus(),
                has_form        : hasFormToggle.current.getStatus()
            };  

            const entityIndex = entitySelect.current.selectedIndex;
            const entityLabel = entitySelect.current.options[entityIndex].label;

            window._controller.docker.dock(request).then((_res) => {
                setState((prevState) => ({...prevState, mapped: _res}));                              
                window._controller.notify( entityLabel + " mapped successfully" ); 
            })
            .catch((e) => {
                window._controller.notify( entityLabel + " failed to map.!", "error" ); 
            });           

        }

    };

    useEffect(() => {            
        fetchEntities();
    }, []);

    const RecordToggle = (_props) => {

        return (
            <div className="toggle-container">
                <label className="pharmarack-cms-toggle-switch">
                    <input type="checkbox" className="pharmarack-cms-toggle-field status" onChange={(_e) => handleFieldToggleChange(_e, _props.property, _props.record)} checked={_props.record[_props.property]} />
                    <span className="pharmarack-cms-toggle-slider"></span>
                </label>            
            </div>    
        );

    };

    const renderEntityList = () => { console.log("renderEntityList is called");   console.log(state.entities);

        const options = [];

        options.push(<option value="">-- Select Entity --</option>);

        if (state && state.entities && state.entities.length > 0) {
            for (let i = 0; i < state.entities.length; i++) {
                if (checkMap(state.entities[i]._id)) {
                    options.push(<option value={state.entities[i]._id}>{state.entities[i].title}</option>);
                }                
            }
        }

        return options;

    };

    const checkMap = (_entityId) => {

        if (state && state.mapped && state.mapped.length > 0) {
            for (let i = 0; i < state.mapped.length; i++) {
                if (_entityId === state.mapped[i].entity._id) {
                    return false;
                }
            }
        }

        return true;

    };

    const RenderMappingRecord = (props) => {

        return (
            <tr>
                <td>{props.sno}</td>
                <td>{props.record.entity.title}</td>
                <td><RecordToggle property="exposed" record={props.record} /></td>
                <td><RecordToggle property="has_form" record={props.record} /></td>
                <td><button className="pharmarack-cms-btn danger icon-left" onClick={(_e) => handleRemoveBtnClick(_e, props.record)} ><i className="fa fa-trash"></i></button></td>
            </tr>                
        );

    };

    const renderFields = () => {

        if (state && state.mapped && state.mapped.length > 0) {
            return state.mapped.map((_item, _index) => <RenderMappingRecord key={uuidv4()} record={_item} sno={(_index + 1)} />);
        } else {
            return <tr key={uuidv4()}><td colSpan="5" className="pharmarack-cms-fields-empty-msg">Module has no entity</td></tr>;
        }

    };

    return (
        <div className="pharmarack-cms-mapped-entity-list">

            <h1>Entity Mapping</h1>

            <table className="mapped-entity-list-factory-table">
                <tbody>
                    <tr>
                        <td className="entity">
                            <label>Entity</label>
                            <select ref={entitySelect} >{renderEntityList()}</select>                    
                        </td>    
                        <td className="exposed">
                            <label>Exposed</label>
                            <Toggle ref={exposeToggle} namespace={_namespace} config={exposeConfig} />                    
                        </td>    
                        <td className="has_form">
                            <label>Has Form</label>
                            <Toggle ref={hasFormToggle} namespace={_namespace} config={hasFormConfig} />
                        </td>    
                        <td className="action">
                            <button className="pharmarack-cms-btn icon-left primary" onClick={handleNewMappingClick} ><i className="fa fa-link"></i> Map Entity</button>        
                        </td>    
                    </tr>  
                </tbody>              
            </table>

        </div>
    );

};

export default forwardRef(EntityMapper);