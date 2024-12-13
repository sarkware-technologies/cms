let offer_config = {

    routes: {
        main_view: ['/offer']        
    },
    views: {
        main_view: { 
            context: "offer",
            source: "",            
            viewFor: "",            
            context_header: {
                show: true,
                title: "Upload Company Offers",
                breadcrumb: "",
                actions: [
                    { label: "Upload", theme: "primary", action: "UPLOAD", classes: "icon-left", icon: "fa fa-upload", tabindex : 8, status: true, shortcut: "" }
                ]
            },           
            header: {
                show: false
            },
            content: {
                show: true,
                rows: [
                    {
                        seperator: false,
                        columns: [
                            {
                                title: "",
                                sub_title: "",
                                type: "fields",
                                width: "50%",
                                layout: "horizontal",
                                collapsible: false,
                                classes: "",
                                fields: [ 
                                    { type: "file", label: "Company Offer XLS", handle: "file", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "Please select Component XLS" }
                                ]
                            }
                        ]
                    } 
                ]
            },
            footer: {
                show: false
            },            
            manage: false
        }        
    }

};

export default offer_config;