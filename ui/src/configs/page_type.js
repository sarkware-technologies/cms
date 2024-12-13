let page_type_config = {

    routes: {
        main_view: ['/page_type'],
        page_type_form: ["/page_type/new", "/page_type/:id"],        
    },
    views: {
        main_view: { 
            context: "page_type",
            source: "",            
            viewFor: "",            
            context_header: {
                show: true,
                title: "Page Types",
                breadcrumb: "",
                actions: [
                    { label: "Invalidate All Cache", theme: "warning", method: "post", action: "INVALIDATE_ALL_CACHE", classes: "pharmarack-cms-action-new icon-left", icon: "fa fa-broom", tabindex : 8, status: true, shortcut: "" },
                    { type: "link", label: "New Page Type", theme: "primary", method: "post", action: "/page_type/new", classes: "pharmarack-cms-action-new icon-left", icon: "fa fa-plus", tabindex : 8, status: true, shortcut: "" }
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
                                type: "datagrid",
                                width: "100%",
                                layout: "horizontal",
                                collapsible: false,
                                datagrid: {
                                    handle: "page_type_grid",        
                                    layout: "fluid",		
                                    height: "",
                                    header: true,
                                    content: true,
                                    footer: true,	
                                    grid_lines: true,								
                                    multi_select: false,
                                    full_row_select: false,
                                    is_main_grid: true,
                                    empty_message: "No page configured yet.!",
                                    datasource: {endpoint: "/system/v1/api/page/page_type/list", page: 0, populate: false, handler: "default"},
                                    link: {key: "_id", context: "page_type", target_type: "view", view: "page_type_form", data: "remote", endpoint: "/page_type/"},
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
                                            width: "90",
                                            search: false,
                                            filter: false,
                                            classes: "",
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
        page_type_form: {
            context: "page_type",
            source: "/system/v1/api/page/page_type/record?id=",            
            viewFor: "page_type_grid",            
            context_header: {
                show: true,
                title: "Page Type",
                breadcrumb: "title",
                actions: [
                    { label: "Invalidate Cache", theme: "warning", method: "post", action: "INVALIDATE_CACHE", classes: "pharmarack-cms-action-new icon-left", icon: "fa fa-broom", tabindex : 8, status: true, shortcut: "" },
                    { label: "Cancel", theme: "secondary", method: "cancel", action: "BACK", classes: "icon-left", icon: "fa fa-times", tabindex : 8, status: true, shortcut: "" },
                    { label: "Save", theme: "primary", method: "post", action: "SAVE_PAGE_TYPE", classes: "icon-left", icon: "fa fa-save", tabindex : 8, status: true, shortcut: "" }
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
        }
        
    }

};

export default page_type_config;