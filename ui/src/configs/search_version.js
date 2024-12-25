let search_version_config = {

    routes: {
        main_view: ['/search_version']
    },
    views: {
        main_view: { 
            context: "search_version",
            source: "",            
            viewFor: "",            
            context_header: {
                show: true,
                title: "Search Version - (Retailers)",
                breadcrumb: "",
                actions: [
                    { label: "Bulk Update", theme: "primary", method: "post", action: "BULK_UPDATE", classes: "pharmarack-cms-action-new icon-left", icon: "fa fa-list-check", tabindex : 8, status: true, shortcut: "" },
                    { label: "Region Update", theme: "primary", method: "post", action: "REGION_UPDATE", classes: "pharmarack-cms-action-new icon-left", icon: "fa fa-map", tabindex : 8, status: true, shortcut: "" }
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
                                    handle: "version_grid",        
                                    layout: "fluid",		
                                    height: "",
                                    header: true,
                                    content: true,
                                    footer: true,	
                                    grid_lines: true,								
                                    multi_select: false,
                                    full_row_select: false,
                                    is_main_grid: true,
                                    empty_message: "No version configured yet.!",
                                    datasource: {endpoint: "/system/v1/search_version/retailers", page: 0, populate: false, handler: "default"},
                                    link: {key: "_id", context: "search_version", target_type: "view", view: "version_manager_form", data: "remote", endpoint: ""},
                                    columns: [
                                        {
                                            show: true, 
                                            width: "10", 
                                            search: false,
                                            filter: false,
                                            header: {title: "S.No", align: "left"}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "#", type: "serial", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "28",
                                            search: false,
                                            filter: false,
                                            header: {title: "Retailer", align: "left", filterable: false, searchable: true, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "RetailerName", type: "alphanumeric", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "22",
                                            search: false,
                                            filter: false,
                                            header: {title: "Username", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "Username", type: "alphanumeric", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "15",
                                            search: false,
                                            filter: false,
                                            header: {title: "Pincode", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "Pincode", type: "alphanumeric", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "15",
                                            search: false,
                                            filter: false,
                                            header: {title: "Region", align: "left", filterable: false, searchable: false, sortable: false, filter_type: "object", filter_key: "RegionId", filter_label: "RegionName"}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "RegionName", type: "alphanumeric", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "15", 
                                            search: false,
                                            filter: false,
                                            header: {title: "Enable Mdm Search", align: "right"}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "enableMdmSearch", type: "toggle", align: "right", key_field: "_id", title_key: "title"},
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
            manage: false
        },
        region_update_form: {
            context: "search_version",
            source: "",            
            viewFor: "version_grid",            
            context_header: {
                show: true,
                title: "Version Manager - (Regions)",
                breadcrumb: "",
                actions: [
                    { label: "Back", theme: "secondary", method: "cancel", action: "CANCEL_BULK", classes: "icon-left", icon: "fa fa-chevron-left", tabindex : 8, status: true, shortcut: "" },
                    { label: "Refresh", theme: "primary", method: "get", action: "REFRESH", classes: "icon-left", icon: "fa fa-refresh", tabindex : 8, status: true, shortcut: "" }
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
                                    handle: "region_grid",        
                                    layout: "fluid",		
                                    height: "",
                                    header: true,
                                    content: true,
                                    footer: true,	
                                    grid_lines: true,								
                                    multi_select: false,
                                    full_row_select: false,
                                    is_main_grid: true,
                                    empty_message: "No version configured yet.!",
                                    datasource: {endpoint: "/system/v1/search_version/regions", page: 0, populate: false, handler: "default"},
                                    link: {key: "_id", context: "search_version", target_type: "view", view: "version_manager_form", data: "remote", endpoint: "/system/v1/search_version/regions"},
                                    columns: [
                                        {
                                            show: true, 
                                            width: "10", 
                                            search: false,
                                            filter: false,
                                            header: {title: "S.No", align: "left"}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "#", type: "serial", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "80",
                                            search: false,
                                            filter: false,
                                            header: {title: "Region", align: "left", filterable: false, searchable: true, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "RegionName", type: "alphanumeric", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "15", 
                                            search: false,
                                            filter: false,
                                            header: {title: "Enable Mdm Search", align: "right"}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "enableMdmSearch", type: "toggle", align: "right", key_field: "_id", title_key: "title"},
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
                rows: []
            },
            manage: true 
        },
        bulk_update_form: {
            context: "version_manager",
            source: "",            
            viewFor: "",            
            context_header: {
                show: true,
                title: "Version Manager - (Bulk Update)",
                breadcrumb: "",
                actions: [
                    { label: "Back", theme: "secondary", method: "cancel", action: "CANCEL_BULK", classes: "icon-left", icon: "fa fa-chevron-left", tabindex : 8, status: true, shortcut: "" }                    
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
                                width: "100%",
                                layout: "horizontal",
                                collapsible: false,
                                fields: [
                                    { type: "textarea", label: "CSV (usernames)", handle: "csv", value : "", placeholder: "Paste the comma seperated usernames", classes : "pharmarack-cms-version-csv", mandatory : false, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    { type: "placeholder", label: "", placeholder: "version_update_placeholder", value : "", classes : "pharmarack-cms-version-result-block", align: "right", label_width: 0, label_position: "top", validation_message: "" }
                                ]
                            }
                        ]
                    } 
                ]
            },
            footer: {
                show: true,
                actions: [                    
                    { label: "Enable Mdm Search", theme: "primary", method: "post", action: "ENABLE", classes: "icon-left", icon: "", tabindex : 8, status: true, shortcut: "" },
                    { label: "Disable Mdm Search", theme: "warning", method: "post", action: "DISABLE", classes: "icon-left", icon: "", tabindex : 8, status: true, shortcut: "" }
                ]
            },
            manage: true 
        }         
    }

};

export default search_version_config;