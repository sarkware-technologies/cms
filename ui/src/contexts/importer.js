import React from "react";
import { createRoot } from 'react-dom/client';
import ImportAction from "../components/import-action";
import ImportStatus from "../components/import-status";

export default function ImporterContext(_component) {

    this.component = _component;
    this.config = this.component.config;
    this.controller = window._controller;

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

            const record = this.component.currentRecord["importer_grid"];  console.log(record);
            if (record) {
                if (record.status == "Free") {
                    _viewConfig.context_header.actions = [
                        { label: "Cancel", theme: "secondary", method: "cancel", action: "CANCEL", classes: "icon-left", icon: "", tabindex : 8, status: true, shortcut: "" },                    
                        { label: "Start Importer", theme: "warning", method: "post", action: "START", classes: "icon-left", icon: "", tabindex : 8, status: true, shortcut: "" },                    
                    ]; 
                } else {
                    _viewConfig.context_header.actions = [
                        { label: "Cancel", theme: "secondary", method: "cancel", action: "CANCEL", classes: "icon-left", icon: "", tabindex : 8, status: true, shortcut: "" },                    
                        { label: "Stop Importer", theme: "warning", method: "post", action: "STOP", classes: "icon-left", icon: "", tabindex : 8, status: true, shortcut: "" },                    
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

            this.geographySelectorRef = React.createRef();                
            statusRoot.render(<ImportStatus importer={record.type} />);

            const _optionHolder = document.getElementById('importer_option_widget');
            const optionRoot = createRoot(_optionHolder);
            optionRoot.render(<ImportAction />);

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

        if (_action === "CANCEL") {     
            this.component.currentRecord["importer_grid"] = null;       
            this.controller.switchView("main_view");
        } else if (_action === "START") {
            this.startImporter();
        } else if (_action === "STOP") {
            this.stopImporter();
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

            this.controller.docker.dock(request).then((_res) => {
                this.controller.notify(("Importer process started successfully.!"));    
                
                /* Update the actions */
                this.controller.loadContextActions([
                    { label: "Cancel", theme: "secondary", method: "cancel", action: "CANCEL", classes: "icon-left", icon: "", tabindex : 8, status: true, shortcut: "" },
                    { label: "Stop Importer", theme: "warning", method: "post", action: "STOP", classes: "icon-left", icon: "", tabindex : 8, status: true, shortcut: "" }
                ]);
                
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

};