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

    this.fetchCountryList = () => {

        this.controller.docker.dock({
            method: "GET",
            endpoint: "/system/v1/api/component/component/multi_select_list?entity=cms_master_country"
        }).then((_res) => {
            this.countryRecords = _res;
            this.fetchStateList();
        })
        .catch((e) => {
            console.log(e);
        });

    };

    this.fetchStateList = () => {

        this.controller.docker.dock({
            method: "GET",
            endpoint: "/system/v1/api/component/component/multi_select_list?entity=cms_master_state"
        }).then((_res) => {
            this.stateRecords = _res;
            this.fetchRegionList();

        })
        .catch((e) => {
            console.log(e);
        });

    };

    this.fetchRegionList = () => {

        this.controller.docker.dock({
            method: "GET",
            endpoint: "/system/v1/api/component/component/multi_select_list?entity=cms_master_region"
        }).then((_res) => {
            this.regionRecords = _res;
            this.fetchRetailerList();
        })
        .catch((e) => {
            console.log(e);
        });

    };

    this.fetchRetailerList = () => {

        this.controller.docker.dock({
            method: "GET",
            endpoint: "/system/v1/api/component/component/multi_select_list?entity=cms_master_retailer&select=_id|RetailerId|RetailerName|RegionId|StateId"
        }).then((_res) => {
            this.retailerRecords = _res;
            this.controller.switchView("main_view");
        })
        .catch((e) => {
            console.log(e);
        });

    };

};