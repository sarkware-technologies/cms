let service_config = {

    views: {
        main_view: { 
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
                                    datasource: {endpoint: "/system/services", page: 0, populate: false, handler: "dedicated"},
                                    link: {key: "_id", context: "service", target_type: "view", view: "service_form", data: "remote", endpoint: "/system/service/"},
                                    columns: [
                                        {
                                            show: true, 
                                            width: "5", 
                                            search: false,
                                            filter: false,
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
                                            header: {title: "Status", align: "right"}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "status", type: "toggle", align: "right", key_field: "_id", title_key: "title"},
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
                                    { type: "text", label: "Handle", handle: "handle", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
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
                                                                    datasource: {endpoint: "/system/versions", page: 0, populate: false},
                                                                    link: {key: "version", context: "service", view: "version_form"},
                                                                    columns: [
                                                                        {
                                                                            show: true, 
                                                                            width: "5", 
                                                                            header: {title: "S.No", align: "center"}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "#", type: "serial", align: "center"},
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true, 
                                                                            width: "65", 
                                                                            header: {title: "Version", align: "left", filterable: false, searchable: false}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "version", type: "link", align: "left"},
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true, 
                                                                            width: "15", 
                                                                            header: {title: "Route", align: "left", filterable: false, searchable: false}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "route", type: "alphanumeric", align: "left"},
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true, 
                                                                            width: "15", 
                                                                            header: {title: "Status", align: "right", filterable: false, searchable: false}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "status", type: "toggle", align: "right", key_field: "_id", title_key: "version"},
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
                                                actions: [{ label: "New Version", theme: "primary", action: "NEW_VERSION", classes: "icon-left", icon: "fa fa-plus", tabindex : 8, status: true, shortcut: "" }]
                                            }
                                        },
                                        module_tab: { 
                                            custom: false,                                                       
                                            icon: "fa fa-folder-gear",
                                            title: "Modules",					                                                                         
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
                                                                    datasource: {endpoint: "/system/modules", page: 0, populate: false},
                                                                    link: {key: "name", context: "service", view: "module_form"},
                                                                    columns: [
                                                                        {
                                                                            show: true, 
                                                                            width: "5", 
                                                                            header: {title: "S.No", align: "center"}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "#", type: "serial", align: "center"},
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true, 
                                                                            width: "65", 
                                                                            header: {title: "Module", align: "left", filterable: false, searchable: false}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "title", type: "link", align: "left"},
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true, 
                                                                            width: "15", 
                                                                            header: {title: "Route", align: "left", filterable: false, searchable: false}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "handle", type: "alphanumeric", align: "left"},
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true, 
                                                                            width: "15", 
                                                                            header: {title: "Status", align: "right"}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "status", type: "toggle", align: "right", key_field: "_id", title_key: "name"},
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
                                                actions: [{ label: "New Module", theme: "primary", action: "NEW_MODULE", classes: "icon-left", icon: "fa fa-plus", tabindex : 8, status: true, shortcut: "" }]
                                            }
                                        },
                                        feature_form_tab: {  
                                            custom: true,                                                           
                                            icon: "far fa-server",
                                            title: "Feature",					                                            
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
                                                                    { type: "text", label: "Name", handle: "feature_name", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                                                    { type: "text", label: "Handle", handle: "feature_handle", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },                                                                
                                                                    { type: "number", label: "Price", handle: "feature_price", value : "", placeholder: "", classes : "", mandatory : false, min: "", max: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                                                    { type: "select", label: "Package", handle: "feature_package", value : "1", value_key: "value", label_key: "label", options: [{label: "Free", value: "1", selected: true, disabled: false},{label: "Weekly", value: "2", selected: false, disabled: false},{label: "Monthly", value: "3", selected: false, disabled: false},{label: "Yearly", value: "4", selected: false, disabled: false},{label: "Transaction", value: "5", selected: false, disabled: false}], classes : "", mandatory : false, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", prompt_message: "", validation_message: "" }                                                                
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
                                                                fields: [{ type: "toggle", label: "Status", handle: "feature_status", value : false, classes : "", mandatory : true, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", validation_message: "" }]
                                                            },
                                                            {
                                                                title: "",
                                                                sub_title: "",
                                                                type: "fields",
                                                                width: "16.88888%",
                                                                layout: "horizontal",
                                                                fields: [{ type: "toggle", label: "To be deprecated", handle: "feature_to_be_deprecated", value : false, classes : "", mandatory : false, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", validation_message: "" }]
                                                            },
                                                            {
                                                                title: "",
                                                                sub_title: "",
                                                                type: "fields",
                                                                width: "16.88888%",
                                                                layout: "horizontal",
                                                                fields: [{ type: "toggle", label: "Depricated", handle: "feature_deprecated", value : false, classes : "", mandatory : false, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", validation_message: "" }]
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
                                                                    { type: "textarea", label: "Description", handle: "feature_description", value : "", placeholder: "", classes : "", mandatory : false, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                                                    { type: "textarea", label: "Offline Message", handle: "feature_offline_message", value : "", placeholder: "", classes : "", mandatory : false, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                                                    { type: "textarea", label: "Deprecate Message", handle: "feature_deprecate_message", value : "", placeholder: "", classes : "", mandatory : false, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" }
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
                                                    { label: "Save Feature", theme: "primary", action: "SAVE_FEATURE", classes: "icon-left", icon: "fa fa-save", tabindex : 8, status: true, shortcut: "" },
                                                    { label: "Cancel", theme: "secondary", action: "CANCEL_FEATURE", classes: "icon-left", icon: "fa fa-times", tabindex : 8, status: true, shortcut: "" },
                                                ]
                                            }
                                        },
                                        version_form_tab: {
                                            custom: true,
                                            icon: "far fa-server",
                                            title: "Version",					                                            
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
                                                                    { type: "text", label: "Version", handle: "version_version", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                                                    { type: "text", label: "Route", handle: "version_route", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },                                                                
                                                                    { type: "search", label: "Location", handle: "version_host", value : "", placeholder: "Click to search for location", searchprompt: "Search for location",search_class: "", popup_class: "",mandatory: true, disabled: false, tabindex: 1, align: "right", label_width: 0, label_position: "top", validation_message: "", value_key: "_id", label_key: "name", datasource: {endpoint: "/system/hosts", page: 0}}
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
                                                                fields: [{ type: "toggle", label: "Status", handle: "version_status", value : false, classes : "", mandatory : true, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", validation_message: "" }]
                                                            },
                                                            {
                                                                title: "",
                                                                sub_title: "",
                                                                type: "fields",
                                                                width: "16.88888%",
                                                                layout: "horizontal",
                                                                fields: [{ type: "toggle", label: "To be deprecated", handle: "version_to_be_deprecated", value : false, classes : "", mandatory : false, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", validation_message: "" }]
                                                            },
                                                            {
                                                                title: "",
                                                                sub_title: "",
                                                                type: "fields",
                                                                width: "16.88888%",
                                                                layout: "horizontal",
                                                                fields: [{ type: "toggle", label: "Depricated", handle: "version_deprecated", value : false, classes : "", mandatory : true, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", validation_message: "" }]
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
                                                                    { type: "textarea", label: "Offline Message", handle: "version_offline_message", value : "", placeholder: "", classes : "", mandatory : false, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                                                    { type: "textarea", label: "Deprecate Message", handle: "version_deprecate_message", value : "", placeholder: "", classes : "", mandatory : false, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" }
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
                                                    { label: "Save Version", theme: "primary", action: "SAVE_VERSION", classes: "icon-left", icon: "fa fa-save", tabindex : 8, status: true, shortcut: "" },
                                                    { label: "Cancel", theme: "secondary", action: "CANCEL_VERSION", classes: "icon-left", icon: "fa fa-times", tabindex : 8, status: true, shortcut: "" },
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