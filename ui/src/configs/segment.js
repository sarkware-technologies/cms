let auth_type_config = {

    views: {
        main_view: { 
            context_header: {
                show: true,
                title: "Segments",
                breadcrumb: "",
                actions: [{ label: "New Segment", theme: "primary", method: "post", action: "NEW_SEGMENT", classes: "pharmarack-cms-action-new icon-left", icon: "fa fa-plus", tabindex : 8, status: true, shortcut: "" }]
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
                                    handle: "segment_grid",        
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
                                    datasource: {endpoint: "/system/segments", page: 0, populate: false, handler: "dedicated"},
                                    link: {key: "_id", context: "segment", target_type: "view", view: "segment_form", data: "remote", endpoint: "/system/segment/"},
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
                                            width: "65",
                                            search: false,
                                            filter: false,
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
                                            header: {title: "Is Active", align: "right"}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "isActive", type: "toggle", align: "right", key_field: "_id", title_key: "title"},
                                            prompt: ""
                                        },
                                        {
                                            show: true, 
                                            width: "15", 
                                            search: false,
                                            filter: false,
                                            header: {title: "Status", align: "right"}, 
                                            footer: {title: "", type: "none", total_type: "none", align: "left"},
                                            field: {handle: "status", type: "toggle", align: "right", key_field: "_id", title_key: "title"},
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
        segment_form: {
            context_header: {
                show: true,
                title: "Segment",
                breadcrumb: "title",
                actions: [
                    { label: "Cancel", theme: "secondary", method: "cancel", action: "CANCEL_SEGMENT", classes: "icon-left", icon: "fa fa-times", tabindex : 8, status: true, shortcut: "" },
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
                                                                                    { type: "text", label: "", handle: "title", value : "", placeholder: "Segment Name", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },                                                                    
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
                                                                                                    { type: "date", label: "", handle: "from", value : "", placeholder: "From", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
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
                                                                                                    { type: "date", label: "", handle: "to", value : "", placeholder: "To", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
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
                                                                            },
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
                                                                                title: "Sales",
                                                                                sub_title: "",
                                                                                type: "fields",
                                                                                width: "100%",
                                                                                layout: "horizontal",
                                                                                classes: "",
                                                                                fields: [                                                                        
                                                                                    { type: "radio", label: "", handle: "orderStatus", value : "1", value_key: "value", label_key: "label", choices: [{label: "Product", value: "1", selected: true, disabled: false},{label: "Brand", value: "2", selected: false, disabled: false}], layout: "horizontal", classes : "", mandatory : true, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", prompt_message: "", validation_message: "", source: "local", endpoint: "" },
                                                                                    { type: "check", label: "Order Status", handle: "type", value : "1", value_key: "value", label_key: "label", choices: [{label: "Placed", value: "1", selected: true, disabled: false},{label: "Processed", value: "2", selected: false, disabled: false},{label: "Uploaded", value: "3", selected: false, disabled: false}], layout: "horizontal", classes : "", mandatory : true, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", prompt_message: "", validation_message: "", source: "local", endpoint: "" },
                                                                                ]
                                                                            },
                                                                            {
                                                                                title: "",
                                                                                sub_title: "",
                                                                                type: "placeholder",
                                                                                width: "50%",
                                                                                layout: "horizontal",
                                                                                collapsible: false,
                                                                                classes: "",
                                                                                placeholder: "segment_rules_container"
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
                                                                                    { type: "radio", label: "", handle: "type", value : "1", value_key: "value", label_key: "label", choices: [{label: "All", value: "1", selected: true, disabled: false},{label: "Only Authorized", value: "2", selected: false, disabled: false}], layout: "horizontal", classes : "", mandatory : true, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", prompt_message: "", validation_message: "", source: "local", endpoint: "" },
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
                                                                                        value_key: "RetailerId", 
                                                                                        label_key: "RetailerName", 
                                                                                        source: "remote",
                                                                                        endpoint: "/system/api/segment/segment/multi_select_list?entity=retailer&select=_id|RetailerId|RetailerName"
                                                                                    },                                                             
                                                                                    { type: "radio", label: "", handle: "distributorStatus", value : "1", value_key: "value", label_key: "label", choices: [{label: "All", value: "1", selected: true, disabled: false},{label: "Only Authorized", value: "2", selected: false, disabled: false}], layout: "horizontal", classes : "", mandatory : true, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", prompt_message: "", validation_message: "", source: "local", endpoint: "" },
                                                                                    {
                                                                                        type: "multiselect", 
                                                                                        label: "Exclude distributors", 
                                                                                        handle: "distributors", 
                                                                                        value : "", 
                                                                                        parents: {},
                                                                                        placeholder: "Select Distributors", 
                                                                                        searchprompt: "Search for distributors",
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
                                                                                        value_key: "RetailerId", 
                                                                                        label_key: "RetailerName", 
                                                                                        source: "remote",
                                                                                        endpoint: "/system/api/segment/segment/multi_select_list?entity=retailer&select=_id|RetailerId|RetailerName"
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
                                                        },
                                                        static_segment_tab: { 
                                                            custom: false,                                                       
                                                            icon: "",
                                                            title: "Static",					                                                                         
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
                                                                                        value_key: "RetailerId", 
                                                                                        label_key: "RetailerName", 
                                                                                        source: "remote",
                                                                                        endpoint: "/system/api/component/component/multi_select_list?entity=retailer&select=_id|RetailerId|RetailerName"
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
                show: true,
                rows: []
            },
            sidebar: null,
            manage: true 
        }        
    },
    enums: {}

};

export default auth_type_config;