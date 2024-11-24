import React, { useState, useEffect, forwardRef, useImperativeHandle, createRef } from "react";
import { v4 as uuidv4 } from 'uuid';
import View from "./view";

const DbExplorer = (props, ref) => {

    const viewRef = React.createRef(); 
    const [currentResource, setCurrentResource] = useState("");
    const [resourceList, setResourceList] = useState([]);
    const contextObj = window._controller.getCurrentModuleInstance();  
    const _config = contextObj.config

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
            setResourceList(_res);
        } catch (e) {
            console.log(e);
        }

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
                <input type="search" className="pharmarack-cms-resource-search-txt" />
                <div className="pharmarack-cms-resource-window">
                    {resourceList.map((_resource) => <a key={uuidv4()} href="#" className={`${ (currentResource == _resource) ? "active" : "" }`} onClick={() => selectResource(_resource)}>{_resource}</a>)}
                </div>
            </div>
            <div className="pharmarack-cms-db-explorer-result-container">                
                <View key="query_result_view" ref={viewRef} config={contextObj.config.views.query_result_view} handle="query_result_view" isSubView={true} />    
            </div>            

        </div>
    );

};

export default forwardRef(DbExplorer);