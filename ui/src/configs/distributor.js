let distributor_config = {

    routes: {
        main_view: ['/distributor'],
        distributor_form: ["/distributor/new", "/distributor/:id"]
    },
    views: {
        main_view: { 
            context: "distributor", 
            source: "",            
            viewFor: "",            
            context_header: {
                show: true,
                title: "Distributor",
                breadcrumb: "",
                actions: [{ label: "New Distributor", theme: "primary", action: "NEW_DISTRIBUTOR", classes: "pharmarack-cms-action-new icon-left", icon: "fa fa-plus", tabindex : 8, status: true, shortcut: "" }]
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
                                type: "datagrid",
                                width: "100%",
                                layout: "horizontal",
                                collapsible: false,
                                datagrid: {
                                    handle: "distributor_grid",        
                                    layout: "fluid",		
                                    height: "",
                                    header: true,
                                    content: true,
                                    footer: true,	
                                    grid_lines: true,								
                                    multi_select: false,
                                    full_row_select: false,
                                    is_main_grid: true,
                                    empty_message: "No distributor configured yet.!",
                                    datasource: {endpoint: "/system/v1/api/master/distributor/list", page: 0, populate: false, handler: "default"},
                                    link: {key: "_id", context: "distributor", target_type: "view", view: "distributor_form", data: "remote", endpoint: "/distributor/"},
                                    columns: [
                                        {
                                            show: true, 
                                            width: "5", 
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "S.No", align: "left"}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "#", type: "serial", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "50",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Title", align: "left", filterable: false, searchable: true, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "title", type: "link", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "45", 
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Handle", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "handle", type: "alphanumeric", align: "left", editable: false},
                                            prompt: ""
                                        }                                  
                                    ]
                                }
                            }
                        ]
                    }
                ]
            },
            footer: {
                show: false
            },
            sidebar: null,
            manage: true             
        },
        distributor_form: {
            context: "distributor", 
            source: "/system/v1/api/master/distributor/record?id=",            
            viewFor: "distributor_grid",            
            context_header: {
                show: true,
                title: "Distributor",
                breadcrumb: "title",
                actions: [
                    { label: "Cancel", theme: "secondary", action: "CANCEL_DISTRIBUTOR", classes: "icon-left", icon: "fa fa-times", tabindex : 8, status: true, shortcut: "" },
                    { label: "Save", theme: "primary", action: "SAVE_DISTRIBUTOR", classes: "icon-left", icon: "fa fa-save", tabindex : 8, status: true, shortcut: "" }
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
                                width: "35%",
                                layout: "horizontal",
                                collapsible: false,
                                classes: "",
                                fields: [                                    
                                    { type: "text", label: "Title", handle: "title", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    { type: "text", label: "Handle", handle: "handle", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    { type: "text", label: "Icon", handle: "icon", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    { type: "toggle", label: "Is Child Item", handle: "is_child", value : false, classes : "", mandatory : true, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", validation_message: "" }
                                ]
                            },
                            {
                                title: "",
                                sub_title: "",
                                type: "fields",
                                width: "65%",
                                layout: "horizontal",
                                classes: "",
                                fields: [                                                                        
                                    { type: "textarea", label: "Configuration", handle: "configuration", value : "", placeholder: "", classes : "pharmarack-cms-component-type-config", mandatory : false, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" }
                                ]
                            }
                        ]
                    }      
                ]
            },
            footer: {
                show: true,
                rows: []
            },
            sidebar: null,
            manage: true 
        }
        
    }

};

export default distributor_config;