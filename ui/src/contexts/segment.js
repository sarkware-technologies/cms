import React, { createRef } from "react";
import { createRoot } from 'react-dom/client';
import { v4 as uuidv4 } from 'uuid';
import SegmentPreview from "../components/segment-preview";
import MultiSelect from "../components/multi-select";
import SegmentRules from "../components/segment-rules";
import SegmentStatus from "../components/segment-status";
import SegmentAction from "../components/segment-action";

export default function SegmentContext(_component) {

    this.component = _component;
    this.config = this.component.config;
    this.controller = window._controller;

    this.segmentPreviewRef = null;
    this.geographySelectorRef = null;
    this.segmentRuleContainer = null;
    this.blacklistRetailerId = null;

    this.segmentActionRef = createRef(null);
    this.segmentStatusRef = createRef(null);

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
        const segment = this.getCurrentSegmentRecord();

        if (_handle === "retailer_grid" && segment) {            
            datasource.endpoint = "/segmentation/v1/segment/"+ segment._id +"/retailers"; 
        } else if (_handle === "whitelist_retailer_grid" && segment) {
            datasource.endpoint = "/segmentation/v1/segment/"+ segment._id +"/whitelistedRetailers";             
        } else if (_handle === "blacklist_retailer_grid" && segment) {
            datasource.endpoint = "/segmentation/v1/segment/"+ segment._id +"/blacklistedRetailers";             
        } else if (_handle === "build_history_grid") {
            datasource.endpoint = "/segmentation/v1/segment/"+ segment._id +"/buildHistory";             
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
                    endpoint: "/segmentation/v1/api/segment/segment/multi_select_list?entity=cms_master_state&select=_id|StateId|Statename"
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
                    endpoint: "/segmentation/v1/api/segment/segment/multi_select_list?entity=cms_master_region&select=_id|RegionId|RegionName"
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

        if (this.segmentPreviewRef && this.segmentPreviewRef.current) {

            if (_handle == "new_segment_form_segmentType") {
                this.segmentPreviewRef.current.setSegmentType(_value);
            } else if (_handle == "segment_form_tab_title") {
                this.segmentPreviewRef.current.setSegmentTitle(_value);
            } else if (_handle == "segment_form_tab_description") {
                this.segmentPreviewRef.current.setSegmentDescription(_value);
            } else if (_handle == "segment_form_tab_fromDate") {                
                this.segmentPreviewRef.current.setFromDate(_value);
            } else if (_handle == "segment_form_tab_toDate") {                
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
            } else if (_handle == "segment_form_tab_storeStatus") {
                this.segmentPreviewRef.current.setStoreStatus(_value == 1 ? "All" : "Authorized");
            } else if (_handle == "segment_previewer") {
                if (this.segmentRuleContainer.current) {
                    const _rules = this.segmentRuleContainer.current.getRules();
                    this.segmentPreviewRef.current.setSegmentRules(_rules);
                }                
            }

        }

    };

    /**
     * 
     * @param {*} _handle 
     * 
     * Called whenever any multiselector loaded
     * 
     */
    this.onMultiSelectRecordLoaded = (_handle) => {

        const record = this.getCurrentSegmentRecord();
        if (record) {

            if (_handle == "companies") {
                const companyField = this.controller.getField("segment_form_tab_companies");
                if (companyField && record.companies) {
                    companyField.setSelectedRecords(record.companies);
                }
            } else if (_handle == "geography_target") {
                
                if (this.geographySelectorRef && this.geographySelectorRef.current) {
                    if (record.geography == 1) {
                        this.geographySelectorRef.current.setSelectedRecords(record.states);
                    } else {
                        this.geographySelectorRef.current.setSelectedRecords(record.regions);
                    }
                }

            } else if (_handle == "excludedStores") {
                const distributorField = this.controller.getField("segment_form_tab_excludedStores");
                if (distributorField && record.excludedStores) {
                    distributorField.setSelectedRecords(record.excludedStores);
                }
            }

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
            const retailerWidget = this.controller.getField("segment_retailer_form_add_retailers");
            if (retailerWidget) {

                const selectedRetailers = retailerWidget.getSelectedRecords();

                if (!selectedRetailers || selectedRetailers.length == 0 || selectedRetailers == "none") {
                    this.controller.notify("Nothing to add", "error");
                    return;
                }

                const request = {};    
                const segment = this.getCurrentSegmentRecord();
                const retailerGrid = this.controller.getField("retailer_grid");

                if (segment) {
                    
                    request["method"] = "PUT";
                    request["endpoint"] = "/segmentation/v1/segment/" + segment._id +"/whitelistRetailers";
                    request["payload"] = selectedRetailers;

                    this.controller.docker.dock(request).then((_res) => {
                        this.controller.notify(selectedRetailers.length + " retailers were whitelisted successfully.!");
                        retailerGrid.initFetch();    
                    })
                    .catch((e) => {
                        this.controller.notify(e.message, "error");
                    });

                }

            }
        }
        
        if (this.segmentPreviewRef && this.segmentPreviewRef.current) {
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
                    }
                    this.segmentPreviewRef.current.setCompanies(_selected);
                }
                
            } else if (_handle == "excludedStores") {

                const distributorSelector = this.controller.getField("segment_form_tab_excludedStores");
                
                if (distributorSelector) {

                    let _selected = distributorSelector.getSelectedRecordsLabel();
                    if(_selected && Array.isArray(_selected)) {
                        _selected = _selected.join(", ");
                    }

                    this.segmentPreviewRef.current.setExcludedStores(_selected);
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
            _widgets.push(<div key={uuidv4()} style={{width: "66.6666%"}} className={`pharmarack-cms-view-column flex-remaining-width`}>{widget}</div>);
            
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
        
        if (_tabHandle == "segment_form_tab") {

            if (_tabItemHandle == "dynamic_segment_tab") {

                this.onFieldChange("segment_form_tab_geography", 1);
            
                const _holder = document.getElementById('segment_rules_container');
                const root = createRoot(_holder);

                this.segmentRuleContainer = React.createRef(); 
                const record = this.getCurrentSegmentRecord();
                if (record) {                
                    root.render(<SegmentRules ref={this.segmentRuleContainer} rules={record.rules} />);
                } else {
                    root.render(<SegmentRules ref={this.segmentRuleContainer} />);
                }

            }

            this.loadSegmentView();

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

        if (_handle === "segment_form") {
            const segment = this.getCurrentSegmentRecord();  
            if (segment && segment.segmentType == 2) {    
                _viewConfig.context_header.actions = [
                    { label: "Cancel", theme: "secondary", method: "cancel", action: "CANCEL_SEGMENT", classes: "icon-left", icon: "", tabindex : 8, status: true, shortcut: "" },                    
                    { label: "Delete Segment", theme: "danger", method: "delete", action: "DELETE_SEGMENT", classes: "icon-left", icon: "", tabindex : 8, status: true, shortcut: "" },                    
                ];                
            } else {
                _viewConfig.context_header.actions = [
                    { label: "Cancel", theme: "secondary", method: "cancel", action: "CANCEL_SEGMENT", classes: "icon-left", icon: "", tabindex : 8, status: true, shortcut: "" },
                    { label: "Delete", theme: "danger", method: "delete", action: "DELETE_SEGMENT", classes: "icon-left", icon: "", tabindex : 8, status: true, shortcut: "" },                    
                    { label: "Edit", theme: "primary", method: "post", action: "EDIT_SEGMENT", classes: "pharmarack-cms-segment-rule-edit-btn", icon: "", tabindex : 8, status: true, shortcut: "" },
                    { label: "", theme: "primary", method: "put", action: "BUILD_SEGMENT", classes: "pharmarack-cms-segment-rule-edit-btn", icon: "fa fa-gear", tabindex : 8, status: true, shortcut: "" },
                ];                
            }
        } else if (_handle === "segment_retailer_form") {
            const segment = this.getCurrentSegmentRecord();  
            if (segment && segment.segmentType == 2) {
                _viewConfig.content.rows[0].columns[0].view = "static_retailer_list_form";
            } else {
                _viewConfig.content.rows[0].columns[0].view = "dynamic_retailer_list_form";
            }
        }

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

        const record = this.getCurrentSegmentRecord();

        if (_handle == "new_segment_form") {
            
            const segmentTypeField = this.controller.getField("new_segment_form_segmentType");            
            if (record && segmentTypeField) {
                segmentTypeField.setVal(record.segmentType);
            }

        } else if (_handle == "segment_build_form") {

            const _statusHolder = document.getElementById('segment_build_status_widget');
            const statusRoot = createRoot(_statusHolder);

            this.geographySelectorRef = React.createRef();                
            statusRoot.render(<SegmentStatus ref={this.segmentStatusRef} segmentId={record._id} />);

            const _optionHolder = document.getElementById('segment_build_option_widget');
            const optionRoot = createRoot(_optionHolder);
            optionRoot.render(<SegmentAction ref={this.segmentActionRef} />);

        } else if (_handle == "segment_form") {

            const request = {};
            request["method"] = "GET";
            request["endpoint"] = "/segmentation/v1/segment/"+ record._id +"/summary";                

            this.controller.docker.dock(request).then((_res) => {                
                const _summaryHolder = document.getElementById('segment_summary');
                const summaryRoot = createRoot(_summaryHolder);
                summaryRoot.render(<table className="segment-summary-widget">
                    <tr>
                        <td><span>Retailers</span><span>{_res.retailer}</span></td>
                        <td><span>Whitelisted</span><span>{_res.whitelisted}</span></td>
                        <td><span>Blacklisted</span><span>{_res.balcklisted}</span></td>
                    </tr>
                </table>);                
            })
            .catch((e) => {
                this.controller.notify(e.message, "error");
            });

            
        }

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
            this.blacklistRetailerId = _record._id;            
            this.controller.getUserConfirm("BLACKLIST_RETAILER_RECORD", "Are you sure ?");            
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
            this.component.currentRecord = {};
            this.controller.switchView("new_segment_form");
        } else if (_action === "CANCEL_SEGMENT") {     
            this.component.currentRecord = {};       
            this.controller.switchView("main_view");
        } else if (_action === "SAVE_SEGMENT") {
            this.saveSegment();
        } else if (_action === "WHITELIST_RETAILER") {
            const newRetailerSelector = this.controller.getField("segment_retailer_form_add_retailers");
            if (newRetailerSelector) {
                newRetailerSelector.showPopup();
            }
        } else if (_action === "BLACKLIST_RETAILER") {

            const retailerGrid = this.controller.getField("retailer_grid");
            if (retailerGrid) {
                const checkedRecords = retailerGrid.getCheckedRecords();
                if (checkedRecords.length > 0) {
                    this.controller.getUserConfirm("BLACKLIST_RETAILER", "Are you sure ?");
                } else {
                    this.controller.notify("Select retailers to be blacklisted", "error");
                }
            }
            
        } else if (_action === "DELETE_SEGMENT") {
            this.controller.getUserConfirm("DELETE_SEGMENT", "Are you sure ?");
        } else if (_action == "EDIT_SEGMENT") {
            this.controller.switchView("new_segment_form");
        } else if (_action === "BUILD_SEGMENT") {            
            this.controller.switchView("segment_build_form");
        } else if (_action === "REMOVE_FROM_BLACKLIST") {            
            this.removeFromBlacklistedForSegment();
        } else if (_action === "REMOVE_FROM_WHITELIST") {            
            this.removeFromWhitelistedForSegment();
        } else if (_action === "START_BUILD_SEGMENT") {
            this.controller.getUserConfirm("START_BUILD_SEGMENT", "Are you sure ?", "This is a lengthy process, could take few mitues to many hours, and the existing retailer mapping will be wiped out.");
        } else if (_action === "HOUSE_KEEP_SEGMENT") {
            this.controller.getUserConfirm("HOUSE_KEEP_SEGMENT", "Are you sure ?", "This is will clear all the queues related  to all segment that is being build as well the retailer buffer");
        }

    };    

    this.onUserConfirm = (_task, _choice) => {

        if (_choice) {

            const request = {};
            const segment = this.getCurrentSegmentRecord();

            if (_task == "DELETE_SEGMENT") {

                if (segment) {
                    
                    request["method"] = "DELETE";
                    request["endpoint"] = "/segmentation/v1/segment/" + segment._id;                

                    this.controller.docker.dock(request).then((_res) => {
                        this.controller.notify(segment.title + " deleted successfully.!");
                        this.controller.switchView("main_view");
                        this.component.currentRecord = {};                
                    })
                    .catch((e) => {
                        this.controller.notify(e.message, "error");
                    });

                }

            } else if (_task == "BLACKLIST_RETAILER") {

                const retailerGrid = this.controller.getField("retailer_grid");
                if (retailerGrid) {
                    const checkedRecords = retailerGrid.getCheckedRecords();
                    if (checkedRecords.length > 0) {
                        const retailerIds = checkedRecords.map(record => record._id);
                        this.removeRetailersFromSegment(retailerIds);
                    } 
                }

            } else if (_task == "START_BUILD_SEGMENT") {

                request["method"] = "POST";
                request["endpoint"] = "/segmentation/v1/segment/" + segment._id +"/build"; 

                if (this.segmentActionRef.current) {
                    request["payload"] = this.segmentActionRef.current.getOptions();                    
                }

                this.controller.docker.dock(request).then((_res) => {
                    this.controller.notify(_res.message);  
                    /* Init the status refreshing timer */                                      
                    if (this.segmentStatusRef.current) {
                        this.segmentStatusRef.current.startRefreshingTimer();
                    }
                })
                .catch((e) => {
                    this.controller.notify(e.message, "error");
                });

            } else if (_task == "BLACKLIST_RETAILER_RECORD") {
                this.removeRetailersFromSegment([this.blacklistRetailerId]);
            } else if (_task == "HOUSE_KEEP_SEGMENT") {
                this.purgeSegmentBuilder();
            }

        }

    };

    this.purgeSegmentBuilder = () => {

        const request = {};
        request["method"] = "GET";
        request["endpoint"] = "/segmentation/v1/segment/houseKeep";                

        this.controller.docker.dock(request).then((_res) => {
            this.controller.notify("Segment builder is ready");            
        })
        .catch((e) => {
            this.controller.notify(e.message, "error");
        });

    };    

    this.onSegmentBuildCompleted = (_segmentId) => {
        const buildHistoryGrid = this.controller.getField("build_history_grid");
        if (buildHistoryGrid) {
            buildHistoryGrid.initFetch();
        }
    };

    this.removeFromWhitelistedForSegment = () => {

        const segment = this.getCurrentSegmentRecord();
        const retailerGrid = this.controller.getField("whitelist_retailer_grid");
        if (segment && retailerGrid) {
            const checkedRecords = retailerGrid.getCheckedRecords();
            if (checkedRecords.length > 0) {
                const retailerIds = checkedRecords.map(record => record._id);
                
                const request = {};
                request["method"] = "PUT";
                request["endpoint"] = "/segmentation/v1/segment/" + segment._id +"/removeWhitelistRetailers";
                request["payload"] = retailerIds;

                this.controller.docker.dock(request).then((_res) => {
                    this.controller.notify("Retailer(s) were removed successfully.!");
                    retailerGrid.initFetch();    
                })
                .catch((e) => {
                    this.controller.notify(e.message, "error");
                });

            } else {
                this.controller.notify("Select retailers to be un whitelisted", "error");
            }
        }

    };

    this.removeFromBlacklistedForSegment = () => {

        const segment = this.getCurrentSegmentRecord();
        const retailerGrid = this.controller.getField("blacklist_retailer_grid");
        if (segment && retailerGrid) {
            const checkedRecords = retailerGrid.getCheckedRecords();
            if (checkedRecords.length > 0) {
                const retailerIds = checkedRecords.map(record => record._id);
                
                const request = {};
                request["method"] = "PUT";
                request["endpoint"] = "/segmentation/v1/segment/" + segment._id +"/removeBlacklistRetailers";
                request["payload"] = retailerIds;

                this.controller.docker.dock(request).then((_res) => {
                    this.controller.notify("Retailer(s) were removed successfully.!");
                    retailerGrid.initFetch();    
                })
                .catch((e) => {
                    this.controller.notify(e.message, "error");
                });

            } else {
                this.controller.notify("Select retailers to be un blacklisted", "error");
            }
        }

    };



    this.removeRetailersFromSegment = (_retailersIds) => {

        const request = {};            
        const segment = this.getCurrentSegmentRecord();
        const retailerGrid = this.controller.getField("retailer_grid");

        if (segment) {
            
            request["method"] = "PUT";
            request["endpoint"] = "/segmentation/v1/segment/" + segment._id +"/blacklistRetailers";
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
        const segment = this.getCurrentSegmentRecord();

        if (segment) {
            /* It's an uppdate call */
            request["method"] = "PUT";
            request["endpoint"] = "/segmentation/v1/segment/" + segment._id;
        } else {
            /* It's a new record */
            request["method"] = "POST";
            request["endpoint"] = "/segmentation/v1/segment";
        }

        request["payload"] = null;
        const segmentType = this.controller.getField("new_segment_form_segmentType");

        if (segmentType) {
            
            const sType = segmentType.getVal();
            const segmentTab = this.controller.getField("segment_form_tab");            

            if (segmentTab) {                
                if (sType == 1) {

                    /* It is a dynamic segment */                    
                    const dynamicFields = this.prepareSegment(segmentTab.getFormFields());

                    if (dynamicFields) {
                        request["payload"] = dynamicFields;
                        request["payload"]["segmentType"] = sType;  
                        request["payload"]["segmentStatus"] = 2;
                    }

                } else {

                    /* It is is static segment */
                    request["payload"] = segmentTab.getFormFields();                                       
                    request["payload"]["segmentType"] = sType;
                    request["payload"]["segmentStatus"] = 1;

                    if (!request["payload"].title) {
                        this.controller.notify("Title is required", "error");
                        return false;
                    }

                }                
            }

        }

        if (request["payload"]) {

            /* Add segment handler */


            this.controller.docker.dock(request).then((_res) => {

                if (_res.status) {
                    this.controller.notify(((_res.payload ? _res.payload.title : _res.title )  + " saved successfully.!"));
                    this.controller.switchView("main_view");
                    this.component.currentRecord = {};
                } else {
                    this.controller.notify("Failed to save segment.!", "error");
                }

            })
            .catch((e) => {
                this.controller.notify(e.message, "error");
            });
        }

    };

    this.prepareSegment = (_segmentFields) => {

        if (!_segmentFields.title) {            
            this.controller.notify("Title is required", "error");
            return false;
        }

        if (!this.validateDates()) {
            return false;
        }

        if (this.geographySelectorRef.current) {

            console.log(this.geographySelectorRef.current.getSelectedRecords());

            if (_segmentFields.geography == 1) {
                _segmentFields["states"] = this.geographySelectorRef.current.getSelectedRecords();
                if (_segmentFields["states"] == "none") {
                    _segmentFields["states"] = null;
                }                        
            } else {
                _segmentFields["regions"] = this.geographySelectorRef.current.getSelectedRecords();
                if (_segmentFields["regions"] == "none") {
                    _segmentFields["regions"] = null;
                }                
            }            
        } else {
            this.controller.notify("Something went wrong - couldn't find the geography selector", "error");
            return false;
        }

        if (Array.isArray(_segmentFields.orderStatus)) {
            if (_segmentFields.orderStatus.length == 0) {
                _segmentFields.orderStatus = null;
            } else {
                _segmentFields.orderStatus = _segmentFields.orderStatus.map((item) => item.value);
            }
        } else {
            _segmentFields.orderStatus = null
        }

        if (this.segmentRuleContainer.current) {
            const segmentRules = this.segmentRuleContainer.current.getRules();
            if (!segmentRules || (Array.isArray(segmentRules) && segmentRules.length == 0)) {
                _segmentFields["rules"] = [];
            } else {
                _segmentFields["rules"] = segmentRules;
            }
        } else {
            this.controller.notify("Something went wrong - couldn't find the segment rules selector", "error");
            return false;
        }

        const fromField = this.controller.getField("segment_form_tab_fromDate");
        if (fromField) {
            const _fromDate = new Date(fromField.getVal());
            _fromDate.setHours(0, 0, 0, 0);
            _segmentFields["fromDate"] = _fromDate;
        }

        const toField = this.controller.getField("segment_form_tab_toDate");
        if (toField) {
            const _toDate = new Date(toField.getVal());
            _toDate.setHours(0, 0, 0, 0);
            _segmentFields["toDate"] = _toDate;
        }

        if (_segmentFields.companies == "none") { 
            _segmentFields.companies = null;
        }

        if (_segmentFields.excludedStores == "none") { 
            _segmentFields.excludedStores = null;
        }

        return _segmentFields;

    };

    this.loadSegmentView = () => {

        const record = this.getCurrentSegmentRecord();
        if (record) {

            const titleField = this.controller.getField("segment_form_tab_title");
            if (titleField) {
                titleField.setVal(record.title);
            }

            const descField = this.controller.getField("segment_form_tab_description");
            if (descField) {
                descField.setVal(record.description);
            }

            const fromDateField = this.controller.getField("segment_form_tab_fromDate");
            if (fromDateField && record.fromDate) {
                fromDateField.setVal(record.fromDate);
            }

            const toDateField = this.controller.getField("segment_form_tab_toDate");
            if (toDateField && record.toDate) {
                toDateField.setVal(record.toDate);
            }

            const geographyField = this.controller.getField("segment_form_tab_geography");
            if (geographyField && record.geography) {
                geographyField.setVal(record.geography);
            }

            const orderStatusField = this.controller.getField("segment_form_tab_orderStatus");
            if (orderStatusField && record.orderStatus) {
                orderStatusField.setChoices(record.orderStatus);                
            }

            const retailerStatusField = this.controller.getField("segment_form_tab_retailerStatus");
            if (retailerStatusField && record.retailerStatus) {
                retailerStatusField.setVal(record.retailerStatus);
            }

            const storeStatusField = this.controller.getField("segment_form_tab_storeStatus");
            if (storeStatusField && record.storeStatus) {
                storeStatusField.setVal(record.storeStatus);
            }

            if (this.segmentPreviewRef && this.segmentPreviewRef.current) {

                this.segmentPreviewRef.current.setSegmentTitle(record.title);                
                this.segmentPreviewRef.current.setSegmentDescription(record.description);
                this.segmentPreviewRef.current.setFromDate(record.fromDate);
                this.segmentPreviewRef.current.setToDate(record.toDate);                
                this.segmentPreviewRef.current.setGeographyType(record.geography == 1 ? "State" : "Region");                
                this.segmentPreviewRef.current.setRetailerStatus(record.retailerStatus == 1 ? "All" : "Authorized");
                this.segmentPreviewRef.current.setStoreStatus(record.storeStatus == 1 ? "All" : "Authorized");

            }

        }

    };

    this.getCurrentSegmentRecord = () => {
        let _grid = null;
        const _tab = this.component.tab["segment_tab"];

        if (_tab == "all_segment_tab") {
            _grid = "all_segment_grid";
        } else if (_tab == "dynamic_segment_tab") {
            _grid = "dynamic_segment_grid";
        } else if (_tab == "static_segment_tab") {
            _grid = "static_segment_grid";
        } else if (_tab == "in_progress_segment_tab") {
            _grid = "progress_segment_grid";
        } else {
            _grid = "disabled_segment_grid";
        }

        return this.component.currentRecord[_grid];
    };    

    this.validateDates = () => {

        const fromDateField = this.controller.getField("segment_form_tab_fromDate");
        const toDateField = this.controller.getField("segment_form_tab_toDate");

        if (fromDateField  && toDateField) {

            const sDate = new Date(fromDateField.getVal());
            const eDate = new Date(toDateField.getVal());        

            if (sDate && eDate) {

                sDate.setHours(0,0,0,0);
                eDate.setHours(0,0,0,0);

                if (eDate < sDate) {                   
                    window._controller.notify("To date should be greater than or equal to From date", "error");
                    return false;
                }

            }       

        }
       
        

        return true;

    };

};