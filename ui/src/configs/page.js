let page_config = {

    routes: {
        main_view: ['/page'],
        page_form: ["/page/new", "/page/:id"],     
    },
    views: {
        main_view: { 
            context: "page",
            source: "",            
            viewFor: "",            
            context_header: {
                show: true,
                title: "Pages",
                breadcrumb: "",
                actions: [                    
                    { type: "link", label: "New Page", theme: "primary", method: "post", action: "/page/new", classes: "pharmarack-cms-action-new icon-left", icon: "fa fa-plus", tabindex : 8, status: true, shortcut: "" }
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
                                    handle: "page_grid",        
                                    layout: "fluid",		
                                    height: "",
                                    header: true,
                                    content: true,
                                    footer: true,	
                                    grid_lines: true,								
                                    multi_select: false,
                                    full_row_select: false,
                                    is_main_grid: true,
                                    empty_message: "No page configured yet.!",
                                    datasource: {endpoint: "/system/v1/api/page/page/list?populate=type", page: 0, populate: false, handler: "default"},
                                    link: {key: "_id", context: "page", target_type: "view", view: "page_form", data: "remote", endpoint: "/page/"},
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
                                            field: {handle: "title", type: "link", align: "left"},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "20", 
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Handle", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "handle", type: "alphanumeric", align: "left"},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "20", 
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Page Type", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "type", type: "search", align: "left", label_key: "title", value_key: "_id" },
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "15", 
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Clone", align: "center", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "", type: "button", action: "CLONE", align: "center", icon: "fa fa-clone", class: "icon-left"},
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
            manage: false             
        },
        page_form: {
            context: "page",
            source: "/system/v1/api/page/page/record?id=",            
            viewFor: "page_grid",            
            context_header: {
                show: true,
                title: "Page",
                breadcrumb: "title",
                actions: [
                    { label: "Cancel", theme: "secondary", method: "cancel", action: "BACK", classes: "icon-left", icon: "fa fa-times", tabindex : 8, status: true, shortcut: "" },
                    { label: "Save", theme: "primary", method: "post", action: "SAVE_PAGE", classes: "icon-left", icon: "fa fa-save", tabindex : 8, status: true, shortcut: "" }
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
                                width: "340px",
                                layout: "horizontal",
                                collapsible: false,
                                classes: "",
                                fields: [                                    
                                    { type: "text", label: "Title", handle: "title", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    { type: "text", label: "Handle", handle: "handle", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    { type: "select", label: "Page Type", handle: "type", value : "1", placeholder: "-- select page type --", value_key: "_id", label_key: "title", options: [], classes : "", mandatory : true, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", prompt_message: "", validation_message: "", source: "remote", endpoint: "/system/v1/api/page/page_type/pagetype_list"},                                    
                                    { title: "Company", sub_title: "", type: "placeholder", width: "100%", layout: "horizontal", collapsible: false, classes: "", handle: "company_mapper", placeholder: "company_map_container" },
                                    { type: "textarea", label: "Description", handle: "description", value : "", placeholder: "", classes : "", mandatory : false, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" }
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

export default page_config;