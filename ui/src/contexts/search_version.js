import { createRoot } from 'react-dom/client';
import VersionResult from '../components/version-result';

export default function SearchVersionContext(_component) {

    this.component = _component;
    this.config = this.component.config;
    this.controller = window._controller;

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
     * @param {*} _id 
     * @param {*} _status 
     * 
     * Called whenever toggle field change (in datagrid)
     * This option assumes that it will always be the status field
     * So it will automatically update the record in db as well, unless you return false
     * 
     */
    this.onRecordToggleStatus = (_handle, _toggleHandle, _record, _status) => {

        if (_handle == "version_grid") {

            const versionGrid = this.controller.getField("version_grid");
            if (versionGrid) {

                const page = versionGrid.getCurrentPage();
                const searchObj = versionGrid.getCurrentSearch();

                const  shouldEnable = _status ? 1 : 0;
                let endPoint = "/system/v1/search_version/retailer?page="+ page +"&enableMdmSearch="+ (shouldEnable) +"&retailerId="+ _record.RetailerId;
                
                if (searchObj) {
                    endPoint += "&field="+ searchObj.field +"&search="+ searchObj.search;
                }

                const request = {
                    method: "PUT",
                    endpoint: endPoint
                }

                this.controller.docker.dock(request).then((_res) => {
                    versionGrid.loadRecords(_res.payload, _res.totalPages, _res.recordPerPage, _res.currentPage);
                    const statusLabel = _status ? " Enabled" : " Disabled";                    
                    this.controller.notify("Mdm based search "+ statusLabel +" for "+ _record.RetailerName);
                })
                .catch((e) => {
                    this.controller.notify(e.message, "error");
                });

            }

        } else if (_handle == "region_grid") {

            const regionGrid = this.controller.getField("region_grid");
            if (regionGrid) {

                const page = regionGrid.getCurrentPage();
                const searchObj = regionGrid.getCurrentSearch();

                const shouldEnable = _status ? 1 : 0;
                let endPoint = "/system/v1/search_version/regions?page="+ page +"&enableMdmSearch="+ (shouldEnable) +"&regionId="+ _record.RegionId;

                if (searchObj) {
                    endPoint += "&field="+ searchObj.field +"&search="+ searchObj.search;
                }

                const request = {
                    method: "PUT",
                    endpoint: endPoint
                }

                this.controller.docker.dock(request).then((_res) => {
                    regionGrid.loadRecords(_res.payload, _res.totalPages, _res.recordPerPage, _res.currentPage);
                    const statusLabel = _status ? " Enabled" : " Disabled";
                    this.controller.notify("Mdm based search "+ statusLabel +" for "+ _record.RegionName);
                })
                .catch((e) => {
                    this.controller.notify(e.message, "error");
                });

            }

        }

        return false;
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
     * @param {*} _action 
     * 
     * This handler called for any ( context specific ) action button click events 
     * 
     */
    this.onActionBtnClick = (_action) => {

        if (_action === "REGION_UPDATE") {            
            this.controller.switchView("region_update_form");
        } else if (_action ===  "CANCEL_BULK") {
            this.controller.switchView("main_view");
        } else if (_action ===  "BULK_UPDATE") {
            this.controller.switchView("bulk_update_form");
        } else if (_action ===  "ENABLE") {
            this.processUpload(1);
        } else if (_action ===  "DISABLE") {
            this.processUpload(0);
        } else if (_action === "REFRESH") {
            const regionGrid = this.controller.getField("region_grid");
            if (regionGrid) {
                regionGrid.reloadRecords();
            }
        }

    };

    this.processUpload = async (_version) => {   
       
        try {            

            let _users = [];
            const csvField = this.controller.getField("bulk_update_form_csv");
            const csv = csvField.getVal();
            
            if (csv.indexOf(",") !== -1) {
                _users = csv.split(",");
            } else {
                _users = csv.split("\n");
            }

            const request = {
                method: "POST",
                endpoint: "/system/v1/search_version/upload",
                payload: {
                    version: _version,
                    users: _users
                }
            }

            this.controller.docker.dock(request).then((_res) => {
                this.renderResult(_res);
            })
            .catch((e) => {
                this.controller.notify("Failed to set version", "error");
            });

        } catch (_e) {
            console.error(_e);            
        }

    };    

    this.renderResult = (_result) => {

        const _holder = document.getElementById('version_update_placeholder');
        const root = createRoot(_holder);

        root.render(<VersionResult results={_result} />);

    };

};