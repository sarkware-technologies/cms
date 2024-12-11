let module_config = {

    views: {
        main_view: {
            source: "",
            context: "module", 
            viewFor: "",
            match: ["/module"],
            context_header: {
                show: true,
                title: "Modules",
                breadcrumb: "",
                actions: [{ type: "link", label: "New Module", theme: "primary", method: "post", action: "/main/module/new", classes: "pharmarack-cms-action-new icon-left", icon: "fa fa-plus", tabindex : 8, status: true, shortcut: "" }]
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
                                    handle: "module_grid",        
                                    layout: "fluid",		
                                    height: "",
                                    header: true,
                                    content: true,
                                    footer: true,	
                                    grid_lines: true,								
                                    multi_select: false,
                                    full_row_select: false,
                                    is_main_grid: true,
                                    empty_message: "No module configured yet.!",
                                    datasource: {endpoint: "/system/v1/module?populate=true", page: 0, populate: false, handler: "dedicated"},
                                    link: {key: "_id", context: "module", target_type: "view", view: "module_form", data: "remote", endpoint: "/main/module/"},
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
                                            width: "30",
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
                                            width: "30",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Handle", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "handle", type: "alphanumeric", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "25",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Service", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "service", type: "search", label_key: "title", value_key: "_id"},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "10", 
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Status", align: "right"}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "status", type: "toggle", align: "right", label_key: "title", value_key: "_id"},
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
        module_form: {
            source: "/system/v1/module/",
            context: "module",
            viewFor: "module_grid",
            match: ["/module/new", "/module/:id"],
            context_header: {
                show: true,
                title: "Module",
                breadcrumb: "title",
                actions: [
                    { label: "Cancel", theme: "secondary", method: "cancel", action: "BACK", classes: "icon-left", icon: "fa fa-times", tabindex : 8, status: true, shortcut: "" },
                    { label: "Save", theme: "primary", method: "post", action: "SAVE_MODULE", classes: "icon-left", icon: "fa fa-save", tabindex : 8, status: true, shortcut: "" }
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
                                    { type: "toggle", label: "Status", handle: "status", value : false, classes : "", mandatory : true, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", validation_message: "" },                                   
                                    { type: "text", label: "Title", handle: "title", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    { type: "text", label: "Handle", handle: "handle", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    { type: "select", label: "Service", handle: "service", value : "1", value_key: "_id", label_key: "title", options: [], placeholder: "-- Select Service --", classes : "", mandatory : true, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", prompt_message: "", validation_message: "", source: "remote", endpoint: "/system/v1/service/all" },
                                    { type: "textarea", label: "Description", handle: "description", value : "", placeholder: "", classes : "", mandatory : false, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    { type: "textarea", label: "Offline Message", handle: "offline_message", value : "", placeholder: "", classes : "", mandatory : false, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" }
                                ]
                            }
                        ]
                    } 
                ]
            },
            footer: {
                show: true,
                rows: [
                    {
                        seperator: false,
                        columns: [
                            {
                                title: "",
                                sub_title: "",
                                type: "tab",
                                width: "100%",
                                layout: "horizontal",
                                tab: {
                                    title: "",                        
                                    handle: "module_tab",							                                    
                                    position: "top",                                    
                                    default_tab: "entity_item_tab",
                                    tabview: true,
                                    type: "fluid",		
                                    width: "50%",                                    
                                    items: {
                                        entity_item_tab: {
                                            custom: false,                                                           
                                            icon: "far fa-code-fork",                                            
                                            title: "Entities",
                                            context: "module",					                                                                                
                                            header: {show: false},                    
                                            content: {
                                                show: true,
                                                rows: [
                                                    {
                                                        seperator: false,
                                                        columns: [
                                                            {
                                                                title: "",
                                                                sub_title: "",
                                                                type: "placeholder",
                                                                width: "100%",
                                                                layout: "horizontal",
                                                                collapsible: false,
                                                                classes: "",
                                                                placeholder: "entity_mapper_container"
                                                            }
                                                        ]
                                                    },
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
                                                                    handle: "module_entity_grid",        
                                                                    layout: "fluid",		
                                                                    height: "",
                                                                    header: true,
                                                                    content: true,
                                                                    footer: true,	
                                                                    grid_lines: true,								
                                                                    multi_select: false,
                                                                    full_row_select: false,
                                                                    is_main_grid: true,
                                                                    empty_message: "No module configured yet.!",
                                                                    datasource: {endpoint: "/system/v1/module/:id/entities", page: 0, populate: false, handler: "dedicated"},
                                                                    link: {key: "_id", context: "module", target_type: "view", view: "module_form", data: "remote", endpoint: "/system/v1/module/"},
                                                                    columns: [
                                                                        {
                                                                            show: true, 
                                                                            width: "10", 
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
                                                                            width: "45",
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: {title: "Entity", align: "left", filterable: false, searchable: true, sortable: false}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "entity", type: "search", label_key: "title", value_key: "_id"},
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true, 
                                                                            width: "15", 
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: {title: "Exposed", align: "right"}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "exposed", type: "toggle", align: "right", label_key: "title", value_key: "_id"},
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true, 
                                                                            width: "15", 
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: {title: "Has Form", align: "right"}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "has_form", type: "toggle", align: "right", label_key: "title", value_key: "_id"},
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true, 
                                                                            width: "15",
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: {title: "", align: "center", filterable: false, searchable: false, sortable: false}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "", type: "button", label: "", action: "DELETE_MAPPING", align: "right", icon: "fa fa-trash", classes: "danger"},
                                                                            prompt: ""
                                                                        }                                  
                                                                    ]
                                                                }
                                                            }
                                                        ]
                                                    }
                                                ]
                                            },
                                            footer: {show: false}
                                        },
                                        setting_item_tab: {
                                            custom: false,                                                           
                                            icon: "far fa-code-fork",                                            
                                            title: "Settings",
                                            context: "module",					                                                                                
                                            header: {show: false},                    
                                            content: {show: false},
                                            footer: {show: false}
                                        }
                                    }
                                }
                            }
                        ]
                    }
                ]
            },
            sidebar: null,
            manage: true 
        }
        
    },
    enums: {}

};

export default module_config;