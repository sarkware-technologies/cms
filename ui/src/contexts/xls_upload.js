import { v4 as uuidv4 } from 'uuid';
import UploadComponent from '../components/upload-component';

export default function XlsUploadContext(_component) {

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
     * @param {*} _e 
     * @param {*} _handle 
     * @param {*} _targetContext 
     * @param {*} _record 
     * 
     * Called whenever user click on the datagrid record (link type)
     * 
     */
    this.onRecordLinkClick = (_e, _handle, _targetContext, _record) => { 

        if (_targetContext === "component") {
            document.location.href = (`/${_targetContext}?id=${_record.component._id}`);
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

        if (_section === "footer" && this.component.currentRecord["upload_grid"]) {
            //_widgets.push(<FieldEditor key={uuidv4()} record={this.component.currentRecord["upload_grid"]} />);            
        }

        /* 'pos' could be 'before', 'after' or 'replace' */
        return { component: _widgets, pos: "before" };

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
        const upload = this.component.currentRecord["upload_grid"]
        if (_section == "content" && upload) {
            _widgets.push( <UploadComponent record={upload} /> );
            return { component: _widgets, pos: "replace" };
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

        const upload = this.component.currentRecord["upload_grid"];
        if (_handle == "upload_form" && upload) {

            /* This means we are in edit mode - so remove the Upload Button */
            const config = JSON.parse(JSON.stringify(_viewConfig));
            config.context_header.actions.splice(1, 1);            
            config.footer.show=true;
            return config;            

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

        if (_action === "NEW_UPLOAD") {            
            this.component.currentRecord["upload_grid"] = null;
            this.controller.switchView("upload_form");
        } else if (_action === "CANCEL_UPLOAD") {
            this.component.currentRecord["upload_grid"] = null;               
            this.controller.switchView("main_view");
        } else if (_action === "PROCESS_UPLOAD") {
            this.processUpload();
        }

    };

    this.processUpload = async () => {

        const request = {};    
        const entity = this.component.currentRecord["upload_grid"];

        if (entity) {
            /* It's an uppdate call */
            request["method"] = "PUT";
            request["endpoint"] = "/system/upload/" + entity._id;
        } else {
            /* It's a new record */
            request["method"] = "POST";
            request["endpoint"] = "/system/upload";
        }

        const fileField = this.controller.getField("upload_form_file");
        const _file = fileField.getElement().current;

        const file = _file.files[0];
        const formData = new FormData();
        formData.append('file', file);        

        try {
            const response = await this.controller.docker.upload("/system/upload", formData);
            this.component.currentRecord["upload_grid"] = null;               
            this.controller.switchView("main_view");
            if (response) {
                //console.log(response);
            }
        } catch (_e) {
            console.error(_e);
        }

    };

};