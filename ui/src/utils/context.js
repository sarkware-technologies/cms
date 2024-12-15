import React, {useState, useEffect, useRef, forwardRef, useImperativeHandle, useMemo} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import View from "../components/view";
import Helper from "./helper";

/**
 * 
 * @author Sark
 * @version 1.0.0
 * @param {*} props 
 * @param {*} ref 
 * @returns 
 * 
 * Base class for all the module
 * Responsible for managing module and it's component lifecycles
 * It also expose a primary interface for extending this component by the developer 
 * 
 */
const ContextWrapper = (props, ref) => {

    const navigate = useNavigate();
    const location = useLocation();

    /**
     * 
     * Used to identify this module in controller's store object
     * 
     */
    const context = props.name;

    /**
     * 
     * Holds the reference for all the fields that this module is using
     * 
     */
    const fields = {};   

    /**
     * 
     * Module State
     * @currentView - Holds the current view name (changing this property will switch the View)
     * @viewConfig  - Holds the configuration for the current view
     * @dataGrids   - Holds the datagrid's state used by this module - (same can be found in fields property too)
     *              - But this one used to restore the state from view switching
     * 
     */
    const [state, setState] = useState({        
        currentView: null,     
        viewConfig: null        
    });

    /* Reference for exposing the current state to the child & parent components */
    const stateRef = useRef(state);
    stateRef.current = state;

    const [contextErr, setContextErr] = useState(false);

    /**
     * 
     * Primary interface which allows this component to be extended by the Developer
     * 
     */
    const self = {
        
        /* Holds the configuration from the corresponding module's configuration file */
        config: null,

        /* Reference for this module state object - so that Usercomponent can have access to it */
        getState: () => stateRef.current,

        /* Reference for state setter method - so that Usercomponent can have access to it */
        setState: setState,

        /* Reference for field's reference object - so that Usercomponent can have access to it */
        fields: fields,        
        
        /* Holds he handle of of the current data grid */
        mainGrid: "",

        /* Reference to the current working record - (happens when user click on any records in the datagrids) */
        currentRecord: {},

        tab: {},

        currentField: null,

        currentGrid: null,

        viewMode: "archive",

        capability: null,

        dataGrids: {},

        activeKeys: null,
        
        /**
         * 
         * Mostly used by the controller instance to access all fields
         * 
         * @returns
         * 
         */
        getFields: () => {
            return fields;
        },
        
        /**
         * 
         * Mostly used by the controller instance to access a given field's reference
         * 
         * @param {*} _handle 
         * @returns 
         * 
         */
        getField: (_handle) => {
            return fields[_handle] ? fields[_handle].current : null;
        },
    
        /**
         * 
         * Common method to set field's value (Expecting all the form's component has this method implemented)
         * 
         * @param {*} _handle 
         * @param {*} _value 
         * 
         */
        setVal: (_handle, _value) => {
            if (fields[_handle] && fields[_handle].current && (typeof fields[_handle].current.setVal === "function")) {
                fields[_handle].current.setVal(_value);
            }            
        },

        /**
         * 
         * Common method to get field's value (Expecting all the form's component has this method implemented)
         * 
         * @param {*} _handle          
         * 
         */
        getVal: (_handle) => {
            if (fields[_handle] && fields[_handle].current && (typeof fields[_handle].current.getVal === "function")) { 
                return fields[_handle].current.getVal();
            }            
            return null;
        },
    
        /**
         * 
         * Used to register field's reference with the module instance
         * 
         * @param {*} _handle 
         * @param {*} _field 
         * 
         */
        registerField: (_handle, _field) => {
            fields[_handle] = _field; 
        },
    
        /**
         * 
         * Trigger the browser's back button event
         * 
         */
        triggerBack: () => {
            navigate(-1);
            const contextObj = window._controller.getCurrentModuleInstance();
            if (contextObj.onBackAction) {
                contextObj.onBackAction();   
            } 
        },

        /**
         * 
         * Used to switch the views
         * 
         * @param {*} _viewName 
         * 
         */
        switchView: (_viewName) => {

            if (self.config && self.config.views[_viewName]) {
                let _viewConfig = self.beforeViewMount(_viewName, self.config.views[_viewName]);
                setState({
                    ...state, 
                    currentView: _viewName, 
                    viewConfig: JSON.parse(JSON.stringify(_viewConfig))
                });
            }
                        
        },

        _init: () => {

            /* determine the view */
            let targetView = null;
            /*  */
            let parsedResult = null;
            /* Reset */
            self.activeKeys = null;            
            const routeKeys = Object.keys(self.config.routes);
            const contextObj = window._controller.getCurrentModuleInstance();

            for (let i = 0; i < routeKeys.length; i++) {
                parsedResult = Helper.matchUrlPattern(self.config.routes[routeKeys[i]], location);
                if (parsedResult) {
                    targetView = routeKeys[i];                    
                    break;
                }
            }

            if (targetView) {

                const viewObj = self.config.views[targetView];
                /* Update the active keys */
                if (typeof parsedResult === "object") {

                    self.activeKeys = parsedResult;
                    let _endPoint = viewObj.source;

                    if (parsedResult["id"]) {
                        _endPoint = _endPoint + parsedResult["id"];
                    }

                    if (contextObj.onCurrentRecordRequest) {
                        _endPoint = contextObj.onCurrentRecordRequest(targetView, _endPoint);   
                    } 

                    const request = {};
                    request["method"] = "GET";
                    request["endpoint"] = _endPoint;

                    contextObj.currentRecord[viewObj.viewFor] = null;
                    window._controller.docker.dock(request).then((_res) => {

                        /* Restore the context state */
                        if (window._controller.snapshot[context]) {
                            self.currentGrid = window._controller.snapshot[context].currentGrid;
                            self.mainGrid = window._controller.snapshot[context].mainGrid;
                        }

                        /** 
                         * 
                         * Call back for updating the viewFor properties 
                         * (Need when the main view doesn't has single data grid but it is has multiple grids on tab items) 
                         * 
                         **/
                        let _viewFor = viewObj.viewFor;
                        if (contextObj.onCurrentRecordResponse) {
                            _viewFor = contextObj.onCurrentRecordResponse(targetView, _res);   
                            _viewFor = _viewFor ? _viewFor : viewObj.viewFor;
                        } 

                        contextObj.currentRecord[_viewFor] = _res;                        

                        if (!contextObj.currentGrid) {
                            contextObj.currentGrid = _viewFor;

                        }

                        contextObj.init(targetView);
                    })
                    .catch((e) => {
                        console.log(e);
                    });

                } else {                    
                    if (contextObj) {
                        contextObj.init(targetView);
                    }
                }
                
            } else {
                /* No view is matching - inform the user */

            }            
            
        }
        
    };      

    /**
     * Export context object
     */
    useImperativeHandle(ref, () => self);

    /**
     * Onload
     */
    useEffect(() => {

        const loadContext = async () => {
            try {        
                
                const _config = await import ('../configs/'+ context +".js");
                const _module = await import ('../contexts/'+ context +".js");
                self.config = _config.default;
                self.viewMode = "archive";
                
                Object.setPrototypeOf(self, new _module.default(self));
                props.registerInstance(context);

                /* Load capability for this module */
                self.capability = window._controller.getModuleCapability(context);

            } catch (_e) { 
                setContextErr(true);               
                return;
            }
        }

        loadContext();        

    }, [location.pathname]);

    /**
     * 
     * Render the module main view
     * 
     * @returns 
     */
    const renderView = useMemo(() => { 

        /* Update the getState helper function */        
        stateRef.current = state;

        const contextObj = window._controller.getCurrentModuleInstance();
        if (contextObj && contextObj.beforeViewMount) {
            contextObj.beforeViewMount(state.currentView, state.viewConfig);
        }        

        if (state.currentView && state.viewConfig) { 

            const viewRef = React.createRef();
            const view = <View ref={viewRef} config={state.viewConfig} handle={state.currentView} />
            window._controller.registerField(state.currentView, "view", viewRef);  

            return <div className={`pharmarack-cms-context-view ${context} ${state.currentView}`}>{view}</div>;
            
        } else if (contextErr) {
            return <div className="pharmarack-cms-context-view"><h1 className="pharmarack-cms-no-view-message">Error while loading config & context</h1></div>;        
        } else {
            return (
            <div className="pharmarack-cms-context-view">
                <div className="context-loading-container">
                    <div className="context-loading-spinner"></div>
                    <p>Loading, please wait...</p>
                </div>
            </div>
            );        
        }

    }, [state.currentView, state.viewConfig, contextErr, context]);

    /**
     * Start to inflate the view
     */
    return renderView;

}

export default forwardRef(ContextWrapper);