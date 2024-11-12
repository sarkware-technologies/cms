let entity_config = {

    views: {
        main_view: { 
            context_header: {
                show: true,
                title: "Entities",
                breadcrumb: "",
                actions: [{ label: "New Entity", theme: "primary", method: "post", action: "NEW_ENTITY", classes: "icon-left", icon: "fa fa-plus", tabindex : 8, status: true, shortcut: "" }]
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
                                    handle: "entity_grid",        
                                    layout: "fluid",		
                                    height: "",
                                    header: true,
                                    content: true,
                                    footer: true,	
                                    grid_lines: true,								
                                    multi_select: false,
                                    full_row_select: false,
                                    is_main_grid: true,
                                    empty_message: "No entity configured yet.!",
                                    datasource: {endpoint: "/system/v1/entity", page: 0, populate: "", handler: "dedicated"},
                                    link: {key: "_id", context: "entity", target_type: "view", view: "entity_form", data: "remote", endpoint: "/system/v1/entity/"},
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
                                            header: {title: "Title", align: "left", filterable: false, searchable: true, sortable: true}, 
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
                                            header: {title: "Handle", align: "left", filterable: false, searchable: false, sortable: false, filter_type: "simple"}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "handle", type: "alphanumeric", align: "left", editable: false},
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
            manage: false             
        },
        entity_form: {
            context_header: {
                show: true,
                title: "Entity",
                breadcrumb: "title",
                actions: [  
                    { label: "Cancel", theme: "secondary", method: "cancel", action: "CANCEL_ENTITY", classes: "fields-factory-action-cancel icon-left", icon: "fa fa-times", tabindex : 8, status: true, shortcut: "" },
                    { label: "Delete", theme: "danger", method: "delete", action: "DELETE_ENTITY", classes: "fields-factory-action-delete icon-left", icon: "fa fa-trash", tabindex : 8, status: true, shortcut: "" },
                    { label: "Save", theme: "primary", method: "post", action: "SAVE_ENTITY", classes: "fields-factory-action-save icon-left", icon: "fa fa-save", tabindex : 8, status: true, shortcut: "" }
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
                                classes: "flex-remaining-width",
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
                rows: []
            },
            sidebar: null,
            manage: true 
        },
        entity_sidebar_form: {
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
                                title: "Taxonomies",
                                sub_title: "Mapping taxonomies for this Entity",
                                type: "taxonomies",
                                width: "100%",
                                layout: "vertical",
                                classes: "",
                                taxonomy: { handle: "entity_taxonomies", type: "taxonomy", record_key: "entity_grid", endpoint: "/system/v1/entity" }
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
        }
        
    }

};

export default entity_config;