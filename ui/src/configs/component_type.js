let component_type_config = {

    routes: {
        main_view: ['/component_type'],
        component_type_form: ['/component_type/new', '/component_type/:id']
    },
    views: {
        main_view: { 
            context: "component_type",
            source: "",             
            viewFor: "",           
            context_header: {
                show: true,
                title: "Component Types",
                breadcrumb: "",
                actions: [{ type: "link", label: "New Component Type", theme: "primary", method: "post", action: "/component_type/new", classes: "pharmarack-cms-action-new icon-left", icon: "fa fa-plus", tabindex : 8, status: true, shortcut: "" }]
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
                                    handle: "component_type_grid",        
                                    layout: "fluid",		
                                    height: "",
                                    header: true,
                                    content: true,
                                    footer: true,	
                                    grid_lines: true,								
                                    multi_select: false,
                                    full_row_select: false,
                                    is_main_grid: true,
                                    empty_message: "No component types found.!",
                                    datasource: {endpoint: "/system/v1/api/component/component_type/list", page: 0, populate: false, handler: "default"},
                                    link: {key: "_id", context: "component_type", target_type: "view", view: "component_type_form", data: "remote", endpoint: "/component_type/"},
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
        component_type_form: {
            context: "component_type", 
            source: "/system/v1/api/component/component_type/record?id=",            
            viewFor: "component_type_grid",            
            context_header: {
                show: true,
                title: "Component Type",
                breadcrumb: "title",
                actions: [
                    { type: "button", label: "Cancel", theme: "secondary", method: "cancel", action: "BACK", classes: "icon-left", icon: "fa fa-times", tabindex : 8, status: true, shortcut: "" },
                    { type: "button", label: "Save", theme: "primary", method: "post", action: "SAVE_COMPONENT_TYPE", classes: "icon-left", icon: "fa fa-save", tabindex : 8, status: true, shortcut: "" }
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

export default component_type_config;