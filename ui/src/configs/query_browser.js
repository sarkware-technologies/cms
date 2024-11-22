 let query_browser_config = {

    views: {
        main_view: { 

            context_header: {
                show: true,
                title: "Preview",
                breadcrumb: "Preview",
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
        }
    }

}

export default query_browser_config;