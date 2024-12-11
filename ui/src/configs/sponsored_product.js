let sponsored_product_config = {

    views: {
        main_view: { 
            source: "",
            context: "sponsored_product",
            viewFor: "",
            match: ["/sponsored_product"],
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
                                    link: {key: "_id", context: "sponsored_product", target_type: "view", view: "sponsored_product_form", data: "remote", endpoint: "/main/sponsored_product/"},
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
                                            width: "85",
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
            source: "/system/v1/sponsored_product/",
            context: "sponsored_product",
            viewFor: "sponsored_product_grid",
            match: ["/sponsored_product/new", "/sponsored_product/:id"],
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
                                title: "Title",
                                sub_title: "",
                                type: "fields",
                                width: "40%",
                                layout: "horizontal",
                                collapsible: false,
                                classes: "",
                                fields: [                                    
                                    { type: "text", label: "", handle: "title", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" }                                    
                                ]
                            },
                            {
                                title: "Duration",
                                sub_title: "",
                                type: "fields",
                                width: "20%",
                                layout: "horizontal",
                                collapsible: false,
                                classes: "",
                                fields: [                                    
                                    { type: "date", label: "", handle: "from", value : "", placeholder: "From", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" }                                    
                                ]
                            },
                            {
                                title: "",
                                sub_title: "",
                                type: "fields",
                                width: "20%",
                                layout: "horizontal",
                                collapsible: false,
                                classes: "",
                                fields: [                                    
                                    { type: "date", label: "", handle: "to", value : "", placeholder: "To", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" }                                    
                                ]
                            },
                            {
                                title: "Status",
                                sub_title: "",
                                type: "fields",
                                width: "20%",
                                layout: "horizontal",
                                collapsible: false,
                                classes: "",
                                fields: [                                    
                                    { type: "toggle", label: "", handle: "status", value : false, classes : "", mandatory : true, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", validation_message: "" }
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
                                width: "40%",
                                layout: "horizontal",
                                collapsible: false,
                                classes: "",
                                fields: [                                    
                                    { type: "text", label: "MDM Product code", handle: "title", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    { type: "text", label: "Keywords", handle: "handle", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    {
                                        type: "multiselect", 
                                        label: "Segments", 
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

export default sponsored_product_config;