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
        this.confirm = createRef();

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
        this.menuConfig = [];

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
        this.snapshot[_module] = _state;
    };

    setLayoutInstance = (_instance) => {
        this.layout = _instance;
    };

    getModuleState = (_module) => {
        return this.snapshot[_module] ? this.snapshot[_module] : null;
    };

    registerField = (_handle, _type, _field) => {
        let contextObj = this.getCurrentModuleInstance();
        if (contextObj) {
            contextObj.registerField(_handle, _field);
        }
    };

    onTabMount = (_handle) => {
        let contextObj = this.getCurrentModuleInstance();
        if (contextObj) {
            const field = contextObj.getField(_handle);
            if (field) {
                field.init();
            }
        }
    };

    getField = (_handle) => {
        let contextObj = this.getCurrentModuleInstance();
        if (contextObj) {
            return contextObj.getField(_handle);
        }
        return null;
    };

    /**
     *
     * @param {*} _handle
     */
    getInputFieldVal = (_handle) => {
        let field = this.getField(_handle);
        if (field) {
            return field.getVal();
        }
        return null; 
    };

    /**
     *
     * @param { } _handle
     * @param {*} _value
     */
    setInputFieldVal = (_handle, _value) => {
        let field = this.getField(_handle);
        if (field) {
            field.setVal(_value);
            return _value;
        }
        return null;
    };

    getToggleStatus = (_handle) => {
        let field = this.getField(_handle);
        if (field) {
            return field.getStatus();
        }
        return null;
    };

    setToggleStatus = (_handle, _value) => {
        let field = this.getField(_handle);
        if (field) {
            field.setStatus(_value);
            return _value;
        }
        return null;
    };

    getSearchRecord = (_handle) => {
        let field = this.getField(_handle);
        if (field) {
            return field.getCurrentRecord();
        }
        return null;
    };

    setSearchRecord = (_handle, _value) => {
        let field = this.getField(_handle);
        if (field) {
            field.setCurrentRecord(_value);
            return _value;
        }
        return null;
    };

    switchTab = (_handle, _view) => {
        let field = this.getField(_handle);
        if (field) {
            field.switchTab(_view);
            return true;
        }
        return null;
    };

    switchView = (_view) => {
        let contextObj = this.getCurrentModuleInstance();
        if (contextObj) {
            contextObj.switchView(_view);
            return true;
        }
        return null;
    };

    loadContextBar = (_title, _breadcrumb, _actions) => {
        if (this.ContextBar && this.ContextBar.current) {
            this.ContextBar.current.loadTopBar(_title, _breadcrumb, _actions);
        }
    };

    loadContextTitle = (_title) => {
        if (this.ContextBar && this.ContextBar.current) {
            this.ContextBar.current.loadTitle(_title);
        }
    };

    loadContextBreadcrumb = (_breadcrumb) => {
        if (this.ContextBar && this.ContextBar.current) {
            this.ContextBar.current.loadBreadcrumb(_breadcrumb);
        }
    };

    loadContextActions = (_actions) => {
        if (this.ContextBar && this.ContextBar.current) {
            this.ContextBar.current.loadActions(_actions);
        }
    };

    /**
     *
     * @param {*} _key
     * @param {*} _choices
     */
    loadFieldChoices = (_key, _choices) => {
        let field = this.getField(_key);
        if (field) {
            field.loadOptions(_choices);
            return _choices;
        }
        return null;
    };

    /**
     *
     * @param {*} _key
     * @param {*} _records
     */
    loadRecords = (_handle, _records, _totalPages, _recordPerPage) => {
        let contextObj = this.getCurrentModuleInstance();
        if (contextObj) {
            let field = contextObj.getField(_handle);
            if (field) {
                field.loadRecords(_records, _totalPages, _recordPerPage);
                /* Put it on the context state */
                //contextObj.loadDataGridSnap(_records, _totalPages);
                return _records;
            }
        }
        return null;
    };

    /**
     *
     * @param {*} _key
     */
    getCurrentRecord = (_key) => {
        let field = this.getField(_key);
        if (field) {
            return field.getCurrentRecord();
        }
        return null;
    };

    /**
     * 
     * @param {*} _target 
     * @param {*} _handle 
     */
    handleMediaChange = (_target, _handle) => {
        let contextObj = this.getCurrentModuleInstance();
        if (contextObj && contextObj.handleMediaChange) {
            contextObj.handleMediaChange(_target, _handle);
        }
    };

    /**
     * 
     * @param {*} _handle 
     */
    handleMediaDelete = (_handle) => {
        let contextObj = this.getCurrentModuleInstance();
        if (contextObj && contextObj.handleMediaDelete) {
            contextObj.handleMediaDelete(_handle);
        }
    };

    getModuleCapability = (_handle) => {

        if (Array.isArray(this.menuConfig)) {
            for (let i = 0; i < this.menuConfig.length; i++) {
                if (this.menuConfig[i].handle == _handle) {
                    const capability = this.menuConfig[i].capability;
                    capability["cancel"] = true;
                    return capability;
                }
            }
        }

        return {
            get: true,
            post: false,
            delete: false,
            put: false,
            cancel: true
        };

    };

    notify = (_msg, _type) => {
        this.notification.current.notify(_msg, _type);
    };

    render = () => <LayoutLoader />;

}