 let query_browser_config = {

    views: {
        main_view: { 
            context: "query_browser",
            context_header: {
                show: true,
                title: "Db Explorer",
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
                        columns: [
                            {
                                type: "none"
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
        query_result_view: { 
            context: "query_browser",
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
                                    handle: "query_result_tab",							                                    
                                    position: "top",                                    
                                    default_tab: "result_tab",
                                    tabview: true,
                                    type: "fluid",		
                                    width: "100%",  
                                    items: {
                                        result_tab: {
                                            custom: false,
                                            icon: "fa fa-box",
                                            title: "Result",
                                            context: "query_browser",					
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
                                                                type: "view",
                                                                width: "100%",
                                                                layout: "horizontal",
                                                                classes: "",
                                                                view: "db_result_view"
                                                            }
                                                        ]
                                                    }
                                                ]
                                            },
                                            footer: {show: false}
                                        },
                                        schema_tab: {
                                            custom: false,
                                            icon: "fa fa-table-tree",
                                            title: "Schema",
                                            context: "query_browser",					
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
                                                                type: "view",
                                                                width: "100%",
                                                                layout: "horizontal",
                                                                classes: "",
                                                                view: "db_schema_view"
                                                            }
                                                        ]
                                                    }
                                                ]
                                            },
                                            footer: {show: false}
                                        },
                                        query_tab: {
                                            custom: false,
                                            icon: "fa fa-clipboard",
                                            title: "Query",
                                            context: "query_browser",					
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
                                                                type: "view",
                                                                width: "100%",
                                                                layout: "horizontal",
                                                                classes: "",
                                                                view: "db_query_view"
                                                            }
                                                        ]
                                                    }
                                                ]
                                            },
                                            footer: {show: false}
                                        }
                                    }
                                }
                            }
                        ]
                    }
                ]
            },
            footer: {show: false}
        },
        db_result_view: { 
            context: "query_browser",
            context_header: {show: false},           
            header: {show: false},
            content: {
                show: true,
                rows: [
                    {
                        columns: [
                            {
                                type: "none"
                            }
                        ]
                    }                    
                ]                
            },
            footer: {show: false},
            sidebar: null,
            manage: false
        },
        db_schema_view: { 
            context: "query_browser",
            context_header: {show: false},           
            header: {show: false},
            content: {
                show: true,
                rows: [
                    {
                        columns: [
                            {
                                type: "none"
                            }
                        ]
                    }                    
                ]                
            },
            footer: {show: false},
            sidebar: null,
            manage: false
        },
        db_query_view: { 
            context: "query_browser",
            context_header: {show: false},           
            header: {show: false},
            content: {
                show: true,
                rows: [
                    {
                        columns: [
                            {
                                title: "",
                                sub_title: "",
                                type: "fields",
                                width: "100%",
                                layout: "horizontal",
                                collapsible: false,
                                classes: "",
                                fields: [
                                    { type: "textarea", label: "", handle: "query", value : "", placeholder: "", classes : "", mandatory : true, pattern: "", disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },                                    
                                    { type: "button", label: "Execute", theme: "primary", action: "EXECUTE", classes: "icon-left", icon: "fa fa-play", tabindex : 8, status: true, shortcut: "" }
                                ]
                            }
                        ]
                    }                    
                ]                
            },
            footer: {show: false},
            sidebar: null,
            manage: false
        }
    }    
}

export default query_browser_config;