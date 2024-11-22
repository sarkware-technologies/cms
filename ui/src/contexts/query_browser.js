import DbExplorer from "../components/db-explorer";
import { v4 as uuidv4 } from 'uuid';

export default function PreviewContext(_component) {

    this.component = _component;
    this.config = this.component.config;
    this.controller = window._controller;

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
    this.onViewSectionRendering = (_handle, _config, _section) => {  console.log(_handle, _config, _section);
        let _widgets = null;

        if (_handle == "main_view" && _section === "content") {
            _widgets = <DbExplorer key="_dbExplorer" />;            
            return { component: _widgets, pos: "replace" };
        }

        /* 'pos' could be 'before', 'after' or 'replace' */
        return { component: _widgets, pos: "after" };
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
        return _viewConfig;
    };

};