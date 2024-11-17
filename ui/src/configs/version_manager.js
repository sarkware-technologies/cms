let version_manager_config = {

    views: {
        main_view: { 
            context_header: {
                show: true,
                title: "Version Manager - (Retailers)",
                breadcrumb: "",
                actions: [{ label: "Bulk Update", theme: "primary", action: "BULK_UPDATE", classes: "fields-factory-action-new icon-left", icon: "fa fa-list-check", tabindex : 8, status: true, shortcut: "" }]
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
                                    datasource: {endpoint: "/system/version/retailers", page: 0, populate: false, handler: "default"},
                                    link: {key: "_id", context: "version_manager", target_type: "view", view: "version_manager_form", data: "remote", endpoint: "/system/version/retailers"},
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
                                            classes: "",
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
                                            classes: "",
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
                                            classes: "",
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
                                            classes: "",
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
                                            classes: "",
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
        bulk_update_form: {
            context_header: {
                show: true,
                title: "Version Manager - (Regions)",
                breadcrumb: "",
                actions: [
                    { label: "Back", theme: "secondary", action: "CANCEL_BULK", classes: "icon-left", icon: "fa fa-chevron-left", tabindex : 8, status: true, shortcut: "" },
                    { label: "Refresh", theme: "primary", action: "REFRESH", classes: "icon-left", icon: "fa fa-refresh", tabindex : 8, status: true, shortcut: "" }
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
                                    datasource: {endpoint: "/system/version/regions", page: 0, populate: false, handler: "default"},
                                    link: {key: "_id", context: "version_manager", target_type: "view", view: "version_manager_form", data: "remote", endpoint: "/system/version/regions"},
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
                                            width: "55",
                                            search: false,
                                            filter: false,
                                            classes: "",
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
                                            classes: "",
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
                                            classes: "",
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
                                            classes: "",
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
                                            classes: "",
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
                                            classes: "",
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
        }        
    }

};

export default version_manager_config;