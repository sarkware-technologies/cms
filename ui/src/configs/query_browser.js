 let query_browser_config = {

    views: {
        main_view: { 

            context_header: {
                show: true,
                title: "Db Explorer",
                breadcrumb: "Db Explorer",
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
            context: "register",
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
                                            icon: "fa fa-hourglass-half",
                                            title: "Result",
                                            context: "register",					
                                            header: {show: false},                    
                                            content: {show: false},
                                            footer: {show: false}
                                        },
                                        schema_tab: {
                                            custom: false,
                                            icon: "fa fa-hourglass-half",
                                            title: "Schema",
                                            context: "register",					
                                            header: {show: false},                    
                                            content: {show: false},
                                            footer: {show: false}
                                        },
                                        query_tab: {
                                            custom: false,
                                            icon: "fa fa-hourglass-half",
                                            title: "Query",
                                            context: "register",					
                                            header: {show: false},                    
                                            content: {show: false},
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
        }
    }    
}

export default query_browser_config;