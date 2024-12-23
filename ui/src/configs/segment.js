let segment_config = {

    routes: {
        main_view: ['/segment'],
        new_segment_form: ["/segment/new"],
        segment_form: ["/segment/:id"]
    },
    views: {
        main_view: { 
            context: "segment",
            source: "",            
            viewFor: "",            
            context_header: {
                show: true,
                title: "Segments",
                breadcrumb: "",
                actions: [
                    { label: "Purge Builder", theme: "danger", method: "get", action: "HOUSE_KEEP_SEGMENT", classes: "pharmarack-cms-action-clear icon-left", icon: "fa fa-broom", tabindex : 8, status: true, shortcut: "" },
                    { type: "link", label: "New Segment", theme: "primary", method: "post", action: "/segment/new", classes: "pharmarack-cms-action-new icon-left", icon: "fa fa-plus", tabindex : 8, status: true, shortcut: "" }
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
                                type: "tab",
                                width: "100%",
                                layout: "horizontal",
                                tab: {
                                    title: "",                        
                                    handle: "segment_tab",							                                    
                                    position: "top",                                    
                                    default_tab: "all_segment_tab",
                                    tabview: true,
                                    type: "fluid",		
                                    width: "100%",  
                                    items: {
                                        all_segment_tab: {
                                            custom: false,
                                            icon: "fa fa-sitemap",
                                            title: "All",
                                            context: "segment",					
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
                                                                collapsible: false,
                                                                datagrid: {
                                                                    handle: "all_segment_grid",        
                                                                    layout: "fluid",		
                                                                    height: "",
                                                                    header: true,
                                                                    content: true,
                                                                    footer: true,	
                                                                    grid_lines: true,								
                                                                    multi_select: false,
                                                                    full_row_select: false,
                                                                    is_main_grid: true,
                                                                    empty_message: "No segment configured yet.!",
                                                                    datasource: {endpoint: "/segmentation/v1/segment?result=all", page: 0, populate: false, handler: "dedicated"},
                                                                    link: {key: "_id", context: "segment", target_type: "view", view: "segment_form", data: "remote", endpoint: "/segment/"},
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
                                                                            width: "20",
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "ellipsis-text",
                                                                            header: {title: "Title", align: "left", filterable: false, searchable: true, sortable: false}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "title", type: "link", align: "left", editable: false},
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true, 
                                                                            width: "20",
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "ellipsis-text",
                                                                            header: {title: "Handle", align: "left", filterable: false, searchable: false, sortable: false}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "handle", type: "alphanumeric", align: "left", editable: false},
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true, 
                                                                            width: "15", 
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "ellipsis-text",
                                                                            header: {title: "Created By", align: "left"}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "createdBy", type: "search", align: "left", label_key: "fullName", value_key: "_id"},
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true, 
                                                                            width: "15", 
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "ellipsis-text",
                                                                            header: {title: "Modified By", align: "left"}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "updatedBy", type: "search", align: "left", label_key: "fullName", value_key: "_id"},
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true, 
                                                                            width: "15", 
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: {title: "Build", align: "center"}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "build", type: "alphanumeric", align: "center"},
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
                                            }
                                        },
                                        dynamic_segment_tab: {
                                            custom: false,
                                            icon: "fa fa-gears",
                                            title: "Dynamic",	
                                            context: "segment",				
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
                                                                collapsible: false,
                                                                datagrid: {
                                                                    handle: "dynamic_segment_grid",        
                                                                    layout: "fluid",		
                                                                    height: "",
                                                                    header: true,
                                                                    content: true,
                                                                    footer: true,	
                                                                    grid_lines: true,								
                                                                    multi_select: false,
                                                                    full_row_select: false,
                                                                    is_main_grid: true,
                                                                    empty_message: "No dynamic segment found",
                                                                    datasource: {endpoint: "/segmentation/v1/segment?result=dynamic", page: 0, populate: false, handler: "dedicated"},
                                                                    link: {key: "_id", context: "segment", target_type: "view", view: "segment_form", data: "remote", endpoint: "/segment/"},
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
                                                                            width: "25",
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
                                                                            width: "15", 
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: {title: "Created By", align: "left"}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "createdBy", type: "search", align: "left", label_key: "fullName", value_key: "_id"},
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true, 
                                                                            width: "15", 
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: {title: "Modified By", align: "left"}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "updatedBy", type: "search", align: "left", label_key: "fullName", value_key: "_id"},
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
                                            }
                                        },
                                        static_segment_tab: {
                                            custom: false,
                                            icon: "fa fa-bolt",
                                            title: "Static",	
                                            context: "segment",				
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
                                                                collapsible: false,
                                                                datagrid: {
                                                                    handle: "static_segment_grid",        
                                                                    layout: "fluid",		
                                                                    height: "",
                                                                    header: true,
                                                                    content: true,
                                                                    footer: true,	
                                                                    grid_lines: true,								
                                                                    multi_select: false,
                                                                    full_row_select: false,
                                                                    is_main_grid: true,
                                                                    empty_message: "No static segment found",
                                                                    datasource: {endpoint: "/segmentation/v1/segment?result=static", page: 0, populate: false, handler: "dedicated"},
                                                                    link: {key: "_id", context: "segment", target_type: "view", view: "segment_form", data: "remote", endpoint: "/segment/"},
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
                                                                            width: "25",
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
                                                                            width: "15", 
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: {title: "Created By", align: "left"}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "createdBy", type: "search", align: "left", label_key: "fullName", value_key: "_id"},
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true, 
                                                                            width: "15", 
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: {title: "Modified By", align: "left"}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "updatedBy", type: "search", align: "left", label_key: "fullName", value_key: "_id"},
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
                                            }
                                        },
                                        in_progress_segment_tab: {
                                            custom: false,
                                            icon: "fa fa-loader",
                                            title: "Scheduled",	
                                            context: "segment",				
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
                                                                collapsible: false,
                                                                datagrid: {
                                                                    handle: "progress_segment_grid",        
                                                                    layout: "fluid",		
                                                                    height: "",
                                                                    header: true,
                                                                    content: true,
                                                                    footer: true,	
                                                                    grid_lines: true,								
                                                                    multi_select: false,
                                                                    full_row_select: false,
                                                                    is_main_grid: true,
                                                                    empty_message: "No in progress segment found",
                                                                    datasource: {endpoint: "/segmentation/v1/segment?result=scheduled", page: 0, populate: false, handler: "dedicated"},
                                                                    link: {key: "_id", context: "segment", target_type: "view", view: "segment_form", data: "remote", endpoint: "/segment/"},
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
                                                                            width: "35",
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
                                                                            width: "15", 
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: {title: "Created By", align: "left"}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "createdBy", type: "search", align: "left", label_key: "fullName", value_key: "_id"},
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true, 
                                                                            width: "15", 
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: {title: "Modified By", align: "left"}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "updatedBy", type: "search", align: "left", label_key: "fullName", value_key: "_id"},
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
                                        },
                                        disabled_segment_tab: {
                                            custom: false,
                                            icon: "fa fa-ban",
                                            title: "Disabled",	
                                            context: "segment",				
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
                                                                collapsible: false,
                                                                datagrid: {
                                                                    handle: "disabled_segment_grid",        
                                                                    layout: "fluid",		
                                                                    height: "",
                                                                    header: true,
                                                                    content: true,
                                                                    footer: true,	
                                                                    grid_lines: true,								
                                                                    multi_select: false,
                                                                    full_row_select: false,
                                                                    is_main_grid: true,
                                                                    empty_message: "No disabled segment found.!",
                                                                    datasource: {endpoint: "/segmentation/v1/segment?result=disabled", page: 0, populate: false, handler: "dedicated"},
                                                                    link: {key: "_id", context: "segment", target_type: "view", view: "segment_form", data: "remote", endpoint: "/segment/"},
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
                                                                            width: "25",
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
                                                                            width: "15", 
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: {title: "Created By", align: "left"}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "createdBy", type: "search", align: "left", label_key: "fullName", value_key: "_id"},
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true, 
                                                                            width: "15", 
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: {title: "Modified By", align: "left"}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "updatedBy", type: "search", align: "left", label_key: "fullName", value_key: "_id"},
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
                                            }
                                        }
        
                                    }
        
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
        new_segment_form: {
            context: "segment",
            source: "",            
            viewFor: "",            
            context_header: {
                show: true,
                title: "Segment",
                breadcrumb: "title",
                actions: [
                    { label: "Cancel", theme: "secondary", method: "cancel", action: "BACK", classes: "icon-left", icon: "fa fa-times", tabindex : 8, status: true, shortcut: "" },
                    { label: "Save", theme: "primary", method: "post", action: "SAVE_SEGMENT", classes: "icon-left", icon: "fa fa-save", tabindex : 8, status: true, shortcut: "" }
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
                                type: "rows",
                                width: "50%",
                                layout: "vertical",
                                classes: "",
                                rows: [
                                    {
                                        seperator: false,
                                        columns: [
                                            {
                                                title: "Segment Type",
                                                sub_title: "",
                                                type: "fields",
                                                width: "100%",
                                                layout: "horizontal",
                                                classes: "",
                                                fields: [                                                                        
                                                    { type: "radio", label: "", handle: "segmentType", value : "1", value_key: "value", label_key: "label", choices: [{label: "Dynamic", value: "1", selected: true, disabled: false},{label: "Static", value: "2", selected: false, disabled: false}], layout: "horizontal", classes : "", mandatory : true, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", prompt_message: "", validation_message: "", source: "local", endpoint: "" },
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
                                                type: "tab",
                                                width: "100%",
                                                layout: "horizontal",
                                                classes: "",
                                                tab: {
                                                    title: "",                        
                                                    handle: "segment_form_tab",							                                   
                                                    position: "top",                                    
                                                    default_tab: "dynamic_segment_tab",
                                                    tabview: false,
                                                    type: "fluid",		
                                                    width: "100%",                                    
                                                    items: {
                                                        dynamic_segment_tab: { 
                                                            custom: true,                                                           
                                                            icon: "",                                            
                                                            title: "Dynamic",	
                                                            context: "segment",				                                                                                
                                                            header: {show: false},                    
                                                            content: {
                                                                show: true,
                                                                rows: [
                                                                    {
                                                                        seperator: false,
                                                                        columns: [
                                                                            {
                                                                                title: "Segment",
                                                                                sub_title: "",
                                                                                type: "fields",
                                                                                width: "100%",
                                                                                layout: "horizontal",
                                                                                classes: "",
                                                                                fields: [                                                                        
                                                                                    { type: "text", label: "", handle: "title", value : "", placeholder: "Segment Name", classes : "", mandatory : false, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                                                                    { type: "text", label: "", handle: "handle", value : "", placeholder: "Segment Handle", classes : "", mandatory : false, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },                                                                    
                                                                                    { type: "textarea", label: "", handle: "description", value : "", placeholder: "Description", classes : "", mandatory : false, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" }
                                                                                ]
                                                                            }                            
                                                                        ]
                                                                    },
                                                                    {
                                                                        seperator: false,
                                                                        columns: [
                                                                            {
                                                                                title: "Time Interval",
                                                                                sub_title: "",
                                                                                type: "rows",
                                                                                width: "100%",
                                                                                layout: "horizontal",
                                                                                classes: "",
                                                                                rows: [                                                                        
                                                                                    {
                                                                                        seperator: false,
                                                                                        columns: [
                                                                                            {
                                                                                                title: "",
                                                                                                sub_title: "",
                                                                                                type: "fields",
                                                                                                width: "25%",
                                                                                                layout: "horizontal",
                                                                                                classes: "",
                                                                                                fields: [                                                                        
                                                                                                    { type: "date", label: "", handle: "fromDate", value : "", placeholder: "From", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                                                                                ]
                                                                                            },
                                                                                            {
                                                                                                title: "",
                                                                                                sub_title: "",
                                                                                                type: "fields",
                                                                                                width: "25%",
                                                                                                layout: "horizontal",
                                                                                                classes: "",
                                                                                                fields: [                                                                        
                                                                                                    { type: "date", label: "", handle: "toDate", value : "", placeholder: "To", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                                                                                ]
                                                                                            }                            
                                                                                        ]
                                                                                    }
                                                                                ]
                                                                            }                            
                                                                        ]
                                                                    },
                                                                    {
                                                                        seperator: false,
                                                                        columns: [
                                                                            {
                                                                                title: "Geography",
                                                                                sub_title: "",
                                                                                type: "fields",
                                                                                width: "100%",
                                                                                layout: "horizontal",
                                                                                classes: "",
                                                                                fields: [                                                                        
                                                                                    { type: "radio", label: "", handle: "geography", value : "1", value_key: "value", label_key: "label", choices: [{label: "State", value: "1", selected: true, disabled: false},{label: "Region", value: "2", selected: false, disabled: false}], layout: "horizontal", classes : "", mandatory : true, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", prompt_message: "", validation_message: "", source: "local", endpoint: "" },
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
                                                                                type: "placeholder",
                                                                                width: "50%",
                                                                                layout: "horizontal",
                                                                                collapsible: false,
                                                                                classes: "",
                                                                                placeholder: "segment_geography_container"
                                                                            }                       
                                                                        ]
                                                                    },
                                                                    {
                                                                        seperator: false,
                                                                        columns: [
                                                                            {
                                                                                title: "Order Status",
                                                                                sub_title: "",
                                                                                type: "fields",
                                                                                width: "100%",
                                                                                layout: "horizontal",
                                                                                classes: "",
                                                                                fields: [                                                                                                                                             
                                                                                    { type: "check", label: "", handle: "orderStatus", value : "1", value_key: "value", label_key: "label", choice: "multi", choices: [{label: "Placed", value: "1", selected: true, disabled: false},{label: "Processed", value: "2", selected: false, disabled: false},{label: "Uploaded", value: "3", selected: false, disabled: false}], layout: "horizontal", classes : "", mandatory : true, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", prompt_message: "", validation_message: "", source: "local", endpoint: "" },
                                                                                ]
                                                                            }                                                                                               
                                                                        ]
                                                                    },
                                                                    {
                                                                        seperator: false,
                                                                        columns: [
                                                                            {
                                                                                title: "Retailers",
                                                                                sub_title: "",
                                                                                type: "fields",
                                                                                width: "100%",
                                                                                layout: "horizontal",
                                                                                classes: "",
                                                                                fields: [                                                                        
                                                                                    { type: "radio", label: "", handle: "retailerStatus", value : "1", value_key: "value", label_key: "label", choices: [{label: "All", value: "1", selected: true, disabled: false},{label: "Only Authorized", value: "2", selected: false, disabled: false}], layout: "horizontal", classes : "", mandatory : true, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", prompt_message: "", validation_message: "", source: "local", endpoint: "" },
                                                                                ]
                                                                            }                       
                                                                        ]
                                                                    },                    
                                                                    {
                                                                        seperator: false,
                                                                        columns: [
                                                                            {
                                                                                title: "Distributors",
                                                                                sub_title: "",
                                                                                type: "fields",
                                                                                width: "100%",
                                                                                layout: "horizontal",
                                                                                classes: "",
                                                                                fields: [           
                                                                                    {
                                                                                        type: "multiselect", 
                                                                                        label: "", 
                                                                                        handle: "companies", 
                                                                                        value : "", 
                                                                                        parents: {},
                                                                                        placeholder: "Select Companies", 
                                                                                        searchprompt: "Search for companies",
                                                                                        search_class: "", 
                                                                                        popup_class: "",
                                                                                        mandatory: false, 
                                                                                        readonly: false, 
                                                                                        disabled: false, 
                                                                                        tabindex: 1, 
                                                                                        align: "right", 
                                                                                        label_width: 0, 
                                                                                        recordsPerPage: 15,
                                                                                        label_position: "top", 
                                                                                        prompt_message: "", 
                                                                                        validation_message: "", 
                                                                                        value_key: "CompanyId", 
                                                                                        label_key: "CompanyName", 
                                                                                        source: "remote",
                                                                                        endpoint: "/segmentation/v1/api/segment/segment/multi_select_list?entity=companies&select=_id|CompanyId|CompanyName"
                                                                                    },                                                             
                                                                                    { type: "radio", label: "", handle: "storeStatus", value : "1", value_key: "value", label_key: "label", choices: [{label: "All", value: "1", selected: true, disabled: false},{label: "Only Authorized", value: "2", selected: false, disabled: false}], layout: "horizontal", classes : "", mandatory : true, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", prompt_message: "", validation_message: "", source: "local", endpoint: "" },
                                                                                    {
                                                                                        type: "multiselect", 
                                                                                        label: "Exclude distributors", 
                                                                                        handle: "excludedStores", 
                                                                                        value : "", 
                                                                                        parents: {},
                                                                                        placeholder: "Select Distributors", 
                                                                                        searchprompt: "Search for distributors",
                                                                                        search_class: "", 
                                                                                        popup_class: "",
                                                                                        mandatory: false, 
                                                                                        readonly: false, 
                                                                                        disabled: false, 
                                                                                        tabindex: 1, 
                                                                                        align: "right", 
                                                                                        label_width: 0, 
                                                                                        recordsPerPage: 15,
                                                                                        label_position: "top", 
                                                                                        prompt_message: "", 
                                                                                        validation_message: "", 
                                                                                        value_key: "_id", 
                                                                                        label_key: "storeName", 
                                                                                        source: "remote",
                                                                                        endpoint: "/segmentation/v1/api/segment/segment/multi_select_list?entity=cms_master_store&select=_id|storeId|storeName"
                                                                                    }
                                                                                ]
                                                                            }                       
                                                                        ]
                                                                    },
                                                                    {
                                                                        seperator: false,
                                                                        columns: [
                                                                            {
                                                                                title: "Sale Rules",
                                                                                sub_title: "",
                                                                                type: "placeholder",
                                                                                width: "100%",
                                                                                layout: "horizontal",
                                                                                collapsible: false,
                                                                                classes: "",
                                                                                placeholder: "segment_rules_container"
                                                                            }                       
                                                                        ]
                                                                    }
                                                                ]                                            
                                                            },
                                                            footer: {                                                                
                                                                show: true,
                                                                align: "left",
                                                                actions: [{ label: "Generate Segment", theme: "primary", action: "SAVE_SEGMENT", classes: "segment-form-create-btn", icon: "", tabindex : 8, status: true, shortcut: "" }]                                                                
                                                            }
                                                        },
                                                        static_segment_tab: { 
                                                            custom: false,                                                       
                                                            icon: "",
                                                            title: "Static",	
                                                            context: "segment",				                                                                         
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
                                                                                title: "Segment",
                                                                                sub_title: "",
                                                                                type: "fields",
                                                                                width: "100%",
                                                                                layout: "horizontal",
                                                                                classes: "",
                                                                                fields: [                                                                        
                                                                                    { type: "text", label: "", handle: "title", value : "", placeholder: "Segment Name", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },                                                                    
                                                                                    { type: "text", label: "", handle: "handle", value : "", placeholder: "Segment Handle", classes : "", mandatory : false, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },                                                                    
                                                                                    { type: "textarea", label: "", handle: "description", value : "", placeholder: "Description", classes : "", mandatory : false, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" }
                                                                                ]
                                                                            }                            
                                                                        ]
                                                                    },
                                                                    {
                                                                        seperator: false,
                                                                        columns: [                           
                                                                            {
                                                                                title: "Add Retailers",
                                                                                sub_title: "",
                                                                                type: "fields",
                                                                                width: "100%",
                                                                                layout: "horizontal",
                                                                                classes: "",
                                                                                fields: [                                                                        
                                                                                    {
                                                                                        type: "multiselect", 
                                                                                        label: "", 
                                                                                        handle: "retailers", 
                                                                                        value : "", 
                                                                                        parents: {},
                                                                                        placeholder: "Retailers", 
                                                                                        searchprompt: "Search for retailers",
                                                                                        search_class: "", 
                                                                                        popup_class: "",
                                                                                        behaviour: "flatlist",
                                                                                        mandatory: true, 
                                                                                        readonly: false, 
                                                                                        disabled: false, 
                                                                                        tabindex: 1, 
                                                                                        align: "right", 
                                                                                        label_width: 0, 
                                                                                        recordsPerPage: 10,
                                                                                        label_position: "top", 
                                                                                        prompt_message: "", 
                                                                                        validation_message: "", 
                                                                                        value_key: "_id", 
                                                                                        label_key: "RetailerName", 
                                                                                        source: "local",
                                                                                        original: window._controller.bucket.retailerList
                                                                                    }
                                                                                ]
                                                                            }                            
                                                                        ]
                                                                    }
                                                                ]                                            
                                                            },
                                                            footer: {
                                                                show: true,
                                                                align: "left",
                                                                actions: [{ label: "Generate Segment", theme: "primary", action: "SAVE_SEGMENT", classes: "segment-form-create-btn", icon: "", tabindex : 8, status: true, shortcut: "" }]
                                                            }
                                                        }
                                                    }
                                                }
                                            }                         
                                        ]
                                    }
                                ]
                            },
                            {
                                title: "",
                                sub_title: "",
                                type: "fields",
                                width: "50%",
                                layout: "horizontal",
                                collapsible: false,
                                classes: "",
                                fields: [                                    
                                    
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
            manage: false 
        },
        segment_form: {
            context: "segment",
            source: "/segmentation/v1/segment/",            
            viewFor: "",            
            context_header: {
                show: true,
                title: "Segment",
                breadcrumb: "title",
                actions: [
                    { label: "Cancel", theme: "secondary", method: "cancel", action: "BACK", classes: "icon-left", icon: "", tabindex : 8, status: true, shortcut: "" },
                    { label: "Delete", theme: "danger", method: "delete", action: "DELETE_SEGMENT", classes: "icon-left", icon: "", tabindex : 8, status: true, shortcut: "" },
                    { label: "Build", theme: "warning", method: "put", action: "BUILD_SEGMENT", classes: "icon-left", icon: "", tabindex : 8, status: true, shortcut: "" },
                    { label: "Edit", theme: "primary", method: "post", action: "EDIT_SEGMENT", classes: "pharmarack-cms-segment-rule-edit-btn", icon: "", tabindex : 8, status: true, shortcut: "" }
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
                                classes: "",
                                fields: [                                                                        
                                    { type: "label", label: "Title", handle: "title", value : "",  classes : "", align: "right", label_width: 0, label_position: "top" },                                                                    
                                    { type: "label", label: "Handle", handle: "handle", value : "",  classes : "", align: "right", label_width: 0, label_position: "top" },                                                                    
                                    { type: "label", label: "Description", handle: "description", value : "", classes : "", align: "right", label_width: 0, label_position: "top" }
                                ]
                            },
                            {
                                title: "",
                                sub_title: "",
                                type: "placeholder",
                                width: "50%",
                                layout: "horizontal",
                                classes: "",
                                placeholder: "segment_summary"
                            }
                        ]
                    },
                    {
                        seperator: false,
                        columns: [
                            {
                                title: "",
                                sub_title: "",
                                type: "view",
                                width: "100%",
                                layout: "horizontal",
                                classes: "",
                                view: "segment_retailer_form"
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
        segment_build_form: {
            context: "segment",
            source: "",            
            viewFor: "",            
            context_header: {
                show: true,
                title: "Segment",
                breadcrumb: "title",
                actions: [
                    { label: "Back", theme: "secondary", method: "cancel", action: "BACK", classes: "icon-left", icon: "", tabindex : 8, status: true, shortcut: "" },
                    { label: "Add to Build Queue", theme: "warning", method: "post", action: "START_BUILD_SEGMENT", classes: "icon-left", icon: "", tabindex : 8, status: true, shortcut: "" }                                        
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
                                title: "Build Parameters",
                                sub_title: "",
                                type: "placeholder",
                                width: "50%",
                                layout: "horizontal",
                                classes: "",
                                placeholder: "segment_build_option_widget"
                            },
                            {
                                title: "Build Status",
                                sub_title: "",
                                type: "placeholder",
                                width: "50%",
                                layout: "horizontal",
                                classes: "",
                                placeholder: "segment_build_status_widget"
                            }
                        ]
                    },
                    {
                        seperator: false,
                        columns: [
                            {
                                title: "Build History",
                                sub_title: "",
                                type: "datagrid",
                                width: "100%",
                                layout: "horizontal",
                                collapsible: false,
                                datagrid: {
                                    handle: "build_history_grid",        
                                    layout: "fluid",		
                                    height: "",
                                    header: true,
                                    content: true,
                                    footer: true,	
                                    grid_lines: true,								
                                    multi_select: false,
                                    full_row_select: false,
                                    is_main_grid: true,
                                    empty_message: "No retailer mapped for this segment yet.!",
                                    datasource: {endpoint: "/segmentation/v1/segment/:id/buildHistory", page: 0, populate: false, handler: "dedicated", cached: false},
                                    link: {key: "RetailerId", context: "segment", target_type: "view", view: "segment_form", data: "remote", endpoint: "/segmentation/v1/segment/"},
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
                                            width: "10",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Max Thread", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "maxThread", type: "alphanumeric", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "10",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Per Batch", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "recordsPerBatch", type: "alphanumeric", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "10",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Chunk Size", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "chunkSize", type: "alphanumeric", align: "left", editable: false},
                                            prompt: ""
                                        }, 
                                        {
                                            show: true, 
                                            width: "25",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Start Time", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "startTime", type: "date", align: "left", editable: false},
                                            prompt: ""
                                        }, 
                                        {
                                            show: true, 
                                            width: "25",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "End Time", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "endTime", type: "date", align: "left", editable: false},
                                            prompt: ""
                                        }, 
                                        {
                                            show: true, 
                                            width: "15",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Elapsed Time", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "elapsedTime", type: "alphanumeric", align: "left", editable: false},
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
        segment_retailer_form: {
            context: "segment",
            source: "",            
            viewFor: "",            
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
                                title: "",
                                sub_title: "",
                                type: "view",
                                width: "100%",
                                layout: "horizontal",
                                classes: "",
                                view: "static_retailer_list_form"
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
                                classes: "",
                                fields: [
                                    {
                                        type: "multiselect", 
                                        label: "", 
                                        handle: "add_retailers", 
                                        value : "", 
                                        parents: {},
                                        placeholder: "Retailers", 
                                        searchprompt: "Search for retailers",
                                        search_class: "", 
                                        popup_class: "",
                                        behaviour: "popup",
                                        mandatory: true, 
                                        readonly: false, 
                                        disabled: false, 
                                        tabindex: 1, 
                                        align: "right", 
                                        label_width: 0, 
                                        recordsPerPage: 10,
                                        label_position: "top", 
                                        prompt_message: "", 
                                        validation_message: "", 
                                        value_key: "_id", 
                                        label_key: "RetailerName", 
                                        source: "remote",
                                        endpoint: "/segmentation/v1/api/segment/segment/multi_select_list?entity=cms_master_retailer&select=_id|RetailerId|RetailerName"
                                    }
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
            manage: false
        },        
        static_retailer_list_form: {
            context: "segment",
            source: "",            
            viewFor: "",            
            context_header: {show: false},           
            header: {
                show: true,
                actions: [                 
                    { label: "Delete Retailers", theme: "warning", method: "delete", action: "BLACKLIST_RETAILER", classes: "bulk-retailer-removed", icon: "", tabindex : 8, status: true, shortcut: "" },
                    { label: "Add Retailers", theme: "primary", method: "post", action: "WHITELIST_RETAILER", classes: "bulk-retailer-added", icon: "", tabindex : 8, status: true, shortcut: "" }
                ]
            },
            content: {
                show: true,
                rows: [                    
                    {
                        seperator: false,
                        columns: [
                            {
                                title: "Retailers",
                                sub_title: "",
                                type: "datagrid",
                                width: "100%",
                                layout: "horizontal",
                                collapsible: false,
                                datagrid: {
                                    handle: "retailer_grid",        
                                    layout: "fluid",		
                                    height: "",
                                    header: true,
                                    content: true,
                                    footer: true,	
                                    grid_lines: true,								
                                    multi_select: false,
                                    full_row_select: false,
                                    is_main_grid: true,
                                    empty_message: "No retailer mapped for this segment yet.!",
                                    datasource: {endpoint: "/segmentation/v1/segment/:id/retailers", page: 0, populate: false, handler: "dedicated", cached: false},
                                    link: {key: "RetailerId", context: "segment", target_type: "view", view: "segment_form", data: "remote", endpoint: "/segmentation/v1/segment/"},
                                    columns: [
                                        {
                                            show: true, 
                                            width: "5", 
                                            search: false,
                                            filter: false,                                            
                                            classes: "",
                                            header: {title: "", align: "left"}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "#", type: "check", align: "left", editable: false},
                                            prompt: ""
                                        },
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
                                            width: "35",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Retailer Name", align: "left", filterable: false, searchable: true, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "RetailerName", type: "alphanumeric", align: "left", editable: false},
                                            prompt: ""
                                        }, 
                                        {
                                            show: true, 
                                            width: "20",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Mobile Number", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "MobileNumber", type: "alphanumeric", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "20",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Retailer Id", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "RetailerId", type: "alphanumeric", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "10", 
                                            search: false,
                                            filter: false,
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
            footer: {show: false},
            sidebar: null,
            manage: false
        },
        dynamic_retailer_list_form: {
            context: "segment",
            source: "",            
            viewFor: "",            
            context_header: {show: false},           
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
                                type: "tab",
                                width: "100%",
                                layout: "horizontal",
                                tab: {
                                    title: "",                        
                                    handle: "dynamic_retailer_tab",							                                    
                                    position: "top",                                    
                                    default_tab: "mapped_retailer_tab_item",
                                    tabview: true,
                                    type: "fluid",		
                                    width: "100%",  
                                    items: {
                                        mapped_retailer_tab_item: {
                                            custom: false,
                                            icon: "fa fa-store",
                                            title: "Retailers",
                                            context: "segment",					
                                            header: {
                                                show: true,
                                                actions: [                 
                                                    { label: "Blacklist Retailers", theme: "warning", method: "delete", action: "BLACKLIST_RETAILER", classes: "bulk-retailer-removed", icon: "", tabindex : 8, status: true, shortcut: "" },
                                                    { label: "Whitelist Retailers", theme: "primary", method: "post", action: "WHITELIST_RETAILER", classes: "bulk-retailer-added", icon: "", tabindex : 8, status: true, shortcut: "" }
                                                ]
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
                                                                    handle: "retailer_grid",        
                                                                    layout: "fluid",		
                                                                    height: "",
                                                                    header: true,
                                                                    content: true,
                                                                    footer: true,	
                                                                    grid_lines: true,								
                                                                    multi_select: false,
                                                                    full_row_select: false,
                                                                    is_main_grid: true,
                                                                    empty_message: "No retailer mapped for this segment yet.!",
                                                                    datasource: {endpoint: "/segmentation/v1/segment/:id/retailers", page: 0, populate: false, handler: "dedicated", cached: false},
                                                                    link: {key: "RetailerId", context: "segment", target_type: "view", view: "segment_form", data: "remote", endpoint: "/segmentation/v1/segment/"},
                                                                    columns: [
                                                                        {
                                                                            show: true, 
                                                                            width: "5", 
                                                                            search: false,
                                                                            filter: false,                                            
                                                                            classes: "",
                                                                            header: {title: "", align: "left"}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "#", type: "check", align: "left", editable: false},
                                                                            prompt: ""
                                                                        },
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
                                                                            width: "35",
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: {title: "Retailer Name", align: "left", filterable: false, searchable: true, sortable: false}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "RetailerName", type: "alphanumeric", align: "left", editable: false},
                                                                            prompt: ""
                                                                        }, 
                                                                        {
                                                                            show: true, 
                                                                            width: "20",
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: {title: "Mobile Number", align: "left", filterable: false, searchable: false, sortable: false}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "MobileNumber", type: "alphanumeric", align: "left", editable: false},
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true, 
                                                                            width: "20",
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: {title: "Retailer Id", align: "left", filterable: false, searchable: false, sortable: false}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "RetailerId", type: "alphanumeric", align: "left", editable: false},
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true, 
                                                                            width: "10", 
                                                                            search: false,
                                                                            filter: false,
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
                                        },
                                        whitelisted_retailer_tab_item: {
                                            custom: false,
                                            icon: "fa fa-ballot-check",
                                            title: "Whitelisted",
                                            context: "segment",					
                                            header: {
                                                show: true,                                                
                                                actions: [
                                                    { label: "Remove from Whitelist", theme: "warning", method: "post", action: "REMOVE_FROM_WHITELIST", classes: "bulk-retailer-added", icon: "", tabindex : 8, status: true, shortcut: "" }
                                                ]
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
                                                                    handle: "whitelist_retailer_grid",        
                                                                    layout: "fluid",		
                                                                    height: "",
                                                                    header: true,
                                                                    content: true,
                                                                    footer: true,	
                                                                    grid_lines: true,								
                                                                    multi_select: false,
                                                                    full_row_select: false,
                                                                    is_main_grid: true,
                                                                    empty_message: "No whitelisted retailers for this segment yet.!",
                                                                    datasource: {endpoint: "/segmentation/v1/segment/:id/whitelistedRetailers", page: 0, populate: false, handler: "dedicated", cached: false},
                                                                    link: {key: "RetailerId", context: "segment", target_type: "view", view: "segment_form", data: "remote", endpoint: "/segmentation/v1/segment/"},
                                                                    columns: [
                                                                        {
                                                                            show: true, 
                                                                            width: "5", 
                                                                            search: false,
                                                                            filter: false,                                            
                                                                            classes: "",
                                                                            header: {title: "", align: "left"}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "#", type: "check", align: "left", editable: false},
                                                                            prompt: ""
                                                                        },
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
                                                                            width: "35",
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: {title: "Retailer Name", align: "left", filterable: false, searchable: false, sortable: false}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "RetailerName", type: "alphanumeric", align: "left", editable: false},
                                                                            prompt: ""
                                                                        }, 
                                                                        {
                                                                            show: true, 
                                                                            width: "20",
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: {title: "Mobile Number", align: "left", filterable: false, searchable: false, sortable: false}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "MobileNumber", type: "alphanumeric", align: "left", editable: false},
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true, 
                                                                            width: "20",
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: {title: "Retailer Id", align: "left", filterable: false, searchable: false, sortable: false}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "RetailerId", type: "alphanumeric", align: "left", editable: false},
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true, 
                                                                            width: "10", 
                                                                            search: false,
                                                                            filter: false,
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
                                        },
                                        blacklisted_retailer_tab_item: {
                                            custom: false,
                                            icon: "fa fa-store-slash",
                                            title: "Blacklisted",
                                            context: "segment",					
                                            header: {
                                                show: true,
                                                actions: [
                                                    { label: "Remove from Blacklist", theme: "warning", method: "delete", action: "REMOVE_FROM_BLACKLIST", classes: "bulk-retailer-removed", icon: "", tabindex : 8, status: true, shortcut: "" },
                                                ]
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
                                                                    handle: "blacklist_retailer_grid",        
                                                                    layout: "fluid",		
                                                                    height: "",
                                                                    header: true,
                                                                    content: true,
                                                                    footer: true,	
                                                                    grid_lines: true,								
                                                                    multi_select: false,
                                                                    full_row_select: false,
                                                                    is_main_grid: true,
                                                                    empty_message: "No blacklisted retailers for this segment yet.!",
                                                                    datasource: {endpoint: "/segmentation/v1/segment/:id/blacklistedRetailers", page: 0, populate: false, handler: "dedicated", cached: false},
                                                                    link: {key: "RetailerId", context: "segment", target_type: "view", view: "segment_form", data: "remote", endpoint: "/segmentation/v1/segment/"},
                                                                    columns: [
                                                                        {
                                                                            show: true, 
                                                                            width: "5", 
                                                                            search: false,
                                                                            filter: false,                                            
                                                                            classes: "",
                                                                            header: {title: "", align: "left"}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "#", type: "check", align: "left", editable: false},
                                                                            prompt: ""
                                                                        },
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
                                                                            width: "35",
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: {title: "Retailer Name", align: "left", filterable: false, searchable: false, sortable: false}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "RetailerName", type: "alphanumeric", align: "left", editable: false},
                                                                            prompt: ""
                                                                        }, 
                                                                        {
                                                                            show: true, 
                                                                            width: "20",
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: {title: "Mobile Number", align: "left", filterable: false, searchable: false, sortable: false}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "MobileNumber", type: "alphanumeric", align: "left", editable: false},
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true, 
                                                                            width: "20",
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: {title: "Retailer Id", align: "left", filterable: false, searchable: false, sortable: false}, 
                                                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                            field: {handle: "RetailerId", type: "alphanumeric", align: "left", editable: false},
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true, 
                                                                            width: "10", 
                                                                            search: false,
                                                                            filter: false,
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
                                }
                            }
                        ]
                    }
                ]
            },
            footer: {show: false},
            sidebar: null,
            manage: false
        }
    },
    enums: {
        segmentStatus: {
            1: "ready",
            2: "In Progress"
        }
    }

};

export default segment_config;