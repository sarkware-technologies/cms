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

    const fetchEntities = () => {

        const request = {
            method: "GET",
            endpoint: "/system/v1/module/"+ props.record._id +"/entities/all"
        }; 
        
        window._controller.docker.dock(request).then((_res) => {
            setState((prevState) => ({ ...prevState, mapped: _res}));
        })
        .catch((e) => {
            console.error(_req);
        });
        
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

                const mappingGrid = window._controller.getField("module_entity_grid");
                if (mappingGrid) {
                    mappingGrid.initFetch();
                }

            })
            .catch((e) => {
                window._controller.notify( entityLabel + " failed to map.!", "error" ); 
            });           

        }

    };

    useEffect(() => {            
        fetchEntities();
    }, []);

    const renderEntityList = () => {

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

    const self = {
        initFetch: fetchEntities
    };
    useImperativeHandle(ref, () => self);

    return (
        <div className="pharmarack-cms-mapped-entity-list">

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
                            <button className="pharmarack-cms-btn icon-left primary" onClick={handleNewMappingClick} >Map Entity</button>        
                        </td>    
                    </tr>  
                </tbody>              
            </table>

        </div>
    );

};

export default forwardRef(EntityMapper);