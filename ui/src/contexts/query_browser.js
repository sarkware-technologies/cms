import Previewer from "../components/previewer";
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
        //this.fetchCountryList();        
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
        let _widgets = [];

        if (_section === "content") {
            _widgets.push(<Previewer key={uuidv4()} country={this.countryRecords} state={this.stateRecords} region={this.regionRecords} retailer={this.retailerRecords} />);            
        }

        /* 'pos' could be 'before', 'after' or 'replace' */
        return { component: _widgets, pos: "before" };
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

    this.fetchTableList = () => {

        this.controller.docker.dock({
            method: "GET",
            endpoint: "/system/v1/query_browser/tableList"
        }).then((_res) => {
            this.countryRecords = _res;            
        })
        .catch((e) => {
            console.log(e);
        });

    };

};