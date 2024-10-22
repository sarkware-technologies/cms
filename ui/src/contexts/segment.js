import React from "react";
import { createRoot } from 'react-dom/client';
import { v4 as uuidv4 } from 'uuid';
import SegmentPreview from "../components/segment-preview";
import MultiSelect from "../components/multi-select";

export default function SegmentContext(_component) {

    this.component = _component;
    this.config = this.component.config;
    this.controller = window._controller;
    this.segmentPreviewRef = null;

    this.geographySelectorRef = null

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
     * @param {*} _handle 
     * @param {*} _datasource 
     * @returns 
     * 
     * Called before making request to server - for datagrid
     * 
     */
    this.onDatagridRequest = (_handle, _datasource) => {

        let datasource = JSON.parse(JSON.stringify(_datasource));        

        if (_handle === "retailer_grid") {
            const segment = this.component.currentRecord["segment_grid"]; 
            if (segment) {
                 datasource.endpoint = "/system/segment/"+ segment._id +"/retailers"; 
            }
        }

        return datasource;

    };    

    /**
     * 
     * @param {*} _handle 
     * @param {*} _value 
     * @param {*} _e 
     * 
     * Called whenever a field got changed 
     * 
     */
    this.onFieldChange = ( _handle, _value, _e ) => {

        if (this.segmentPreviewRef.current) {

            if (_handle == "new_segment_form_segmentType") {
                this.segmentPreviewRef.current.setSegmentType(_value);
            } else if (_handle == "segment_form_tab_title") {
                this.segmentPreviewRef.current.setSegmentTitle(_value);
            } else if (_handle == "segment_form_tab_description") {
                this.segmentPreviewRef.current.setSegmentDescription(_value);
            } else if (_handle == "segment_form_tab_from") {
                this.segmentPreviewRef.current.setFromDate(_value);
            } else if (_handle == "segment_form_tab_to") {
                this.segmentPreviewRef.current.setToDate(_value);
            } else if (_handle == "segment_form_tab_geography") {
                this.segmentPreviewRef.current.setGeographyType(_value == 1 ? "State" : "Region");
                this.segmentPreviewRef.current.setGeographyTarget("Yet to be selected");
            } else if (_handle == "segment_form_tab_geography_target") {
                this.segmentPreviewRef.current.setGeographyTarget(_value == 1 ? "Product" : "Brand");
            } else if (_handle == "segment_form_tab_orderStatus") {
                const orderStatus = this.controller.getField("segment_form_tab_orderStatus");
                if (orderStatus) {
                    const _checkedRecords = orderStatus.getChecked();
                    const _checked = _checkedRecords.map((item) => item.label);
                    this.segmentPreviewRef.current.setOrderStatus(_checked.join(", "));
                }
            } else if (_handle == "segment_form_tab_salesType") {
                this.segmentPreviewRef.current.setSalesType(_value);
            } else if (_handle == "segment_form_tab_retailerStatus") {
                this.segmentPreviewRef.current.setRetailerStatus(_value == 1 ? "All" : "Authorized");
            } else if (_handle == "segment_form_tab_distributorStatus") {
                this.segmentPreviewRef.current.setDistributorStatus(_value == 1 ? "All" : "Authorized");
            }

        }

        if (_handle == "new_segment_form_segmentType") {
            
            const segmentFormTab = this.controller.getField("segment_form_tab");
            if (segmentFormTab) {
                const tabView = (_value == 1) ? "dynamic_segment_tab" : "static_segment_tab";
                segmentFormTab.switchTab(tabView);
            } 

        } else if (_handle == "segment_form_tab_geography") {

            let fieldConfig = null;
            
            if (_value == 1) {
                fieldConfig = {
                    type: "multiselect", 
                    label: "", 
                    handle: "geography_target", 
                    value : "", 
                    parents: {},
                    placeholder: "States", 
                    searchprompt: "Search for states",
                    search_class: "", 
                    popup_class: "",
                    behaviour: "dropdown",
                    mandatory: false, 
                    readonly: false, 
                    disabled: false, 
                    tabindex: 1, 
                    align: "right", 
                    label_width: 0, 
                    recordsPerPage: 10,
                    label_position: "top", 
                    prompt_message: "", 
                    validation_message: "", 
                    value_key: "StateId", 
                    label_key: "Statename", 
                    source: "remote",
                    endpoint: "/system/api/segment/segment/multi_select_list?entity=state&select=_id|StateId|Statename"
                };
            } else {
                fieldConfig = {
                    type: "multiselect", 
                    label: "", 
                    handle: "geography_target", 
                    value : "", 
                    parents: {},
                    placeholder: "Regions", 
                    searchprompt: "Search for regions",
                    search_class: "", 
                    popup_class: "",
                    behaviour: "dropdown",
                    mandatory: false, 
                    readonly: false, 
                    disabled: false, 
                    tabindex: 1, 
                    align: "right", 
                    label_width: 0, 
                    recordsPerPage: 10,
                    label_position: "top", 
                    prompt_message: "", 
                    validation_message: "", 
                    value_key: "RegionId", 
                    label_key: "RegionName", 
                    source: "remote",
                    endpoint: "/system/api/segment/segment/multi_select_list?entity=region&select=_id|RegionId|RegionName"
                };
            }

            const _holder = document.getElementById('segment_geography_container');
            const root = createRoot(_holder);

            this.geographySelectorRef = React.createRef();                
            root.render(            
                <MultiSelect
                    ref={this.geographySelectorRef}
                    key={uuidv4()}
                    config={fieldConfig}
                    original={null}
                    selected={[]}
                    parent={null}
                    child={null}
                />
            );

        }

    };

    /**
     * 
     * @param {*} _handle 
     * 
     * Called whenever multi-select widget's done button clicked
     * 
     */
    this.onMultiSelectRecordDone = (_handle) => {

        if (_handle == "add_retailers") {
            const retailerWidget = this.controller.getField("segment_retaler_form_add_retailers");
            if (retailerWidget) {

                const selectedRetailers = retailerWidget.getSelectedRecords();

                if (!selectedRetailers || selectedRetailers.length == 0 || selectedRetailers == "none") {
                    this.controller.notify("Nothing to add", "error");
                    return;
                }

                const request = {};    
                const segment = this.component.currentRecord["segment_grid"];
                const retailerGrid = this.controller.getField("retailer_grid");

                if (segment) {
                    
                    request["method"] = "PUT";
                    request["endpoint"] = "/system/segment/" + segment._id +"/retailers";
                    request["payload"] = selectedRetailers;

                    this.controller.docker.dock(request).then((_res) => {
                        this.controller.notify(selectedRetailers.length + " retailers were added successfully.!");
                        retailerGrid.initFetch();    
                    })
                    .catch((e) => {
                        this.controller.notify(e.message, "error");
                    });

                }

            }
        }
        
        if (this.segmentPreviewRef.current) {
            if(_handle == "geography_target") {                        

                let _selected = this.geographySelectorRef.current.getSelectedRecordsLabel();
                if(_selected && Array.isArray(_selected)) {
                    _selected = _selected.join(", ");
                }
                this.segmentPreviewRef.current.setGeographyTarget(_selected);    
                
            } else if (_handle == "companies") {
                
                const companySelector = this.controller.getField("segment_form_tab_companies");
                
                if (companySelector) {
                    let _selected = companySelector.getSelectedRecordsLabel();
                    if(_selected && Array.isArray(_selected)) {
                        _selected = _selected.join(", ");
                    }  console.log(_selected);
                    this.segmentPreviewRef.current.setCompanies(_selected);
                }
                
            } else if (_handle == "distributors") {

                const distributorSelector = this.controller.getField("segment_form_tab_distributors");
                if (distributorSelector) {
                    let _selected = distributorSelector.getSelectedRecordsLabel();
                    if(_selected && Array.isArray(_selected)) {
                        _selected = _selected.join(", ");
                    }  console.log(_selected);
                    this.segmentPreviewRef.current.setDistributorExclude(_selected);
                }
                
            }
        }

    };

    /**
     * 
     * @param {*} _config 
     * @param {*} _section 
     * @param {*} _row 
     * @param {*} _column 
     * @returns 
     * 
     * Column's render callback (chance to insert your own component into each columns)
     * 
     */
    this.onColumnSectionRendering = (_handle, _config, _section, _row, _column) => {  

        let _widgets = [];
        
        if (_handle === "new_segment_form" && _section === "content" && _row === 0 && _column === 1) {
            
            this.segmentPreviewRef = React.createRef();
            let widget = <SegmentPreview ref={this.segmentPreviewRef} />;                
            _widgets.push(<div key={uuidv4()} style={{width: "66.6666%"}} className={`fields-factory-view-column flex-remaining-width`}>{widget}</div>);
            
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
        if (_tabHandle == "segment_form_tab" && _tabItemHandle == "dynamic_segment_tab") {
            this.onFieldChange("segment_form_tab_geography", 1);
        }
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
    
    /**
     * 
     * @param {*} _handle 
     * 
     * Called whenever view is mounted on the DOM
     * 
     */
    this.onViewMounted = (_handle) => {

    };

    /**
     * 
     * @param {*} _e 
     * @param {*} _field 
     * @param {*} _grid 
     * @param {*} _record 
     * 
     * Called whenever user click on the datagrid record (button type)
     * 
     */
    this.onRecordButtonClick = (_e, _field, _grid, _record) => {

        if (_grid == "retailer_grid" && _field == "REMOVE") {
            this.removeRetailersFromSegment([_record.RetailerId]);
        }

    };

    /**
     * 
     * @param {*} _action 
     * 
     * This handler called for any ( context specific ) action button click events 
     * 
     */
    this.onActionBtnClick = (_action) => {

        if (_action === "NEW_SEGMENT") {
            this.component.currentRecord["segment_grid"] = null;
            this.controller.switchView("new_segment_form");
        } else if (_action === "CANCEL_SEGMENT") {     
            this.component.currentRecord["segment_grid"] = null;       
            this.controller.switchView("main_view");
        } else if (_action === "SAVE_SEGMENT") {
            this.saveSegment();
        } else if (_action === "ADD_RETAILER") {
            const newRetailerSelector = this.controller.getField("segment_retaler_form_add_retailers");
            if (newRetailerSelector) {
                newRetailerSelector.showPopup();
            }
        } else if (_action === "REMOVE_RETAILER") {
            const retailerGrid = this.controller.getField("retailer_grid");
            if (retailerGrid) {
                const checkedRecords = retailerGrid.getCheckedRecords();
                if (checkedRecords.length > 0) {
                    const retailerIds = checkedRecords.map(record => record.RetailerId);
                    this.removeRetailersFromSegment(retailerIds);
                } else {
                    this.controller.notify("Select retailers to remove", "error");
                }
            }
        }

    };

    this.removeRetailersFromSegment = (_retailersIds) => {
        const request = {};    
        const segment = this.component.currentRecord["segment_grid"];
        const retailerGrid = this.controller.getField("retailer_grid");

        if (segment) {
            
            request["method"] = "PUT";
            request["endpoint"] = "/system/segment/" + segment._id +"/deleteRetailers";
            request["payload"] = _retailersIds;

            this.controller.docker.dock(request).then((_res) => {
                this.controller.notify("Retailer(s) were removed successfully.!");
                retailerGrid.initFetch();    
            })
            .catch((e) => {
                this.controller.notify(e.message, "error");
            });

        }
    };

    this.saveSegment = () => {

        const request = {};    
        const segment = this.component.currentRecord["segment_grid"];

        if (segment) {
            /* It's an uppdate call */
            request["method"] = "PUT";
            request["endpoint"] = "/system/segment/" + segment._id;
        } else {
            /* It's a new record */
            request["method"] = "POST";
            request["endpoint"] = "/system/segment";
        }

        request["payload"] = null;
        const segmentType = this.controller.getField("new_segment_form_segmentType");

        if (segmentType) {
            const sType = segmentType.getVal();
            const segmentTab = this.controller.getField("segment_form_tab");
            if (segmentTab) {
                request["payload"] = segmentTab.getFormFields();                                       
                request["payload"]["segmentType"] = sType;
            }
        }

        if (request["payload"]) {
            this.controller.docker.dock(request).then((_res) => {
                this.controller.notify(_res.title + " saved successfully.!");
                    this.controller.switchView("main_view");
                    this.component.currentRecord["segment_grid"] = null;
            })
            .catch((e) => {
                this.controller.notify(e.message, "error");
            });
        }

    };

};