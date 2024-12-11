export default function XlsUploadContext(_component) {

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

        if (_action === "UPLOAD") {            
            this.processUpload();
        } else if (_action === "RESET") {
            
        }

    };

    this.processUpload = async () => {   

        const fileField = this.controller.getField("main_view_file");
        const _file = fileField.getElement().current;

        const file = _file.files[0];
        const formData = new FormData();
        formData.append('file', file);        

        try {
            const response = await this.controller.docker.upload("/system/offerUpload", formData);            
            if (response) {
                //console.log(response);
            }
        } catch (_e) {
            console.error(_e);
        }

    };

};