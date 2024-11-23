import { createRef } from "react";
import DbExplorer from "../components/db-explorer";
import DbGrid from "../components/db-grid";
import { v4 as uuidv4 } from 'uuid';

export default function PreviewContext(_component) {

    this.component = _component;
    this.config = this.component.config;
    this.controller = window._controller;

    this.dbGridRef = createRef(null);
    this.dbExplorerRef = createRef(null);

    this.countryRecords = [];
    this.stateRecords = [];
    this.regionRecords = [];
    this.retailerRecords = [];

    /**
     * 
     * Context init handler, this is the place where everything get start ( context wise - not global wise ) 
     *
     **/
    this.init = () => {       
        this.controller.switchView("main_view");
    };     

    /**
     * 
     * @param {*} _config 
     * @param {*} _section 
     * @returns 
     * 
     * Called before a section is rendering (section could be header, content or footer)
     * Chance to insert your own component into each section
     * 
     */
    this.onViewSectionRendering = (_handle, _config, _section) => {

        let _widgets = null;

        if (_handle == "main_view" && _section === "content") {
            
            _widgets = <DbExplorer ref={this.dbExplorerRef} key="_dbExplorer" />;            
            return { component: _widgets, pos: "replace" };

        } else if (_handle == "db_result_view" && _section === "content") {

            _widgets = <DbGrid ref={this.dbGridRef} key={uuidv4()} handle="selectorGrid" />
            return { component: _widgets, pos: "replace" };

        }

        /* 'pos' could be 'before', 'after' or 'replace' */
        return { component: _widgets, pos: "after" };
        
    };

    /**
     * 
     * @param {*} _tabHandle 
     * @param {*} _tabItemHandle 
     * 
     * Called whenever a Tab Item is go to visible state 
     * 
     */
    this.onTabViewMounted = ( _tabHandle, _tabItemHandle ) => {
        
        console.log(_tabHandle, _tabItemHandle);

    };

    /**     
     * 
     * @param {*} _handle 
     * @returns 
     * 
     * Called right before a view is mounting
     * 
     */
    this.beforeViewMount = (_handle, _viewConfig) => {

        if (_handle == "db_result_view") {

        }

        console.log(_handle, _viewConfig);

        return _viewConfig;
    };

};