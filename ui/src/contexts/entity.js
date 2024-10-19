import FieldEditor from "../components/factory/fields/field-editor";
import { v4 as uuidv4 } from 'uuid';

export default function EntityContext(_component) {

    this.component = _component;
    this.config = this.component.config;
    this.controller = window._controller;

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
     * @param {*} _value 
     * @param {*} _e 
     * 
     * Called whenever user click pressing key on any fields or grid cell 
     * 
     */
    this.onFieldKeyUp = ( _handle, _value, _e ) => {
        
        if (_handle === "entity_form_title") {
            let name = _value.replace(/\s+/g, '_').toLowerCase();
            this.controller.setInputFieldVal("entity_form_handle", name);
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
        let _widgets = [];

        if (_section === "footer" && this.component.currentRecord["entity_grid"]) {
            _widgets.push(<FieldEditor key={uuidv4()} record={this.component.currentRecord["entity_grid"]} />);            
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

        if (!_handle) {
            return _viewConfig;
        }

        const entity = this.component.currentRecord["entity_grid"];
        if (!entity) {
            _viewConfig.sidebar = null;            
        }

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

        if (_action === "NEW_ENTITY") {            
            this.component.currentRecord["entity_grid"] = null;
            this.controller.switchView("entity_form");
        } else if (_action === "CANCEL_ENTITY") {               
            this.controller.switchView("main_view");
        } else if (_action === "SAVE_ENTITY") {
            this.saveEntity();
        }

    };    

    this.saveEntity = () => {

        const request = {};    
        const entity = this.component.currentRecord["entity_grid"];

        if (entity) {
            /* It's an uppdate call */
            request["method"] = "PUT";
            request["endpoint"] = "/system/entity/" + entity._id;
        } else {
            /* It's a new record */
            request["method"] = "POST";
            request["endpoint"] = "/system/entity";
        }

        const entityForm = this.controller.getField("entity_form");
        if (entityForm) {
            request["payload"] = entityForm.getFormFields();   
            if (request["payload"] && Object.keys(request["payload"]).length > 0) {

                this.controller.docker.dock(request).then((_res) => {
                    this.controller.notify(_res.title + " saved successfully.!");
                    this.controller.switchView("main_view");
                    this.component.currentRecord["entity_grid"] = null;
                })
                .catch((e) => {
                    this.controller.notify(_res, "error");
                }); 

            }
        }

    };

};