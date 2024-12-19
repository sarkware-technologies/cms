let sponsored_product_config = {

    routes: {
        main_view: ['/sponsored_product'],
        sponsored_product_form: ["/sponsored_product/new", "/sponsored_product/:id"],   
    },
    views: {
        main_view: { 
            context: "sponsored_product",
            source: "",            
            viewFor: "",            
            context_header: {
                show: true,
                title: "Sponsored Products",
                breadcrumb: "",
                actions: [{ type: "link", label: "Add New", theme: "primary", method: "post", action: "/sponsored_product/new", classes: "pharmarack-cms-action-new icon-left", icon: "fa fa-plus", tabindex : 8, status: true, shortcut: "" }]
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
                                    handle: "sponsored_product_grid",        
                                    layout: "fluid",		
                                    height: "",
                                    header: true,
                                    content: true,
                                    footer: true,	
                                    grid_lines: true,								
                                    multi_select: false,
                                    full_row_select: false,
                                    is_main_grid: true,
                                    empty_message: "No sponsored product configured yet.!",
                                    datasource: {endpoint: "/system/v1/sponsored_product", page: 0, populate: false, handler: "dedicated"},
                                    link: {key: "_id", context: "sponsored_product", target_type: "view", view: "sponsored_product_form", data: "remote", endpoint: "/sponsored_product/"},
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
                                            width: "15",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Mdm Product Name", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "mdmProductCode", type: "alphanumeric", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "15",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Valid From", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "validFrom", type: "date", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "15",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Valid Upto", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "validUpto", type: "date", align: "left", editable: false},
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
        sponsored_product_form: {
            context: "sponsored_product",
            source: "/system/v1/sponsored_product/",            
            viewFor: "sponsored_product_grid",            
            context_header: {
                show: true,
                title: "Sponsored Product",
                breadcrumb: "title",
                actions: [
                    { label: "Cancel", theme: "secondary", method: "cancel", action: "BACK", classes: "icon-left", icon: "fa fa-times", tabindex : 8, status: true, shortcut: "" },
                    { label: "Save", theme: "primary", method: "post", action: "SAVE_SPONSORED_PRODUCT", classes: "icon-left", icon: "fa fa-save", tabindex : 8, status: true, shortcut: "" }
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
                                width: "40%",
                                layout: "horizontal",
                                collapsible: false,
                                classes: "",
                                fields: [                                    
                                    { type: "toggle", label: "Status", handle: "status", value : false, classes : "", mandatory : true, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", validation_message: "" },
                                    { type: "text", label: "Title", handle: "title", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    { type: "date", label: "Valid From", handle: "validFrom", value : "", placeholder: "From", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    { type: "date", label: "Valid Upto", handle: "validUpto", value : "", placeholder: "To", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    //{ type: "text", label: "MDM Product code", handle: "mdmProductCode", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    { 
                                        type: "search", 
                                        label: "Mdm Product Code", 
                                        handle: "mdmProductCode", 
                                        value : "", 
                                        placeholder: "Search mdm product codes", 
                                        searchprompt: "Mdm product codes",
                                        search_class: "", 
                                        popup_class: "",
                                        mandatory: true, 
                                        readonly: false, 
                                        disabled: false, 
                                        tabindex: 1, 
                                        align: "right", 
                                        label_width: 0, 
                                        label_position: "top",          
                                        validation_message: "", 
                                        value_key: "MDM_PRODUCT_CODE", 
                                        label_key: "ProductName", 
                                        datasource: {endpoint: "/segmentation/v1/api/segment/segment/multi_select_list?entity=mdms", cached: false, recordsPerPage: 10}
                                    },
                                    {
                                        type: "multiselect", 
                                        label: "Segments", 
                                        handle: "segments", 
                                        value : "", 
                                        parents: {},
                                        placeholder: "Segments", 
                                        searchprompt: "Search for segments",
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
                                        endpoint: "/system/v1/api/component/component/multi_select_list?entity=cms_segment"
                                    },
                                    { type: "placeholder", placeholder: "sponsored_product_keyword_container", classes : "", label_width: 0, label_position: "top" },
                                ]
                            },
                            {
                                title: "",
                                sub_title: "",
                                type: "fields",
                                width: "60%",
                                layout: "horizontal",
                                collapsible: false,
                                classes: "",
                                fields: [                                                                        
                                    { type: "placeholder", placeholder: "sponsored_product_analytics_container", classes : "", label_width: 0, label_position: "top" },
                                    { type: "view", value: "analytic_grid_view", classes : "", label_width: 0, label_position: "top" },
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
        analytic_grid_view: { 
            context: "sponsored_product",
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
                                title: "Performance",
                                sub_title: "",
                                type: "datagrid",
                                width: "100%",
                                layout: "horizontal",
                                collapsible: false,
                                datagrid: {
                                    handle: "sponsored_product_analytic_grid",        
                                    layout: "fluid",		
                                    height: "",
                                    header: true,
                                    content: true,
                                    footer: true,	
                                    grid_lines: true,								
                                    multi_select: false,
                                    full_row_select: false,
                                    is_main_grid: true,
                                    empty_message: "No analytic data to be show.!",
                                    datasource: {endpoint: "/system/v1/sponsored_product/:id/performance", page: 0, populate: false, handler: "dedicated"},
                                    link: {key: "_id", context: "sponsored_product", target_type: "view", view: "sponsored_product_form", data: "remote", endpoint: "/sponsored_product/"},
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
                                            width: "45",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Keyword", align: "left", filterable: false, searchable: true, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "keyword", type: "alphanumeric", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "15",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Impression", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "impression", type: "alphanumeric", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "15",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "In Cart", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "addedToCart", type: "alphanumeric", align: "left", editable: false},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "15",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: {title: "Ordered", align: "left", filterable: false, searchable: false, sortable: false}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "ordered", type: "alphanumeric", align: "left", editable: false},
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
        }
    },
    enums: {}

};

export default sponsored_product_config;