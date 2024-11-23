let component_config = {

    views: {
        main_view: { 
            context: "component", 
            context_header: {
                show: true,
                title: "Components",
                breadcrumb: "",
                actions: [                   
                    { label: "New Component", theme: "primary", method: "post", action: "NEW_COMPONENT", classes: "pharmarack-cms-action-new icon-left", icon: "fa fa-plus", tabindex : 8, status: true, shortcut: "" }
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
                                type: "datagrid",
                                width: "100%",
                                layout: "horizontal",
                                collapsible: false,
                                datagrid: {
                                    handle: "component_grid",        
                                    layout: "fluid",		
                                    height: "",
                                    header: true,
                                    content: true,
                                    footer: true,	
                                    grid_lines: true,								
                                    multi_select: false,
                                    full_row_select: false,
                                    is_main_grid: true,
                                    empty_message: "No component configured yet.!",
                                    datasource: {endpoint: "/system/v1/api/component/component/parent_list?populate=type", page: 0, populate: false, handler: "default"},
                                    link: {key: "_id", context: "component", target_type: "view", view: "component_form", data: "remote", endpoint: "/system/v1/api/component/component/record?id="},
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
                                            width: "25",
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
                                            header: {title: "Type", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "type", type: "search", align: "left", editable: false, label_key: "title", value_key: "_id" },
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "30",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Pages", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "pages", type: "alphanumeric", align: "left" },
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "10", 
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Start Date", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "start_date", type: "date", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "10", 
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "End Date", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "end_date", type: "date", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "10", 
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Status", align: "right", filterable: false, searchable: false, sortable: false}, 
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
        component_form: {
            context: "component", 
            context_header: {
                show: true,
                title: "Component",
                breadcrumb: "title",
                actions: [
                    { label: "Cancel", theme: "secondary", method: "cancel", action: "CANCEL_COMPONENT", classes: "icon-left", icon: "fa fa-times", tabindex : 8, status: true, shortcut: "" },                    
                    { label: "Save", theme: "primary", method: "post", action: "SAVE_COMPONENT", classes: "icon-left", icon: "fa fa-save", tabindex : 8, status: true, shortcut: "" }
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
                                width: "33.3333%",
                                layout: "horizontal",
                                collapsible: true,
                                classes: "",
                                fields: [   
                                    { type: "toggle", label: "Status", handle: "status", value : false, classes : "", mandatory : false, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", validation_message: "" },                                 
                                    { type: "text", label: "Title", handle: "title", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    { type: "text", label: "Sub Title", handle: "sub_title", value : "", placeholder: "", classes : "", mandatory : false, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    { type: "text", label: "Handle", handle: "handle", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    { type: "select", label: "Component Type", handle: "type", value : "1", placeholder: "-- select page type --", value_key: "_id", label_key: "title", options: [], classes : "", mandatory : true, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", prompt_message: "", validation_message: "", source: "remote", endpoint: "/system/v1/api/component/component_type/component_type_list"},
                                    { type: "date", label: "Start Date", handle: "start_date", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    { type: "date", label: "End Date", handle: "end_date", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" }
                                ]
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
        mapping_form: {
            context: "component", 
            context_header: {
                show: false                
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
                                title: "Component Mapping",
                                sub_title: "Assign the above component to one or more page",
                                type: "fields",
                                width: "100%",
                                layout: "horizontal",
                                collapsible: false,
                                classes: "",
                                fields: [
                                    { 
                                        type: "search", 
                                        label: "Page", 
                                        handle: "page", 
                                        value : "", 
                                        placeholder: "Click to search for Page", 
                                        searchprompt: "Search for Page",
                                        search_class: "", 
                                        popup_class: "",
                                        mandatory: true,                                         
                                        disabled: false, 
                                        tabindex: 1, 
                                        align: "right", 
                                        label_width: 0, 
                                        label_position: "top",                                         
                                        validation_message: "", 
                                        value_key: "_id", 
                                        label_key: "title", 
                                        datasource: {endpoint: "/system/v1/api/page/page/list", page: 0, cached: false}
                                    },
                                    { type: "select", label: "Position", handle: "position", value : "", placeholder: "-- select page type --", value_key: "value", label_key: "label", options: [], classes : "", mandatory : true, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", prompt_message: "", validation_message: "", source: "local", endpoint: ""},
                                    { type: "button", label: "Map Page", theme: "primary", action: "MAP_PAGE", classes: "icon-left width-100 page-component-map-button", icon: "fa fa-arrows-h", tabindex : 8, status: true, shortcut: "" }
                                ]
                            }
                        ]
                    },
                    {
                        seperator: false,
                        columns: [
                            {
                                title: "Mapped Pages",
                                sub_title: "Pages that are already mapped with this component",
                                type: "datagrid",
                                width: "100%",
                                layout: "horizontal",
                                collapsible: false,
                                datagrid: {
                                    handle: "page_component_grid",        
                                    layout: "fluid",		
                                    height: "",
                                    header: true,
                                    content: true,
                                    footer: true,	
                                    grid_lines: true,								
                                    multi_select: false,
                                    full_row_select: false,
                                    is_main_grid: true,
                                    empty_message: "No page mapped yet.!",
                                    datasource: {endpoint: "/system/v1/api/component/page_component_mapping/list_tagged_pages?populate=page|component&component=", page: 0, populate: false, handler: "default"},
                                    link: {key: "_id", context: "component", target_type: "view", view: "component_form", data: "remote", endpoint: "/system/v1/api/component/page_component_mapping/record?populate=page|component&id="},
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
                                            width: "31",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Page", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "page", type: "search", align: "left", label_key: "title", value_key: "_id"},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "21", 
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Position", align: "left", filterable: false, searchable: false, sortable: false,},                                             
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "position", type: "alphanumeric"},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "12", 
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Action", align: "center", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "", type: "button", action: "REMOVE", align: "center", icon: "fa fa-trash", class: "icon-left"},
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
            }
        }
        
    }

};

export default component_config;