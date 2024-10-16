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

                this.controller.docker.dock(request).then((_res) => {
                    this.controller.notify(_res.title + " saved successfully.!");
                    this.controller.switchView("main_view");
                    this.component.currentRecord["role_grid"] = null;
                })
                .catch((e) => {
                    this.controller.notify(e.message, "error");
                });

            }
        }

    };

};