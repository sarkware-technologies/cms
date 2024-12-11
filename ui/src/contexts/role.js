import Capability from "../components/capability";
import Privilege from "../components/privilege";

export default function RoleContext(_component) {

    this.component = _component;
    this.config = this.component.config;
    this.controller = window._controller;

    this.authPolicies = [];
    this.authTypes = [];
    this.privilegeList = [];

    /**
     * 
     * Context init handler, this is the place where everything get start ( context wise - not global wise ) 
     *
     **/
    this.init = (_view) => {

        this.controller.docker.dock({
            method: "GET",
            endpoint: "/system/v1/auth_type/all"
        }).then((response) => {
            this.authTypes = response;
        })
        .catch((e) => {
            console.log(e);
        });

        this.controller.docker.dock({
            method: "GET",
            endpoint: "/system/v1/privilege/all"
        }).then((response) => {
            this.privilegeList = response;
        })
        .catch((e) => {
            console.log(e);
        });

        this.controller.switchView(_view);

    };  

    /**
     * 
     * @param {*} _handle 
     * 
     * Called after the select box component option's loaded (happens only remote config)
     * 
     */
    this.afterSelectBoxLoaded = (_handle) => {  console.log(_handle);

        if (_handle == "role_form_authType") {
            const authTypeSelect = this.controller.getField("role_form_authType");
            const currentRecord = this.component.currentRecord["role_grid"];  console.log(currentRecord);
            if (authTypeSelect && currentRecord) {
                authTypeSelect.setVal(currentRecord["authType"]);
            }
        }

    };

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
            let name = _value.replace(/\s+/g, '_').toLowerCase();
            this.controller.setInputFieldVal("role_form_handle", name);
        }

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
            _widget.push(<Privilege roleId={this.component.currentRecord["role_grid"]._id} privileges={this.privilegeList} />);      
            _widget.push(<Capability roleId={this.component.currentRecord["role_grid"]._id} />);
        }

        /* 'pos' could be 'before', 'after' or 'replace' */
        return { component: _widget, pos: "after" };

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
        if (_action === "SAVE_ROLE") {
            this.saveRole();
        }
    };

    /**
     * 
     * Called whenever user click on back button (or cancel button click)
     * 
     */
    this.onBackAction = () => {
        this.component.currentRecord["role_grid"] = null;    
    };

    this.saveRole = () => {

        const request = {};    
        const role = this.component.currentRecord["role_grid"];

        if (role) {
            /* It's an uppdate call */
            request["method"] = "PUT";
            request["endpoint"] = "/system/v1/role/" + role._id;
        } else {
            /* It's a new record */
            request["method"] = "POST";
            request["endpoint"] = "/system/v1/role";
        }

        const roleForm = this.controller.getField("role_form");
        if (roleForm) {

            request["payload"] = roleForm.getFormFields();   

            if (request["payload"] && Object.keys(request["payload"]).length > 0) {

                this.controller.docker.dock(request).then((_res) => {
                    
                    if (request["method"] == "POST") {
                        this.controller.notify(_res.payload.title + " saved successfully.!");
                    } else {
                        this.controller.notify(_res.title + " updated successfully.!");
                    }                   
                    this.component.triggerBack();

                })
                .catch((e) => {
                    this.controller.notify(e.message, "error");
                });

            }
        }

    };

};