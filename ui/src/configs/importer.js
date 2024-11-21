let importer_config = {

    views: {
        main_view: { 
            context_header: {
                show: true,
                title: "Importers",
                breadcrumb: "",
                actions: []
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
                                    handle: "importer_grid",        
                                    layout: "fluid",		
                                    height: "",
                                    header: true,
                                    content: true,
                                    footer: true,	
                                    grid_lines: true,								
                                    multi_select: false,
                                    full_row_select: false,
                                    is_main_grid: true,
                                    empty_message: "No importer configured yet.!",
                                    datasource: {endpoint: "/segmentation/v1/master_import", page: 0, populate: false, handler: "dedicated"},
                                    link: {key: "_id", context: "importer", target_type: "view", view: "importer_form", data: "local", endpoint: "/segmentation/v1/master_import/"},
                                    columns: [
                                        {
                                            show: true, 
                                            width: "5", 
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "S.No", align: "left"}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "#", type: "serial", align: "left", editable: false,},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "45",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Title", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "title", type: "link", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "35", 
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Last Running", align: "right"}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "lastRunning", type: "alphanumeric", align: "right"},
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
                                            field: {handle: "status", type: "alphanumeric", align: "right"},
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
        importer_form: {
            context_header: {
                show: true,
                title: "Auth Type",
                breadcrumb: "title",
                actions: [
                    { label: "Cancel", theme: "secondary", method: "cancel", action: "CANCEL", classes: "icon-left", icon: "fa fa-times", tabindex : 8, status: true, shortcut: "" },
                    { label: "Start Import", theme: "primary", method: "post", action: "START", classes: "icon-left", icon: "fa fa-save", tabindex : 8, status: true, shortcut: "" },
                    { label: "Stop Import", theme: "primary", method: "post", action: "START", classes: "icon-left", icon: "fa fa-save", tabindex : 8, status: true, shortcut: "" }
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
                                title: "Import Parameters",
                                sub_title: "",
                                type: "placeholder",
                                width: "50%",
                                layout: "horizontal",
                                classes: "",
                                placeholder: "importer_option_widget"
                            },
                            {
                                title: "Import Status",
                                sub_title: "",
                                type: "placeholder",
                                width: "50%",
                                layout: "horizontal",
                                classes: "",
                                placeholder: "importer_status_widget"
                            }
                        ]
                    },
                    {
                        seperator: false,
                        columns: [
                            {
                                title: "Import History",
                                sub_title: "",
                                type: "datagrid",
                                width: "100%",
                                layout: "horizontal",
                                collapsible: false,
                                datagrid: {
                                    handle: "importer_history_grid",        
                                    layout: "fluid",		
                                    height: "",
                                    header: true,
                                    content: true,
                                    footer: true,	
                                    grid_lines: true,								
                                    multi_select: false,
                                    full_row_select: false,
                                    is_main_grid: true,
                                    empty_message: "No history data for this importer.!",
                                    datasource: {endpoint: "/segmentation/v1/master_import/importerHistory", page: 0, populate: false, handler: "dedicated", cached: false},
                                    link: {key: "RetailerId", context: "segment", target_type: "view", view: "segment_form", data: "remote", endpoint: "/segmentation/v1/master_import/"},
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
                                            width: "20",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Total Records", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "totalRecord", type: "alphanumeric", align: "left", editable: false},
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
                                            width: "20",
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
                                            width: "20",
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
                                            width: "20",
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
                show: true,
                rows: []
            },
            sidebar: null,
            manage: true 
        }
        
    },
    enums: {}

};

export default importer_config;