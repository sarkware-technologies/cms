import React, { createRef } from "react";
import { createRoot } from 'react-dom/client';
import ImportAction from "../components/import-action";
import ProgressStatus from "../components/progress-status";

export default function ImporterContext(_component) {

    this.component = _component;
    this.config = this.component.config;
    this.controller = window._controller;
    this.statusField = createRef(null);
    this.taskOption = createRef(null);

    this.ImportType = Object.freeze({ 
        ORDER_IMPORTER          : "ORDER_IMPORTER",
        RETAILER_IMPORTER       : "RETAILER_IMPORTER",
        STORE_IMPORTER          : "STORE_IMPORTER"
    });

    /**
     * 
     * Context init handler, this is the place where everything get start ( context wise - not global wise ) 
     *
     **/
    this.init = (_view) => {
        this.controller.switchView(_view);
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
        const record = this.component.currentRecord["importer_grid"];

        if (record && _handle === "importer_history_grid") {

            if (record.type == this.ImportType.ORDER_IMPORTER) {
                datasource.endpoint = "/segmentation/v1/master_import/order/history"; 
            } else if (record.type == this.ImportType.RETAILER_IMPORTER) {
                datasource.endpoint = "/segmentation/v1/master_import/retailer/history"; 
            } else {
                datasource.endpoint = "/segmentation/v1/master_import/store/history"; 
            }

        }

        return datasource;

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

        if (_handle == "importer_form") {

            const record = this.component.currentRecord["importer_grid"];
            if (record) {
                if (record.status == "Free") {
                    _viewConfig.context_header.actions = [
                        { label: "Cancel", theme: "secondary", method: "cancel", action: "CANCEL", classes: "icon-left", icon: "", tabindex : 8, status: true, shortcut: "" }, 
                        { label: "Purge", theme: "danger", method: "delete", action: "PURGE", classes: "icon-left", icon: "", tabindex : 8, status: true, shortcut: "" },                   
                        { label: "Start", theme: "warning", method: "post", action: "START", classes: "icon-left", icon: "", tabindex : 8, status: true, shortcut: "" },                    
                    ]; 
                } else {
                    _viewConfig.context_header.actions = [
                        { label: "Cancel", theme: "secondary", method: "cancel", action: "CANCEL", classes: "icon-left", icon: "", tabindex : 8, status: true, shortcut: "" },                    
                        { label: "Stop", theme: "warning", method: "post", action: "STOP", classes: "icon-left", icon: "", tabindex : 8, status: true, shortcut: "" },                    
                    ]; 
                }                
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

        const record = this.component.currentRecord["importer_grid"];

        if (record && _handle == "importer_form") {

            const _statusHolder = document.getElementById('importer_status_widget');
            const statusRoot = createRoot(_statusHolder);

            let type = "";
            if (record.type == this.ImportType.ORDER_IMPORTER) {
                type = "order";
            } else if (record.type == this.ImportType.RETAILER_IMPORTER) {
                type = "retailer";
            } else {
                type = "store";
            }

            this.geographySelectorRef = React.createRef();                
            statusRoot.render(<ProgressStatus ref={this.statusField} task={record.type} endPoint={`/segmentation/v1/master_import/${type}/status`} />);

            const _optionHolder = document.getElementById('importer_option_widget');
            const optionRoot = createRoot(_optionHolder);
            optionRoot.render(<ImportAction ref={this.taskOption} />);

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

        if (_action === "START") {
            this.controller.getUserConfirm("START", "Are you sure ?");
        } else if (_action === "STOP") {
            this.controller.getUserConfirm("STOP", "Are you sure ?");
        } else if (_action === "PURGE") {

            const record = this.component.currentRecord["importer_grid"];
            if (record) {

                let masterType = "";
                if (record.type == this.ImportType.ORDER_IMPORTER) {
                    masterType = "Order";
                } else if (record.type == this.ImportType.RETAILER_IMPORTER) {
                    masterType = "Retailer";
                } else {
                    masterType = "Store";
                }
                this.controller.getUserConfirm("PURGE", "Are you sure ?", `This will wipeout all the document related to ${masterType} (master, importer logs and importer status)`);

            }
            
        }

    };

    /**
     * 
     * Called whenever user click on back button (or cancel button click)
     * 
     */
    this.onBackAction = () => {
        this.component.currentRecord["importer_grid"] = null;    
    };

    this.onUserConfirm = (_task, _choice) => {
        if (_choice) {
            if (_task == "START") {
                this.startImporter();
            } else if (_task == "STOP") {
                this.stopImporter();
            } else if (_task == "PURGE") {
                this.purgeMaster();
            } else {
                /* Unknown task */
            }
        }
    };

    /**
     * 
     * @param {*} _res
     * 
     * Called from Progress Status widget, whenever it receive latest status of the background task
     *  
     */
    this.onProgressStatus = (_task, _res) => {

        if (_res.status) {

            if (!_res.progressStatus.status) {
                /* This means the task is completed */

                let task = "";
                if (_task == this.ImportType.ORDER_IMPORTER) {
                    task = "Order";
                } else if (_task == this.ImportType.RETAILER_IMPORTER) {
                    task = "Retailer";
                } else {
                    task = "Store";
                }

                this.controller.notify(`${task} importer completed successfully`);

                /* Update the action bar */
                if (this.component.viewMode == "single") {
                    this.controller.loadContextActions([
                        { label: "Cancel", theme: "secondary", method: "cancel", action: "CANCEL", classes: "icon-left", icon: "", tabindex : 8, status: true, shortcut: "" },
                        { label: "Purge", theme: "danger", method: "delete", action: "PURGE", classes: "icon-left", icon: "", tabindex : 8, status: true, shortcut: "" },
                        { label: "Start", theme: "primary", method: "post", action: "START", classes: "icon-left", icon: "", tabindex : 8, status: true, shortcut: "" }
                    ]);
                } 
                
                /* Refresh the history data grid */
                const historyTable = this.controller.getField("importer_history_grid");
                if (historyTable) {
                    historyTable.initFetch();
                }

            }

        }

    };

    this.startImporter = () => {

        const request = {};    
        const record = this.component.currentRecord["importer_grid"];

        if (record) {

            request["method"] = "POST";
            if (record.type == this.ImportType.ORDER_IMPORTER) {
                request["endpoint"] = "/segmentation/v1/master_import/order/start";
            } else if (record.type == this.ImportType.RETAILER_IMPORTER) {
                request["endpoint"] = "/segmentation/v1/master_import/retailer/start";
            } else {
                request["endpoint"] = "/segmentation/v1/master_import/store/start";
            }

            if (this.taskOption.current) {
                request["payload"] = this.taskOption.current.getOptions();
                request["payload"]["batchType"] = record.type;
            }   
            
            this.controller.docker.dock(request).then((_res) => {

                this.controller.notify(("Importer process started successfully.!"));    
                
                /* Update the actions */
                this.controller.loadContextActions([
                    { label: "Cancel", theme: "secondary", method: "cancel", action: "CANCEL", classes: "icon-left", icon: "", tabindex : 8, status: true, shortcut: "" },
                    { label: "Stop", theme: "warning", method: "post", action: "STOP", classes: "icon-left", icon: "", tabindex : 8, status: true, shortcut: "" }
                ]);

                if (this.statusField) {
                    this.statusField.current.startRefresh();
                }
                
            })
            .catch((e) => {
                this.controller.notify(e.message, "error");
            });

        }

    };

    this.stopImporter = () => {

        const request = {};    
        const record = this.component.currentRecord["importer_grid"];

        if (record) {

            request["method"] = "GET";
            if (record.type == this.ImportType.ORDER_IMPORTER) {
                request["endpoint"] = "/segmentation/v1/master_import/order/stop";
            } else if (record.type == this.ImportType.RETAILER_IMPORTER) {
                request["endpoint"] = "/segmentation/v1/master_import/retailer/stop";
            } else {
                request["endpoint"] = "/segmentation/v1/master_import/store/stop";
            }

            this.controller.docker.dock(request).then((_res) => {
                this.controller.notify(("Importer process stopped successfully.!"));                    
            })
            .catch((e) => {
                this.controller.notify(e.message, "error");
            });

        }
        
    };

    this.purgeMaster = () => {

        const request = {};    
        const record = this.component.currentRecord["importer_grid"];

        if (record) {

            request["method"] = "GET";
            if (record.type == this.ImportType.ORDER_IMPORTER) {
                request["endpoint"] = "/segmentation/v1/master_import/order/purge";
            } else if (record.type == this.ImportType.RETAILER_IMPORTER) {
                request["endpoint"] = "/segmentation/v1/master_import/retailer/purge";
            } else {
                request["endpoint"] = "/segmentation/v1/master_import/store/purge";
            }

            this.controller.docker.dock(request).then((_res) => {
                this.controller.notify(("Purge completed successfully.!"));                    
            })
            .catch((e) => {
                this.controller.notify(e.message, "error");
            });

        }

    };

};