import React, { createRef } from "react";
import Utils from "./utils/utils";
import LayoutLoader from "./utils/layout";
import Docker from "./utils/docker";

/**
 *
 *
 * @author : Sark
 * @version: 1.0
 *
 *
 */
export default class Controller extends React.Component {
    
    constructor(props) {

        super(props);

        /**
         * 
         * Used to store the snapshot of the contexts
         * 
         */
        this.snapshot = {};
        
        /**
         * 
         * Holds the current name of the context 
         * 
         */
        this.current = null;
        
        /**
         * 
         * 
         * 
         */
        this.instances = {};
        
        /**
         * 
         * Holds the reference to the context bar component
         * 
         */
        this.ContextBar = createRef();

        /**
         * 
         * 
         * 
         */
        this.notification = createRef();

        /**
         * 
         * 
         * 
         */
        this.layout = createRef();
        
        /**
         * 
         * This is the global state of the application
         * we use to contorl the theme, locale and menus
         * 
         */
        this.state = { theme: "", locale: "", menus: [] };

        /**
         * 
         * 
         * 
         */
        this.utils = new Utils();

        /**
         * 
         * Since app is the root component, we can use this bucket to store shared data
         * which needs to be fetched only once and used across the application
         * 
         */
        this.bucket = {
            countryRecords: [],
            stateRecords: [],
            regionRecords: [],
            retailerRecords: [],
            segmentRecords: [],
            distributorRecords: [],
            companyRecords: [],
            componentTypeList: []
        };

        /**
         * 
         * Common ajax handler
         * 
         */
        this.docker = new Docker();

        /**
         * 
         * 
         * 
         */
        window["_controller"] = this;

    };      

    getCurrentTheme = () => {
        return this.state.theme;
    };

    getCurrentLocale = () => {
        return this.state.locale;
    };

    getCurrentModule = () => {
        return this.current;
    };

    getCurrentModuleInstance = () => {
        if (this.current && this.instances[this.current]) {
            return this.instances[this.current];
        }
        return null;
    };

    setCurrentModuleInstance = (_module, _instance) => {
        this.current = _module;
        this.instances[_module] = _instance;
        this.instances[_module].init();
    };

    setCurrentModule = (_module) => {
        this.current = _module;
    };

    setModuleState = (_module, _state) => {
        this.store[_module] = _state;
    };

    setLayoutInstance = (_instance) => {
        this.layout = _instance;
    };

    getModuleState = (_module) => {
        return this.store[_module] ? this.store[_module] : null;
    };

    render = () => <LayoutLoader />;

}