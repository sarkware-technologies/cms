let user_config = {

    views: {
        main_view: { 
            context_header: {
                show: true,
                title: "Users",
                breadcrumb: "",
                actions: [{ label: "New User", theme: "primary", method: "post", action: "NEW_USER", classes: "pharmarack-cms-action-new icon-left", icon: "fa fa-user-plus", tabindex : 8, status: true, shortcut: "" }]
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
                                    handle: "user_grid",        
                                    layout: "fluid",		
                                    height: "",
                                    header: true,
                                    content: true,
                                    footer: true,	
                                    grid_lines: true,								
                                    multi_select: false,
                                    full_row_select: false,
                                    is_main_grid: true,
                                    empty_message: "No user configured yet.!",
                                    datasource: {endpoint: "/system/v1/user", page: 0, populate: false, handler: "dedicated"},
                                    link: {key: "_id", context: "user", target_type: "view", view: "user_form", data: "remote", endpoint: "/system/v1/user/"},
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
                                            width: "40",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Full Name", align: "left", filterable: false, searchable: true, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "fullName", type: "link", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "25",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Email Id", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "email", type: "alphanumeric", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "20",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Mobile", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "mobile", type: "alphanumeric", align: "left", editable: false},
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
            manage: true             
        },
        user_form: {
            context_header: {
                show: true,
                title: "User",
                breadcrumb: "title",
                actions: [
                    { label: "Cancel", theme: "secondary", method: "cancel", action: "CANCEL_USER", classes: "icon-left", icon: "fa fa-times", tabindex : 8, status: true, shortcut: "" },
                    { label: "Save", theme: "primary", method: "post", action: "SAVE_USER", classes: "icon-left", icon: "fa fa-save", tabindex : 8, status: true, shortcut: "" }
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
                                    { type: "text", label: "Full Name", handle: "fullName", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    { type: "text", label: "Email", handle: "email", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    { type: "number", label: "Mobile", handle: "mobile", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },                                    
                                    {
                                        type: "multiselect", 
                                        label: "", 
                                        handle: "c", 
                                        value : "", 
                                        parents: {},
                                        placeholder: "Select Roles", 
                                        searchprompt: "Search for roles",
                                        search_class: "", 
                                        popup_class: "",
                                        mandatory: true, 
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
                                        label_key: "title", 
                                        source: "remote",
                                        endpoint: "/system/v1/register/user-types"
                                    }
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
        
    },
    enums: {}

};

export default user_config;