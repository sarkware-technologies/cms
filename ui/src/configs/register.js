let register_config = {

    views: {
        main_view: { 
            context_header: {
                show: true,
                title: "Registers",
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
                        type: "tab",
                        width: "100%",
                        layout: "horizontal",
                        tab: {
                            title: "",                        
                            handle: "pending_tab",							                                    
                            position: "top",                                    
                            default_tab: "pending_tab",
                            tabview: true,
                            type: "fluid",		
                            width: "100%",  
                            items: {
                                pending_tab: {
                                    custom: false,
                                    icon: "fa fa-hourglass-half",
                                    title: "Pendings",					
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
                                                            handle: "register_pending_grid",        
                                                            layout: "fluid",		
                                                            height: "",
                                                            header: true,
                                                            content: true,
                                                            footer: true,	
                                                            grid_lines: true,								
                                                            multi_select: false,
                                                            full_row_select: false,
                                                            is_main_grid: true,
                                                            empty_message: "No register submitted yet.!",
                                                            datasource: {endpoint: "/system/registers?populate=true&isApproved=null", page: 0, populate: false, handler: "dedicated"},
                                                            link: {key: "_id", context: "register", target_type: "view", view: "register_form", data: "remote", endpoint: "/system/register/"},
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
                                                                    width: "22",
                                                                    search: false,
                                                                    filter: false,
                                                                    header: {title: "Full Name", align: "left", filterable: false, searchable: true, sortable: false}, 
                                                                    footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                    field: {handle: "fullName", type: "link", align: "left", editable: false},
                                                                    prompt: ""
                                                                },
                                                                {
                                                                    show: true, 
                                                                    width: "22",
                                                                    search: false,
                                                                    filter: false,
                                                                    header: {title: "Email Id", align: "left", filterable: false, searchable: false, sortable: false}, 
                                                                    footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                    field: {handle: "email", type: "alphanumeric", align: "left", editable: false},
                                                                    prompt: ""
                                                                },
                                                                {
                                                                    show: true, 
                                                                    width: "11",
                                                                    search: false,
                                                                    filter: false,
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
                                                                    header: {title: "User Type", align: "left", filterable: false, searchable: false, sortable: false}, 
                                                                    footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                    field: {handle: "userType", type: "search", label_key: "title", value_key: "_id"},
                                                                    prompt: ""
                                                                },
                                                                {
                                                                    show: true, 
                                                                    width: "10",
                                                                    search: false,
                                                                    filter: false,
                                                                    header: {title: "Edit", align: "center", filterable: false, searchable: false, sortable: false}, 
                                                                    footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                    field: {handle: "", type: "button", label: "Edit", action: "EDIT", align: "center", icon: "fa fa-edit", classes: "icon-right edit-btn"},
                                                                    prompt: ""
                                                                },
                                                                {
                                                                    show: true, 
                                                                    width: "10",
                                                                    search: false,
                                                                    filter: false,
                                                                    header: {title: "Approve", align: "center", filterable: false, searchable: false, sortable: false}, 
                                                                    footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                    field: {handle: "", type: "button", label: "Approve", action: "APPROVE", align: "center", icon: "", classes: "icon-left approve-btn"},
                                                                    prompt: ""
                                                                },
                                                                {
                                                                    show: true, 
                                                                    width: "10",
                                                                    search: false,
                                                                    filter: false,
                                                                    header: {title: "Reject", align: "center", filterable: false, searchable: false, sortable: false}, 
                                                                    footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                    field: {handle: "", type: "button", label: "Reject", action: "REJECT", align: "center", icon: "", classes: "icon-left reject-btn"},
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
                                approved_tab: {
                                    custom: false,
                                    icon: "fa fa-thumbs-up",
                                    title: "Approved",					
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
                                                            handle: "register_approved_grid",        
                                                            layout: "fluid",		
                                                            height: "",
                                                            header: true,
                                                            content: true,
                                                            footer: true,	
                                                            grid_lines: true,								
                                                            multi_select: false,
                                                            full_row_select: false,
                                                            is_main_grid: true,
                                                            empty_message: "No approved register yet.!",
                                                            datasource: {endpoint: "/system/registers?populate=true&&isApproved=true", page: 0, populate: false, handler: "dedicated"},
                                                            link: {key: "_id", context: "register", target_type: "view", view: "register_form", data: "remote", endpoint: "/system/register/"},
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
                                                                    width: "32",
                                                                    search: false,
                                                                    filter: false,
                                                                    header: {title: "Full Name", align: "left", filterable: false, searchable: true, sortable: false}, 
                                                                    footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                    field: {handle: "fullName", type: "link", align: "left", editable: false},
                                                                    prompt: ""
                                                                },
                                                                {
                                                                    show: true, 
                                                                    width: "32",
                                                                    search: false,
                                                                    filter: false,
                                                                    header: {title: "Email Id", align: "left", filterable: false, searchable: false, sortable: false}, 
                                                                    footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                    field: {handle: "email", type: "alphanumeric", align: "left", editable: false},
                                                                    prompt: ""
                                                                },
                                                                {
                                                                    show: true, 
                                                                    width: "15",
                                                                    search: false,
                                                                    filter: false,
                                                                    header: {title: "Mobile", align: "left", filterable: false, searchable: false, sortable: false}, 
                                                                    footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                    field: {handle: "mobile", type: "alphanumeric", align: "left", editable: false},
                                                                    prompt: ""
                                                                },
                                                                {
                                                                    show: true, 
                                                                    width: "16",
                                                                    search: false,
                                                                    filter: false,
                                                                    header: {title: "User Type", align: "left", filterable: false, searchable: false, sortable: false}, 
                                                                    footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                    field: {handle: "userType", type: "search", label_key: "title", value_key: "_id"},
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
                                rejected_tab: {
                                    custom: false,
                                    icon: "fa fa-thumbs-down",
                                    title: "Rejected",					
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
                                                            handle: "register_rejected_grid",        
                                                            layout: "fluid",		
                                                            height: "",
                                                            header: true,
                                                            content: true,
                                                            footer: true,	
                                                            grid_lines: true,								
                                                            multi_select: false,
                                                            full_row_select: false,
                                                            is_main_grid: true,
                                                            empty_message: "No rejected register yet.!",
                                                            datasource: {endpoint: "/system/registers?populate=true&&isApproved=false", page: 0, populate: false, handler: "dedicated"},
                                                            link: {key: "_id", context: "register", target_type: "view", view: "register_form", data: "remote", endpoint: "/system/register/"},
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
                                                                    width: "32",
                                                                    search: false,
                                                                    filter: false,
                                                                    header: {title: "Full Name", align: "left", filterable: false, searchable: true, sortable: false}, 
                                                                    footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                    field: {handle: "fullName", type: "link", align: "left", editable: false},
                                                                    prompt: ""
                                                                },
                                                                {
                                                                    show: true, 
                                                                    width: "32",
                                                                    search: false,
                                                                    filter: false,
                                                                    header: {title: "Email Id", align: "left", filterable: false, searchable: false, sortable: false}, 
                                                                    footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                    field: {handle: "email", type: "alphanumeric", align: "left", editable: false},
                                                                    prompt: ""
                                                                },
                                                                {
                                                                    show: true, 
                                                                    width: "15",
                                                                    search: false,
                                                                    filter: false,
                                                                    header: {title: "Mobile", align: "left", filterable: false, searchable: false, sortable: false}, 
                                                                    footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                    field: {handle: "mobile", type: "alphanumeric", align: "left", editable: false},
                                                                    prompt: ""
                                                                },
                                                                {
                                                                    show: true, 
                                                                    width: "16",
                                                                    search: false,
                                                                    filter: false,
                                                                    header: {title: "User Type", align: "left", filterable: false, searchable: false, sortable: false}, 
                                                                    footer: {title: "", type: "none", total_type: "none", align: "left"},
                                                                    field: {handle: "userType", type: "search", label_key: "title", value_key: "_id"},
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
        register_form: {
            context_header: {
                show: true,
                title: "Register",
                breadcrumb: "title",
                actions: [
                    { label: "Cancel", theme: "secondary", method: "cancel", action: "CANCEL_REGISTER", classes: "icon-left", icon: "fa fa-times", tabindex : 8, status: true, shortcut: "" },
                    { label: "Save", theme: "primary", method: "post", action: "SAVE_REGISTER", classes: "icon-left", icon: "fa fa-save", tabindex : 8, status: true, shortcut: "" }
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
                                    { type: "text", label: "Name", handle: "fullName", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    { type: "text", label: "Email", handle: "email", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    { type: "number", label: "Mobile", handle: "mobile", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    { type: "select", label: "User Type", handle: "userType", value : "1", value_key: "_id", label_key: "title", options: [], placeholder: "-- Select User Type --", classes : "", mandatory : true, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", prompt_message: "", validation_message: "", source: "remote", endpoint: "/system/register/user-types" },
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

export default register_config;