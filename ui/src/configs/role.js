let role_config = {

    views: {
        main_view: { 
            context_header: {
                show: true,
                title: "Roles",
                breadcrumb: "",
                actions: [{ label: "New Role", theme: "primary", action: "NEW_ROLE", classes: "pharmarack-cms-action-new icon-left", icon: "fa fa-plus", tabindex : 8, status: true, shortcut: "" }]
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
                                    handle: "role_grid",        
                                    layout: "fluid",		
                                    height: "",
                                    header: true,
                                    content: true,
                                    footer: true,	
                                    grid_lines: true,								
                                    multi_select: false,
                                    full_row_select: false,
                                    is_main_grid: true,
                                    empty_message: "No role configured yet.!",
                                    datasource: {endpoint: "/system/roles", page: 0, populate: false, handler: "dedicated"},
                                    link: {key: "_id", context: "role", target_type: "view", view: "role_form", data: "remote", endpoint: "/system/role/"},
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
                                            width: "95",
                                            search: false,
                                            filter: false,
                                            header: {title: "Title", align: "left", filterable: false, searchable: true, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "title", type: "link", align: "left", editable: false},
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
        role_form: {
            context_header: {
                show: true,
                title: "Role",
                breadcrumb: "title",
                actions: [
                    { label: "Cancel", theme: "secondary", action: "CANCEL_ROLE", classes: "icon-left", icon: "fa fa-times", tabindex : 8, status: true, shortcut: "" },
                    { label: "Save", theme: "primary", action: "SAVE_ROLE", classes: "icon-left", icon: "fa fa-save", tabindex : 8, status: true, shortcut: "" }
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
                                    { type: "text", label: "Title", handle: "title", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    { type: "text", label: "Handle", handle: "handle", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    { type: "select", label: "Auth Type", handle: "auth_type", value : "1", value_key: "value", label_key: "label", options: [{label: "PASSWORD", value: "1", selected: true, disabled: false},{label: "OTP", value: "2", selected: false, disabled: false}], classes : "", mandatory : true, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", prompt_message: "", validation_message: "", source: "local", endpoint: "" }
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

export default role_config;