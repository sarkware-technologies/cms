let service_config = {

    views: {
        main_view: { 
            context: "service",
            context_header: {
                show: true,
                title: "Services",
                breadcrumb: "",
                actions: [{ label: "New Service", theme: "primary", method: "post", action: "NEW_SERVICE", classes: "pharmarack-cms-action-new icon-left", icon: "fa fa-plus", tabindex : 8, status: true, shortcut: "" }]
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
                                    handle: "service_grid",        
                                    layout: "fluid",		
                                    height: "",
                                    header: true,
                                    content: true,
                                    footer: true,	
                                    grid_lines: true,								
                                    multi_select: false,
                                    full_row_select: false,
                                    is_main_grid: true,
                                    empty_message: "No service configured yet.!",
                                    datasource: {endpoint: "/system/v1/service", page: 0, populate: false, handler: "dedicated"},
                                    link: {key: "_id", context: "service", target_type: "view", view: "service_form", data: "remote", endpoint: "/system/v1/service/"},
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
                                            width: "85",
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
        service_form: {
            context: "service",
            context_header: {
                show: true,
                title: "Service",
                breadcrumb: "title",
                actions: [
                    { label: "Cancel", theme: "secondary", method: "cancel", action: "CANCEL_SERVICE", classes: "icon-left", icon: "fa fa-times", tabindex : 8, status: true, shortcut: "" },
                    { label: "Save", theme: "primary", method: "post", action: "SAVE_SERVICE", classes: "icon-left", icon: "fa fa-save", tabindex : 8, status: true, shortcut: "" }
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
                                    { type: "text", label: "Route", handle: "handle", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    { type: "textarea", label: "Description", handle: "description", value : "", placeholder: "", classes : "", mandatory : false, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" }
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
                                width: "50%",
                                layout: "horizontal",
                                tab: {
                                    title: "",                        
                                    handle: "service_tab",							                                    
                                    position: "top",                                    
                                    default_tab: "version_tab",
                                    tabview: true,
                                    type: "fluid",		
                                    width: "50%",                                    
                                    items: {
                                        version_tab: { 
                                            custom: false,                                                           
                                            icon: "far fa-code-fork",                                            
                                            title: "Versions",
                                            context: "service_version",					                                                                                
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
                                                                type: "datagrid",
                                                                width: "100%",
                                                                layout: "horizontal",
                                                                datagrid: {
                                                                    handle: "version_grid",        
                                                                    layout: "fluid",		
                                                                    height: "",
                                                                    header: true,
                                                                    content: true,
                                                                    footer: true,	
                                                                    grid_lines: true,								
                                                                    multi_select: false,
                                                                    full_row_select: false,
                                                                    is_main_grid: false,
                                                                    empty_message: "No version configured for this service.!",
                                                                    datasource: {endpoint: "/system/v1/service_version", page: 0, populate: false},
                                                                    link: {key: "_id", context: "service", target_type: "tab", tab: "service_tab", tab_item: "version_form_tab", data: "remote", endpoint: "/system/v1/service_version"},                                                                    
                                                                    columns: [
                                                                        {
                                                                            show: true, 
                                                                            width: "5", 
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: {title: "S.No", align: "center"}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "#", type: "serial", align: "center"},
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true, 
                                                                            width: "65", 
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: {title: "Version", align: "left", filterable: false, searchable: false}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "version", type: "link", align: "left"},
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true, 
                                                                            width: "15", 
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: {title: "Route", align: "left", filterable: false, searchable: false}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "route", type: "alphanumeric", align: "left"},
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true, 
                                                                            width: "15", 
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: {title: "Status", align: "right", filterable: false, searchable: false}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "status", type: "toggle", align: "right", label_key: "version", value_key: "_id"},
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
                                                show: true,
                                                align: "left",
                                                actions: [{ label: "New Version", theme: "primary", method: "post", action: "NEW_VERSION", classes: "icon-left", icon: "fa fa-plus", tabindex : 8, status: true, shortcut: "" }]
                                            }
                                        },
                                        module_tab: { 
                                            custom: false,                                                       
                                            icon: "fa fa-folder-gear",
                                            title: "Modules",
                                            context: "module",					                                                                         
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
                                                                    is_main_grid: false,
                                                                    empty_message: "No module mapped for this service.!",
                                                                    datasource: {endpoint: "/system/v1/module", page: 0, populate: false},
                                                                    link: {key: "_id", context: "service", target_type: "tab", tab: "service_tab", tab_item: "module_form_tab", data: "remote", endpoint: "/system/v1/module"},                                                                    
                                                                    columns: [
                                                                        {
                                                                            show: true, 
                                                                            width: "5", 
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: {title: "S.No", align: "center"}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "#", type: "serial", align: "center"},
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true, 
                                                                            width: "65", 
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: {title: "Module", align: "left", filterable: false, searchable: false}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "title", type: "link", align: "left"},
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true, 
                                                                            width: "15", 
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: {title: "Route", align: "left", filterable: false, searchable: false}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "handle", type: "alphanumeric", align: "left"},
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true, 
                                                                            width: "15", 
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
                                                show: true,
                                                align: "left",
                                                actions: [{ label: "New Module", theme: "primary", method: "post", action: "NEW_MODULE", classes: "icon-left", icon: "fa fa-plus", tabindex : 8, status: true, shortcut: "" }]
                                            }
                                        },
                                        module_form_tab: {  
                                            custom: true,                                                           
                                            icon: "far fa-server",
                                            title: "Module",
                                            context: "module",					                                            
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
                                                                width: "100%",
                                                                layout: "horizontal",
                                                                fields: [                                                                
                                                                    { type: "toggle", label: "Status", handle: "status", value : false, classes : "", mandatory : true, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", validation_message: "" },                                   
                                                                    { type: "text", label: "Title", handle: "title", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                                                    { type: "text", label: "Route", handle: "handle", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },                                                                    
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
                                                align: "left",
                                                actions: [                                                
                                                    { label: "Save Module", theme: "primary", method: "post", action: "SAVE_MODULE", classes: "icon-left", icon: "fa fa-save", tabindex : 8, status: true, shortcut: "" },
                                                    { label: "Cancel", theme: "secondary", method: "cancel", action: "CANCEL_MODULE", classes: "icon-left", icon: "fa fa-times", tabindex : 8, status: true, shortcut: "" },
                                                ]
                                            }
                                        },
                                        version_form_tab: {
                                            custom: true,
                                            icon: "far fa-server",
                                            title: "Version",
                                            context: "service_version",					                                            
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
                                                                width: "100%",
                                                                layout: "horizontal",
                                                                fields: [
                                                                    { type: "text", label: "Version", handle: "version", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                                                    { type: "text", label: "Route", handle: "route", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },                                                                
                                                                    { type: "search", label: "Host", handle: "host", value : "", placeholder: "Click to search for host", searchprompt: "Search for host",search_class: "", popup_class: "",mandatory: true, disabled: false, tabindex: 1, align: "right", label_width: 0, label_position: "top", validation_message: "", value_key: "_id", label_key: "name", datasource: {endpoint: "/system/v1/host", page: 0}}
                                                                ]
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        seperator: false,
                                                        columns: [
                                                            {
                                                                title: "",
                                                                sub_title: "",
                                                                type: "fields",
                                                                width: "16.88888%",
                                                                layout: "horizontal",
                                                                fields: [{ type: "toggle", label: "Status", handle: "status", value : false, classes : "", mandatory : true, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", validation_message: "" }]
                                                            },
                                                            {
                                                                title: "",
                                                                sub_title: "",
                                                                type: "fields",
                                                                width: "16.88888%",
                                                                layout: "horizontal",
                                                                fields: [{ type: "toggle", label: "To be deprecated", handle: "to_be_deprecated", value : false, classes : "", mandatory : false, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", validation_message: "" }]
                                                            },
                                                            {
                                                                title: "",
                                                                sub_title: "",
                                                                type: "fields",
                                                                width: "16.88888%",
                                                                layout: "horizontal",
                                                                fields: [{ type: "toggle", label: "Depricated", handle: "deprecated", value : false, classes : "", mandatory : true, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", validation_message: "" }]
                                                            }   
                                                        ]
                                                    },      
                                                    {
                                                        seperator: false,
                                                        columns: [
                                                            {
                                                                title: "",
                                                                sub_title: "",
                                                                type: "fields",
                                                                width: "100%",
                                                                layout: "horizontal",
                                                                fields: [                                                                                                                           
                                                                    { type: "textarea", label: "Offline Message", handle: "offline_message", value : "", placeholder: "", classes : "", mandatory : false, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                                                    { type: "textarea", label: "Deprecate Message", handle: "deprecate_message", value : "", placeholder: "", classes : "", mandatory : false, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" }
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                    
                                                ]
                                            },
                                            footer: {
                                                show: true,                                            
                                                align: "left",
                                                actions: [                                                
                                                    { label: "Save Version", theme: "primary", method: "post", action: "SAVE_VERSION", classes: "icon-left", icon: "fa fa-save", tabindex : 8, status: true, shortcut: "" },
                                                    { label: "Cancel", theme: "secondary", method: "cancel", action: "CANCEL_VERSION", classes: "icon-left", icon: "fa fa-times", tabindex : 8, status: true, shortcut: "" },
                                                ]
                                            }
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

export default service_config;