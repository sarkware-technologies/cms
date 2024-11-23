let preview_config = {

    views: {
        main_view: { 
            context: "preview",
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