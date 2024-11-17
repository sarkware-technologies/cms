let company_config = {

    views: {
        main_view: { 
            context_header: {
                show: true,
                title: "Companies",
                breadcrumb: "",
                actions: [{ label: "New Company", theme: "primary", action: "NEW_COMPANY", classes: "fields-factory-action-new icon-left", icon: "fa fa-plus", tabindex : 8, status: true, shortcut: "" }]
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
                                datagrid: {
                                    handle: "company_grid",        
                                    layout: "fluid",		
                                    height: "",
                                    header: true,
                                    content: true,
                                    footer: true,	
                                    grid_lines: true,								
                                    multi_select: false,
                                    full_row_select: false,
                                    is_main_grid: true,
                                    empty_message: "No brand configured yet.!",
                                    datasource: {endpoint: "/system/api/master/company/list", page: 0, populate: false, handler: "default"},
                                    link: {key: "_id", context: "company", target_type: "view", view: "company_form", data: "remote", endpoint: "/system/api/master/company/record?id="},
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
                                            width: "70",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Company Name", align: "left", filterable: false, searchable: true, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "CompanyName", type: "link", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "20", 
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Company Id", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "CompanyId", type: "alphanumeric", align: "left", editable: false},
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
        company_form: {
            context_header: {
                show: true,
                title: "Company",
                breadcrumb: "title",
                actions: [
                    { label: "Cancel", theme: "secondary", action: "CANCEL_COMPANY", classes: "icon-left", icon: "fa fa-times", tabindex : 8, status: true, shortcut: "" },
                    { label: "Save", theme: "primary", action: "SAVE_COMPANY", classes: "icon-left", icon: "fa fa-save", tabindex : 8, status: true, shortcut: "" }
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
                                width: "10%",
                                layout: "horizontal",
                                classes: "",
                                fields: [                                                                        
                                    { type: "toggle", label: "Is Approved", handle: "IsApproved", value : false, classes : "", mandatory : true, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", validation_message: "" }                                    
                                ]
                            },
                            {
                                title: "",
                                sub_title: "",
                                type: "fields",
                                width: "10%",
                                layout: "horizontal",
                                classes: "",
                                fields: [                                                                                                            
                                    { type: "toggle", label: "Is Deleted", handle: "IsDeleted", value : false, classes : "", mandatory : true, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", validation_message: "" }
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
                                type: "fields",
                                width: "50%",
                                layout: "horizontal",
                                classes: "",
                                fields: [                                    
                                    { type: "text", label: "Company Name", handle: "CompanyName", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    { type: "text", label: "Company Id", handle: "CompanyId", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" }                                    
                                ]
                            }
                        ]
                    }      
                ]
            },
            footer: {
                show: true,
                rows: [
                    {
                        seperator: false,
                        columns: [
                            {
                                title: "Products",
                                sub_title: "Products that belongs to this brand",
                                type: "datagrid",
                                width: "50%",
                                layout: "horizontal",
                                datagrid: {
                                    handle: "product_grid",        
                                    layout: "fluid",		
                                    height: "",
                                    header: true,
                                    content: true,
                                    footer: true,	
                                    grid_lines: true,								
                                    multi_select: false,
                                    full_row_select: false,
                                    is_main_grid: true,
                                    empty_message: "No product found for this company.!",
                                    datasource: {endpoint: "/system/api/master/company/products?id=", page: 0, populate: false, handler: "default"},
                                    link: {key: "_id", context: "company", target_type: "view", view: "company_form", data: "remote", endpoint: "/system/api/master/company/products?id="},
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
                                            header: {title: "Product Name", align: "left", filterable: false, searchable: true, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "PRODUCT_NAME", type: "link", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "20", 
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Product Code", align: "left", filterable: false, searchable: false, sortable: false, filter_type: "simple"}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "MDM_PRODUCT_CODE", type: "alphanumeric", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "10", 
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Mrp", align: "left", filterable: false, searchable: false, sortable: false, filter_type: "simple"}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "MRP", type: "alphanumeric", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "10", 
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Ptr", align: "left", filterable: false, searchable: false, sortable: false, filter_type: "simple"}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "PTR", type: "alphanumeric", align: "left", editable: false},
                                            prompt: ""
                                        }                                
                                    ]
                                }
                            }
                        ]
                    }
                ]
            },
            sidebar: null,
            manage: true 
        }
        
    }

};

export default company_config;