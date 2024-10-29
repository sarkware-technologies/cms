import React, {useState, useEffect, useRef, forwardRef, useImperativeHandle} from "react";
import View from "../components/view";

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
        viewConfig: null,
        dataGrids: {}
    });

    /* Reference for exposing the current state to the child & parent components */
    const stateRef = useRef(state);
    stateRef.current = state;

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
        /* */
        mainGrid: "",

        /* Reference to the current working record - (happens when user click on any records in the datagrids) */
        currentRecord: {},

        currentField: null,

        currentGrid: null,

        viewMode: "archive",

        capability: null,
        
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
         * Used by the controller to maintain the proper state of the datagrid (while switching between archive and single views)
         * 
         * @param {*} _handle 
         * @param {*} _records 
         * @param {*} _totalPages 
         * 
         */
        loadDataGridSnap: (_handle, _records, _totalPages) => {
            let grids = state.dataGrids;
            grids[_handle] = {
                records: _records,        
                currentPage: 1,
                totalPages: _totalPages
            };                        
            setState({...state, dataGrids: grids});
        },   
    
        /**
         * 
         * Used by the controller to get the current snap of the datagrid (while switching between archive and single views)
         * 
         * @param {*} _handle 
         * @returns 
         * 
         */
        getDataGridSnap: (_handle) => {
            return state.dataGrids[_handle];
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

                self.capability = window._controller.getModuleCapability(context);

            } catch (_e) {                
                return;
            }

        }

        loadContext();        

    }, []);
    
    /**
     * 
     * Onload
     * 
     */
    useEffect(() => {  
        /* Try to retrieve sate from controller */
        let prevState = window._controller.getModuleState(context);
        if (prevState) {
            setState(prevState);
        }                    
    }, [props]); 

    /**
     * 
     * Onunload
     * 
     */
    useEffect(()=>()=>{
        /* Dump the state into the controller */
        window._controller.setModuleState(context, state);
    }, [state]);

    /**
     * 
     * Render the module main view
     * 
     * @returns 
     */
    const renderView = () => { 

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
            
        } else {
            return <div className="pharmarack-cms-context-view"><h1 className="pharmarack-cms-no-view-message">No view configured</h1></div>;        
        }
    };

    /**
     * Start to inflate the view
     */
    return renderView();

}

export default forwardRef(ContextWrapper);