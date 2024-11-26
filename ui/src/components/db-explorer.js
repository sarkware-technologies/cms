import React, { useState, useEffect, forwardRef, useImperativeHandle, createRef } from "react";
import { v4 as uuidv4 } from 'uuid';
import View from "./view";

const DbExplorer = (props, ref) => {

    const viewRef = React.createRef(null); 
    const searchResourceRef = React.createRef(null); 
    const [currentResource, setCurrentResource] = useState(null);
    const [state, setState] = useState({
        source: [],
        result: []
    });
    const contextObj = window._controller.getCurrentModuleInstance();      

    const selectResource = (_resource) => {
        setCurrentResource(_resource);
    };

    const loadResources = async () => {
        
        const request = {
            method: "GET",
            endpoint: "/system/v1/query_browser/listResources?type=1"
        };

        try {
            const _res = await window._controller.docker.dock(request);
            setState({
                source: _res,
                result: _res
            });
        } catch (e) {            
            window._controller.notify(e.message, "error");
        }

    };

    const handleSearch = (event) => {
        
        const searchText = event.target.value.toLowerCase();

        // Separate resources into "starts with" and "contains" groups
        const startsWith = state.source.filter((resource) =>
            resource.toLowerCase().startsWith(searchText)
        );
        const contains = state.source.filter((resource) =>
            !resource.toLowerCase().startsWith(searchText) && resource.toLowerCase().includes(searchText)
        );

        // Combine both lists, prioritizing "starts with"
        const filteredResources = [...startsWith, ...contains];
        
        setState((prevState) => ({
            ...prevState,
            result: filteredResources
        }));

    };

    const self = {        
        getCurrentResource: () => currentResource
    };

    useImperativeHandle(ref, () => self);

    useEffect(() => {
        loadResources();
    }, []);

    return (
        <div className="pharmarack-cms-db-explorer">

            <div className="pharmarack-cms-db-explorer-resource-container">
                <input ref={searchResourceRef} type="search" onChange={handleSearch} className="pharmarack-cms-resource-search-txt" />
                <div className="pharmarack-cms-resource-window">
                    {state.result.map((_resource) => <a key={uuidv4()} href="#" className={`${ (currentResource == _resource) ? "active" : "" }`} onClick={() => selectResource(_resource)}>{_resource}</a>)}
                </div>
            </div>
            <div className="pharmarack-cms-db-explorer-result-container">                
                <View key="query_result_view" ref={viewRef} config={contextObj.config.views.query_result_view} handle="query_result_view" isSubView={true} />    
            </div>            

        </div>
    );

};

export default forwardRef(DbExplorer);