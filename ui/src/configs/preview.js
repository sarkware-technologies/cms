let preview_config = {

    routes: {
        main_view: ['/preview']      
    },
    views: {
        main_view: { 
            context: "preview",
            source: "",            
            viewFor: "",            
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

export default preview_config;