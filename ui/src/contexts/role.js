import Capability from "../components/capability";

export default function RoleContext(_component) {

    this.component = _component;
    this.config = this.component.config;
    this.controller = window._controller;

    this.authPolicies = [];
    this.authTypes = [];

    /**
     * 
     * Context init handler, this is the place where everything get start ( context wise - not global wise ) 
     *
     **/
    this.init = () => {
        
        window._controller.docker.dock({
            method: "GET",
            endpoint: "/system/auth-policy-all"
        }).then((response) => {
            this.authPolicies = response;
        })
        .catch((e) => {
            console.log(e);
        });

        window._controller.docker.dock({
            method: "GET",
            endpoint: "/system/auth-type-all"
        }).then((response) => {
            this.authTypes = response;
        })
        .catch((e) => {
            console.log(e);
        });

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
        return _datasource;
    };

    /**
     * 
     * @param {*} _handle 
     * @param {*} _endpoint 
     * @returns 
     * 
     * Called before making request to server for fetching Current Record
     * 
     */
    this.onCurrentRecordRequest = (_handle, _endpoint) => {
        return _endpoint;
    };

    /**
     * 
     * @param {*} _handle 
     * @param {*} _endpoint 
     * @returns 
     * 
     * Called before making request to server - for select field
     * 
     */
    this.onSelectBoxRequest = (_handle, _endpoint) => {
        return _endpoint;
    };

    /**
     * 
     * @param {*} _handle 
     * 
     * Called after the select box component option's loaded (happens only remote config)
     * 
     */
    this.afterSelectBoxLoaded = (_handle) => {

    };

    /**
     * 
     * @param {*} _handle 
     * @param {*} _endpoint 
     * @returns 
     * 
     * Called before making request to server - for search field
     * 
     */
    this.onSearchBoxRequest = (_handle, _endpoint) => {
        return _endpoint;
    };
    
    /**
     * 
     * @param {*} _handle 
     * @param {*} _records 
     * 
     * Allows you to modify the records before loading into the datagrid
     * 
     */
    this.beforeLoadingDatagrid = (_handle, _records) => {        
        return _records;
    };

    /**
     * 
     * @param {*} _handle 
     * 
     * Called whenever any datagrid is loaded or reloaded
     * 
     */
    this.afterDataGridRecordLoaded = (_handle) => {

    };

    /**
     * 
     * @param {*} _handle 
     * 
     * Called whenever any multiselector loaded
     * 
     */
    this.onMultiSelectRecordLoaded = (_handle) => {

    };
    
    /**
     * 
     * @param {*} _e 
     * @param {*} _handle 
     * @param {*} _targetContext 
     * @param {*} _record 
     * 
     * Called whenever user click on the datagrid record (link type)
     * 
     */
    this.onRecordLinkClick = (_e, _handle, _targetContext, _record) => {

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

    };

    /**
     * 
     * @param {*} _e 
     * @param {*} _handle 
     * @param {*} _record 
     * 
     * Called whenever user click on chekbox of the record
     * 
     */
    this.onRecordChecked = (_e, _handle, _record) => {
        
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

        return true;
    };

    /**
     * 
     * @param {*} _handle 
     * @param {*} _status 
     * 
     * Called whenever toggle field change
     * 
     **/
    this.onToggleStatus = ( _handle, _status ) => {
        
    };

    /**
     * 
     * @param {*} _handle 
     * @param {*} _record 
     * 
     * Called whenever user selecteda record (or cleared) on Search Component
     * 
     */
    this.onSearchRecordSelected = (_handle, _record) => {

    };

    /**
     * 
     * @param {*} _handle 
     * @param {*} _target 
     * 
     * Called whenever a field or grid item got Focused 
     * 
     */
    this.onFieldInFocus = ( _handle, _target ) => {		
        
    };
    
    /**
     * 
     * @param {*} _handle 
     * @param {*} _target 
     * 
     * Called whenever a field or grid item goes out of focus 
     * 
     */
    this.onFieldOutFocus = ( _handle, _target ) => {
        
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
        
    };

    /**
     * 
     * @param {*} _handle 
     * @param {*} _target 
     * @param {*} _e 
     * 
     * Called whenever user click on any fields or grid cell 
     * 
     */
    this.onFieldClick = ( _handle, _target, _e ) => {
        
    };

    /**
     * 
     * @param {*} _handle 
     * @param {*} _target 
     * @param {*} _e 
     * 
     * Called whenever user double click on any fields or grid cell 
     * 
     */
    this.onFieldDblClick = ( _handle, _target, _e ) => {

    }

    /**
     * 
     * @param {*} _handle 
     * @param {*} _value 
     * @param {*} _e 
     * 
     * Called whenever user click pressing key on any fields or grid cell 
     * 
     */
    this.onFieldKeyUp = ( _handle, _value, _e ) => {
        
        if (_handle === "role_form_title") {
            let name = _value.replace(/\s+/g, '-').toLowerCase();
            this.controller.setInputFieldVal("role_form_handle", name);
        }

    };

    /**
     * 
     * @param {*} _handle 
     * @param {*} _value 
     * @param {*} _e 
     * 
     * Called whenever user pressing key on any fields or grid cell 
     * 
     */
    this.onFieldKeyDown = ( _handle, _value, _e ) => {
        
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

        let _widget = [];
        if (_section === "content" && this.component.currentRecord["role_grid"]) {           
            _widget.push(<Capability roleId={this.component.currentRecord["role_grid"]._id} />);
        }

        /* 'pos' could be 'before', 'after' or 'replace' */
        return { component: _widget, pos: "after" };

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
        let _widget = '';
        /* 'pos' could be 'before', 'after' or 'replace' */
        return { component: _widget, pos: "before" };
    };

    /**
     *      
     * @param {*} _tabHandle 
     * @param {*} _oldItemHandle 
     * @param {*} _newItemHandle 
     * 
     * Called before the tab item state change
     * 
     */
    this.beforeTabViewSwitch = ( _tabHandle, _oldItemHandle, _newItemHandle ) => {
        return true;
    }

    /**
     * 
     * @param {*} _tabHandle 
     * @param {*} _tabItemHandle 
     * 
     * Called whenever a Tab Item is go to visible state 
     * 
     */
    this.onTabViewMounted = ( _tabHandle, _tabItemHandle ) => {
        
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

        if (!_handle) {
            return _viewConfig;
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

    };

    /**
     * 
     * Called before the a view is reset
     * If you return false the reset action will be aborted
     * This call back is perfect place to show confirm box
     * 
     * @param {*} _handle 
     * @returns 
     * 
     */
    this.onResetView = (_handle) => {
        return true;
    };

    /**
     * 
     * Called before the a tab view is reset
     * If you return false the reset action will be aborted
     * This call back is perfect place to show confirm box
     * 
     * @param {*} _tabHanle 
     * @param {*} _itemHandle 
     * @returns 
     */
    this.onResetTabView = (_tabHanle, _itemHandle) => {
        return true;
    };

    /**
     * 
     * @param {*} _actions 
     * 
     * Used to call before showing the right click context menu
     * Chance to add extra context menu
     * 
     */    
    this.beforeContextMenu = (_actions) => {
        return _actions;
    };     
    
    /**
     * 
     * @param {*} _task 
     * @param {*} _choice 
     * 
     * Called whenever user clicked on an confirmation button
     * 
     */
    this.onUserConfirm = (_task, _choice) => {

    };

    /**
     * 
     * Called whenever a registered shortcut is pressed
     * 
     * @param {*} _combo 
     * 
     */
    this.onShortCut = (_combo) => {

    };

    /**
     * 
     * @param {*} _action 
     * 
     * This handler called for any ( context specific ) action button click events 
     * 
     */
    this.onActionBtnClick = (_action) => {

        if (_action === "NEW_ROLE") {
            this.component.currentRecord["role_grid"] = null;
            this.controller.switchView("role_form");
        } else if (_action === "CANCEL_ROLE") {     
            this.component.currentRecord["role_grid"] = null;       
            this.controller.switchView("main_view");
        } else if (_action === "SAVE_ROLE") {
            this.saveRole();
        }

    };

    /**
     * 
     * @param {*} _action 
     * 
     * This handler will be called whenever the user clickon the context menu (right click popup)
     * 
     */    
    this.onContextMenuClicked = (_action) => {
        
    };

    /**
     * 
     * @param {*} _target 
     * @param {*} _handle 
     * 
     * This handler will be called whenever media field is changed by the user
     * 
     */
    this.handleMediaChange = (_target, _handle) => {

    };

    /**
     * 
     * @param {*} _handle 
     * 
     * This handler will be called whenever user delete existing media
     * 
     */
    this.handleMediaDelete = (_handle) => {

    };

    this.saveRole = () => {

        const request = {};    
        const role = this.component.currentRecord["role_grid"];

        if (role) {
            /* It's an uppdate call */
            request["method"] = "PUT";
            request["endpoint"] = "/system/role/" + role._id;
        } else {
            /* It's a new record */
            request["method"] = "POST";
            request["endpoint"] = "/system/role";
        }

        const roleForm = this.controller.getField("role_form");
        if (roleForm) {

            request["payload"] = roleForm.getFormFields();   

            if (request["payload"] && Object.keys(request["payload"]).length > 0) {
                this.controller.dock(request, 
                    (_req, _res) => {     
                        this.controller.notify(_res.title + " saved successfully.!");
                        this.controller.switchView("main_view");
                        this.component.currentRecord["role_grid"] = null;
                    }, 
                    (_req, _res) => {
                        this.controller.notify(_res, "error");
                    }
                );
            }
        }

    };

};