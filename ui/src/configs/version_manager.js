let version_manager_config = {

    views: {
        main_view: { 
            context_header: {
                show: true,
                title: "Version Manager - (Retailers)",
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
                                    datasource: {endpoint: "/system/v1/version/retailers", page: 0, populate: false, handler: "default"},
                                    link: {key: "_id", context: "version_manager", target_type: "view", view: "version_manager_form", data: "remote", endpoint: "/system/v1/version/retailers"},
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
                                            width: "30",
                                            search: false,
                                            filter: false,
                                            header: {title: "Retailer", align: "left", filterable: false, searchable: true, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "RetailerName", type: "alphanumeric", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "30",
                                            search: false,
                                            filter: false,
                                            header: {title: "Username", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "Username", type: "alphanumeric", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "10",
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
                                            header: {title: "Region", align: "left", filterable: true, searchable: false, sortable: false, filter_type: "object", filter_key: "RegionId", filter_label: "RegionName"}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "RegionName", type: "alphanumeric", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "10", 
                                            search: false,
                                            filter: false,
                                            header: {title: "PR 1", align: "right"}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "Version1", type: "toggle", align: "right", key_field: "_id", title_key: "title"},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "10", 
                                            search: false,
                                            filter: false,
                                            header: {title: "PR 2", align: "right"}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "Version2", type: "toggle", align: "right", key_field: "_id", title_key: "title"},
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
                                    datasource: {endpoint: "/system/v1/version/regions", page: 0, populate: false, handler: "default"},
                                    link: {key: "_id", context: "version_manager", target_type: "view", view: "version_manager_form", data: "remote", endpoint: "/system/v1/version/regions"},
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
                                            width: "55",
                                            search: false,
                                            filter: false,
                                            header: {title: "Region", align: "left", filterable: false, searchable: true, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "RegionName", type: "alphanumeric", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "10",
                                            search: false,
                                            filter: false,
                                            header: {title: "PR-1 Only", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "Version1", type: "alphanumeric", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "10",
                                            search: false,
                                            filter: false,
                                            header: {title: "PR-2 Only", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "Version2", type: "alphanumeric", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "10",
                                            search: false,
                                            filter: false,
                                            header: {title: "Both", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "Both", type: "alphanumeric", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "5", 
                                            search: false,
                                            filter: false,
                                            header: {title: "PR 1", align: "right"}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "Version1Full", type: "toggle", align: "right", key_field: "_id", title_key: "title"},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "5", 
                                            search: false,
                                            filter: false,
                                            header: {title: "PR 2", align: "right"}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "Version2Full", type: "toggle", align: "right", key_field: "_id", title_key: "title"},
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
                    { label: "Only PR 1.0", theme: "primary", method: "post", action: "PR1", classes: "icon-left", icon: "", tabindex : 8, status: true, shortcut: "" },
                    { label: "Only PR 2.0", theme: "primary", method: "post", action: "PR2", classes: "icon-left", icon: "", tabindex : 8, status: true, shortcut: "" },
                    { label: "Enable Both", theme: "primary", method: "post", action: "BOTH", classes: "icon-left", icon: "", tabindex : 8, status: true, shortcut: "" }
                ]
            },
            manage: true 
        }         
    }

};

export default version_manager_config;