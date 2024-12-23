let user_config = {

    routes: {
        main_view: ['/api_manager'],
        ab_testing_form: ['/api_manager/new','/api_manager/:id'],
        mapping_screen: ['/api_manager/mapping/:id'],
        api_list: ["/api_manager/apilist/list"],
        add_api_form: ["/api_manager/apilist/list/new","/api_manager/apilist/list/:id"],
        build_list: ["/api_manager/build/list"],
        build_form: ["/api_manager/build/list/new","/api_manager/build/list/:id"],
    },

    views: {
        main_view: {
            context: "api_manager",
            context_header: {
                show: true,
                title: "AB TESTING LIST",
                breadcrumb: "",
                actions: [
                    { type: "link", label: "NEW AB TESTING", theme: "primary", method: "post", action: '/api_manager/new', classes: "pharmarack-cms-action-new icon-left", icon: "fa fa-road", tabindex: 8, status: true, shortcut: "" },
                    { type: "link", label: "API LIST", theme: "primary", method: "post", action: "/api_manager/apilist/list", classes: "pharmarack-cms-action-new icon-left", icon: "fa fa-road", tabindex: 8, status: true, shortcut: "" },
                    { type: "link", label: "BUILD LIST", theme: "primary", method: "post", action: "/api_manager/build/list", classes: "pharmarack-cms-action-new icon-left", icon: "fa fa-road", tabindex: 8, status: true, shortcut: "" },
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
                                    handle: "ab_tesing_mapping",
                                    layout: "fluid",
                                    height: "",
                                    header: true,
                                    content: true,
                                    footer: true,
                                    grid_lines: true,
                                    multi_select: false,
                                    full_row_select: false,
                                    is_main_grid: true,
                                    empty_message: "No user configured yet.!",
                                    datasource: { endpoint: "/system/v1/api_manager/ablist/list/pagination?populate=type", page: 0, populate: false, handler: "default" },
                                    link: { key: "_id", context: "api_manager", target_type: "view", data: "remote", endpoint: "/api_manager/mapping/" },
                                    columns: [
                                        {
                                            show: true,
                                            width: "5",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: { title: "S.No", align: "left" },
                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                            field: { handle: "#", type: "serial", align: "left", editable: false, },
                                            prompt: ""
                                        },
                                        {
                                            show: true,
                                            width: "40",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: { title: "Test Name", align: "left", filterable: false, searchable: true, sortable: false },
                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                            field: { handle: "testName", type: "link", align: "left", editable: false },
                                            prompt: ""
                                        },
                                        {
                                            show: true,
                                            width: "25",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: { title: "API Count", align: "left", filterable: false, searchable: false, sortable: false },
                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                            field: { handle: "apicount", type: "alphanumeric", align: "left", editable: false },
                                            prompt: ""
                                        },
                                        {
                                            show: true,
                                            width: "20",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: { title: "Retailers", align: "left", filterable: false, searchable: false, sortable: false },
                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                            field: { handle: "usercount", type: "alphanumeric", align: "left", editable: false },
                                            prompt: ""
                                        },
                                        {
                                            show: true,
                                            width: "20",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: { title: "Region", align: "left", filterable: false, searchable: false, sortable: false },
                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                            field: { handle: "regioncount", type: "alphanumeric", align: "left", editable: false },
                                            prompt: ""
                                        },
                                        {
                                            show: true,
                                            width: "20",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: { title: "Build", align: "left", filterable: false, searchable: false, sortable: false },
                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                            field: { handle: "buildcount", type: "alphanumeric", align: "left", editable: false },
                                            prompt: ""
                                        },

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
        ab_testing_form: {
            context: "api_manager",
            source: "/system/v1/api_manager/ablist/",
            viewFor: "ab_tesing_mapping",
            context_header: {
                show: true,
                title: "CREATE NEW AB TEST",
                breadcrumb: "title",
                actions: [
                    { label: "Back", type: "button", theme: "secondary", method: "cancel", action: "BACK", classes: "icon-left", icon: "fa fa-times", tabindex: 8, status: true, shortcut: "" },
                    { label: "Save", theme: "primary", method: "post", action: "SAVE_testing_list", classes: "icon-left", icon: "fa fa-save", tabindex: 8, status: true, shortcut: "" }
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
                                classes: "",
                                fields: [
                                    // { type: "toggle", label: "Status", handle: "status", value: false, classes: "", mandatory: true, disabled: false, tabindex: 1, align: "right", label_width: 0, label_position: "top", validation_message: "" },
                                    // { type: "text", label: "Full Name", handle: "fullName", value: "", placeholder: "", classes: "", mandatory: true, pattern: "", disabled: false, tabindex: 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    // { type: "text", label: "Email", handle: "email", value: "", placeholder: "", classes: "", mandatory: true, pattern: "", disabled: false, tabindex: 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    {
                                        title: "",
                                        sub_title: "",
                                        type: "placeholder",
                                        width: "50%",
                                        layout: "horizontal",
                                        classes: "",
                                        placeholder: "tableform"
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
        },

        mapping_screen: {
            context: "api_manager",
            source: "/system/v1/api_manager/ablist/",
            viewFor: "ab_tesing_mapping",
            context_header: {
                show: true,
                title: "Ab Mapping Screen",
                breadcrumb: "title",
                actions: [
                    { type: "Cancel", label: "Cancel", theme: "secondary", method: "cancel", action: "BACK", classes: "icon-left", icon: "fa fa-times", tabindex : 8, status: true, shortcut: "" },
                    { label: "Edit", theme: "primary", method: "post", action: "EDIT_Mapping", classes: "pharmarack-cms-segment-rule-edit-btn", icon: "", tabindex: 8, status: true, shortcut: "" },
                    
                ]
            },
            header: { show: false },
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
                                width: "50%",
                                layout: "horizontal",
                                classes: "",
                                fields: [
                                    { type: "label", label: "Title", handle: "testName", value: "", classes: "", align: "right", label_width: 0, label_position: "top" },
                                ]
                            },
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
                                tab: {
                                    title: "",
                                    handle: "dynamic_retailer_tab",
                                    position: "top",
                                    default_tab: "retailer_tab_open",
                                    tabview: true,
                                    type: "fluid",
                                    width: "100%",
                                    items: {
                                        retailer_tab_open: {
                                            custom: false,
                                            icon: "fa fa-store",
                                            title: "Retailers",
                                            context: "api_manager",
                                            header: {
                                                show: true,
                                                actions: [
                                                    { label: "Save", theme: "primary", method: "post", action: "SAVE_FROM_MAPPING", classes: "bulk-retailer-added icon-left", icon: "", tabindex: 8, status: true, shortcut: "" }
                                                ]
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
                                                                type: "placeholder",
                                                                width: "50%",
                                                                layout: "horizontal",
                                                                classes: "",
                                                                placeholder: "reatilersearch"
                                                            },
                                                            {
                                                                title: "",
                                                                sub_title: "",
                                                                type: "datagrid",
                                                                width: "100%",
                                                                layout: "horizontal",
                                                                collapsible: false,
                                                                datagrid: {
                                                                    handle: "retailer_grid",
                                                                    layout: "fluid",
                                                                    height: "",
                                                                    header: true,
                                                                    content: true,
                                                                    footer: true,
                                                                    grid_lines: true,
                                                                    multi_select: false,
                                                                    full_row_select: false,
                                                                    is_main_grid: true,
                                                                    empty_message: "No retailer mapped for this segment yet.!",
                                                                    datasource: { endpoint: "/system/v1/api_manager/mapped/retailers/:id", page: 0, populate: false, handler: "dedicated", cached: false },
                                                                    columns: [
                                                                        {
                                                                            show: true,
                                                                            width: "10",
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: { title: "S.No", align: "left" },
                                                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                                                            field: { handle: "#", type: "serial", align: "left", editable: false },
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true,
                                                                            width: "35",
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: { title: "Retailer Name", align: "left", filterable: false, searchable: true, sortable: false },
                                                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                                                            field: { handle: "RetailerName", type: "alphanumeric", align: "left", editable: false },
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true,
                                                                            width: "20",
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: { title: "Mobile Number", align: "left", filterable: false, searchable: false, sortable: false },
                                                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                                                            field: { handle: "MobileNumber", type: "alphanumeric", align: "left", editable: false },
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true,
                                                                            width: "10",
                                                                            search: false,
                                                                            filter: false,
                                                                            header: { title: "Action", align: "center", filterable: false, searchable: false, sortable: false },
                                                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                                                            field: { handle: "", type: "button", action: "REMOVE", align: "center", icon: "fa fa-trash", class: "icon-left" },
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
                                            }
                                        },
                                        region_tab_open: {
                                            custom: false,
                                            icon: "fa fa-store",
                                            title: "Region",
                                            context: "api_manager",
                                            header: {
                                                show: true,
                                                actions: [
                                                    { label: "Save", theme: "primary", method: "post", action: "SAVE_FROM_MAPPING", classes: "bulk-retailer-added icon-left", icon: "", tabindex: 8, status: true, shortcut: "" }
                                                ]
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
                                                                width: "50%",
                                                                layout: "horizontal",
                                                                collapsible: false,
                                                                classes: "",
                                                                fields: [
                                                                    {
                                                                        type: "multiselect",
                                                                        label: "",
                                                                        handle: "regions",
                                                                        value: "",
                                                                        parents: {},
                                                                        placeholder: "Select regions",
                                                                        searchprompt: "Search for regions",
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
                                                                        value_key: "RegionId",
                                                                        label_key: "RegionName",
                                                                        source: "remote",
                                                                        endpoint: "/system/v1/api_manager/region/list"
                                                                    },

                                                                ]
                                                            },
                                                            {
                                                                title: "",
                                                                sub_title: "",
                                                                type: "datagrid",
                                                                width: "100%",
                                                                layout: "horizontal",
                                                                collapsible: false,
                                                                datagrid: {
                                                                    handle: "region_grid",
                                                                    layout: "fluid",
                                                                    height: "",
                                                                    header: true,
                                                                    content: true,
                                                                    footer: true,
                                                                    grid_lines: true,
                                                                    multi_select: false,
                                                                    full_row_select: false,
                                                                    is_main_grid: true,
                                                                    empty_message: "No retailer mapped for this segment yet.!",
                                                                    datasource: { endpoint: "/system/v1/api_manager/mapped/region/:id", page: 0, populate: false, handler: "dedicated", cached: false },
                                                                    columns: [
                                                                        {
                                                                            show: true,
                                                                            width: "10",
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: { title: "S.No", align: "left" },
                                                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                                                            field: { handle: "#", type: "serial", align: "left", editable: false },
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true,
                                                                            width: "35",
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: { title: "Region Name", align: "left", filterable: false, searchable: true, sortable: false },
                                                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                                                            field: { handle: "regionName", type: "alphanumeric", align: "left", editable: false },
                                                                            prompt: ""
                                                                        },

                                                                        {
                                                                            show: true,
                                                                            width: "10",
                                                                            search: false,
                                                                            filter: false,
                                                                            header: { title: "Action", align: "center", filterable: false, searchable: false, sortable: false },
                                                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                                                            field: { handle: "", type: "button", action: "REMOVE", align: "center", icon: "fa fa-trash", class: "icon-left" },
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
                                            }
                                        },
                                        build_tab_open: {
                                            custom: false,
                                            icon: "fa fa-store",
                                            title: "Build",
                                            context: "api_manager",
                                            header: {
                                                show: true,
                                                actions: [
                                                    { label: "Save", theme: "primary", method: "post", action: "SAVE_FROM_MAPPING", classes: "bulk-retailer-added icon-left", icon: "", tabindex: 8, status: true, shortcut: "" }
                                                ]
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
                                                                width: "50%",
                                                                layout: "horizontal",
                                                                collapsible: false,
                                                                classes: "",
                                                                fields: [
                                                                    {
                                                                        type: "multiselect",
                                                                        label: "",
                                                                        handle: "build",
                                                                        value: "",
                                                                        parents: {},
                                                                        placeholder: "Select Build",
                                                                        searchprompt: "Search for Build",
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
                                                                        label_key: "releaseDetails",
                                                                        source: "remote",
                                                                        endpoint: "/system/v1/api_manager/build/all"
                                                                    },
                                                                ]
                                                            },
                                                            {
                                                                title: "",
                                                                sub_title: "",
                                                                type: "datagrid",
                                                                width: "100%",
                                                                layout: "horizontal",
                                                                collapsible: false,
                                                                datagrid: {
                                                                    handle: "build_grid",
                                                                    layout: "fluid",
                                                                    height: "",
                                                                    header: true,
                                                                    content: true,
                                                                    footer: true,
                                                                    grid_lines: true,
                                                                    multi_select: false,
                                                                    full_row_select: false,
                                                                    is_main_grid: true,
                                                                    empty_message: "No retailer mapped for this segment yet.!",
                                                                    datasource: { endpoint: "/system/v1/api_manager/mapped/build/:id", page: 0, populate: false, handler: "dedicated", cached: false },
                                                                    link: { key: "RetailerId", context: "api_manager", target_type: "view", view: "segment_form", data: "remote", endpoint: "/segmentation/v1/segment/" },
                                                                    columns: [
                                                                        {
                                                                            show: true,
                                                                            width: "10",
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: { title: "S.No", align: "left" },
                                                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                                                            field: { handle: "#", type: "serial", align: "left", editable: false },
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true,
                                                                            width: "35",
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: { title: "Release Name", align: "left", filterable: false, searchable: true, sortable: false },
                                                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                                                            field: { handle: "releaseDetails", type: "alphanumeric", align: "left", editable: false },
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true,
                                                                            width: "20",
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: { title: "Version", align: "left", filterable: false, searchable: false, sortable: false },
                                                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                                                            field: { handle: "version", type: "alphanumeric", align: "left", editable: false },
                                                                            prompt: ""
                                                                        },
                                                                        {
                                                                            show: true,
                                                                            width: "20",
                                                                            search: false,
                                                                            filter: false,
                                                                            classes: "",
                                                                            header: { title: "OS", align: "left", filterable: false, searchable: false, sortable: false },
                                                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                                                            field: { handle: "os", type: "alphanumeric", align: "left", editable: false },
                                                                            prompt: ""
                                                                        },

                                                                        {
                                                                            show: true,
                                                                            width: "10",
                                                                            search: false,
                                                                            filter: false,
                                                                            header: { title: "Action", align: "center", filterable: false, searchable: false, sortable: false },
                                                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                                                            field: { handle: "", type: "button", action: "REMOVE", align: "center", icon: "fa fa-trash", class: "icon-left" },
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
                                            }
                                        }
                                    }
                                }
                            }
                        ]
                    }
                ]
            },
            footer: { show: false },
            sidebar: null,
            manage: false
        },

        // API List
        api_list: {
            context: "api_manager",
            context_header: {
                show: true,
                title: "API LISTS",
                breadcrumb: "",
                actions: [
                    { label: "Back", type: "button", theme: "secondary", method: "cancel", action: "BACK", classes: "icon-left", icon: "fa fa-chevron-left", tabindex: 8, status: true, shortcut: "" },
                    { type:"link",label: "NEW API", theme: "primary", method: "post", action:"/api_manager/apilist/list/new", classes: "pharmarack-cms-action-new icon-left", icon: "fa fa-road", tabindex: 8, status: true, shortcut: "" },
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
                                    handle: "ab_tesing_api_list",
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
                                    datasource: { endpoint: "/system/v1/api_manager/api/list/pagination?populate=type", page: 0, populate: false, handler: "default" },
                                    link: { key: "_id", context: "user", target_type: "view", view: "add_api_form", data: "remote", endpoint: "/api_manager/apilist/list/" },
                                    columns: [
                                        {
                                            show: true,
                                            width: "5",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: { title: "S.No", align: "left" },
                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                            field: { handle: "#", type: "serial", align: "left", editable: false },
                                            prompt: ""
                                        },
                                        {
                                            show: true,
                                            width: "30",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: { title: "Title", align: "left", filterable: false, searchable: true, sortable: false },
                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                            field: { handle: "title", type: "link", align: "left" },
                                            prompt: ""
                                        },
                                        {
                                            show: true,
                                            width: "30",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: { title: "Service", align: "left", filterable: false, searchable: true, sortable: false },
                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                            field: { handle: "service", type: "link", align: "left" },
                                            prompt: ""
                                        },
                                        {
                                            show: true,
                                            width: "20",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: { title: "Route", align: "left", filterable: false, searchable: false, sortable: false },
                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                            field: { handle: "route", type: "alphanumeric", align: "left" },
                                            prompt: ""
                                        },

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

        add_api_form: {
            context: "ab_tesing",
            source: "/system/v1/api_manager/api/",
            viewFor: "ab_tesing_api_list",
            context_header: {
                show: true,
                title: "ADD API",
                breadcrumb: "title",
                actions: [
                    { type: "button", label: "Cancel", theme: "secondary", method: "cancel", action: "BACK", classes: "icon-left", icon: "fa fa-times", tabindex : 8, status: true, shortcut: "" },
                    { label: "Save", theme: "primary", method: "post", action: "SAVE_api_list", classes: "icon-left", icon: "fa fa-save", tabindex: 8, status: true, shortcut: "" }
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
                                width: "50%",
                                layout: "horizontal",
                                collapsible: false,
                                classes: "",
                                fields: [
                                    // { type: "toggle", label: "Status", handle: "status", value : false, classes : "", mandatory : true, disabled: false, tabindex : 1, align: "right", label_width: 0, label_position: "top", validation_message: "" },
                                    { type: "text", label: "API Name", handle: "title", value: "", placeholder: "", classes: "", mandatory: true, pattern: "", disabled: false, tabindex: 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    { type: "text", label: "API Route", handle: "route", value: "", placeholder: "/****/****", classes: "", mandatory: true, pattern: "", disabled: false, tabindex: 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    { type: "select", label: "Secret Type", handle: "secretType", value: "1", value_key: "value", label_key: "label", options: [{ label: "Producted", value: "1", selected: true, disabled: false }, { label: "Non Producted", value: "2", selected: false, disabled: false }], classes: "", mandatory: true, disabled: false, tabindex: 1, align: "right", label_width: 0, label_position: "top", prompt_message: "", validation_message: "", source: "local", endpoint: "" },
                                    {
                                        type: "select", label: "Service", handle: "service", value: "1", value_key: "value", label_key: "label", options: [
                                            { label: "User service", value: "user", selected: true, disabled: false },
                                            { label: "Order Service", value: "order", selected: false, disabled: false },
                                            { label: "Cart Service", value: "cart", selected: false, disabled: false },
                                            { label: "Flyy Service", value: "flyy", selected: false, disabled: false },
                                            { label: "FraudlentOrders Service", value: "fraudlentOrders", selected: false, disabled: false },
                                            { label: "Payment Service", value: "payment", selected: false, disabled: false },
                                            { label: "Returns Service", value: "returns", selected: false, disabled: false },
                                            { label: "Search Service", value: "search", selected: false, disabled: false },
                                            { label: "Logger Service", value: "logger", selected: false, disabled: false },
                                            { label: "Prescription Service", value: "prescription", selected: false, disabled: false }
                                        ], classes: "", mandatory: true, disabled: false, tabindex: 1, align: "right", label_width: 0, label_position: "top", prompt_message: "", validation_message: "", source: "local", endpoint: ""
                                    },
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

        // build update
        build_list: {
            context: "api_manager",
            context_header: {
                show: true,
                title: "BUILD LISTS",
                breadcrumb: "",
                actions: [
                    {label: "Back", type: "button", theme: "secondary", method: "cancel", action: "BACK",classes: "icon-left", icon: "fa fa-chevron-left", tabindex: 8, status: true, shortcut: "" },
                    { type:"link", label: "NEW BUILD", theme: "primary", method: "post", action: "/api_manager/build/list/new", classes: "pharmarack-cms-action-new icon-left", icon: "fa fa-road", tabindex: 8, status: true, shortcut: "" },
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
                                    handle: "ab_tesing_build_list",
                                    layout: "fluid",
                                    height: "",
                                    header: true,
                                    content: true,
                                    footer: true,
                                    grid_lines: true,
                                    multi_select: false,
                                    full_row_select: false,
                                    is_main_grid: true,
                                    empty_message: "No Build Available yet.!",
                                    datasource: { endpoint: "/system/v1/api_manager/build/list/pagination?populate=type", page: 0, populate: false, handler: "default" },
                                    link: { key: "_id", context: "ab_tesing", target_type: "view", data: "remote", endpoint: "/api_manager/build/list/" },
                                    columns: [
                                        {
                                            show: true,
                                            width: "5",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: { title: "S.No", align: "left" },
                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                            field: { handle: "#", type: "serial", align: "left", editable: false, },
                                            prompt: ""
                                        },
                                        {
                                            show: true,
                                            width: "40",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: { title: "release Title", align: "left", filterable: false, searchable: true, sortable: false },
                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                            field: { handle: "releaseDetails", type: "link", align: "left", editable: false },
                                            prompt: ""
                                        },
                                        {
                                            show: true,
                                            width: "25",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: { title: "release Date", align: "left", filterable: false, searchable: false, sortable: false },
                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                            field: { handle: "releas_date", type: "alphanumeric", align: "left", editable: false },
                                            prompt: ""
                                        },
                                        {
                                            show: true,
                                            width: "20",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: { title: "Version", align: "left", filterable: false, searchable: false, sortable: false },
                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                            field: { handle: "version", type: "alphanumeric", align: "left", editable: false },
                                            prompt: ""
                                        },
                                        {
                                            show: true,
                                            width: "20",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: { title: "Os", align: "left", filterable: false, searchable: false, sortable: false },
                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                            field: { handle: "os", type: "alphanumeric", align: "left", editable: false },
                                            prompt: ""
                                        },

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

        build_form: {
            context: "user",
            source: "/system/v1/api_manager/build/version/",
            viewFor: "ab_tesing_build_list",
            context_header: {
                show: true,
                title: "CREATE NEW BUILD",
                breadcrumb: "title",
                actions: [
                    { label: "Cancel", type: "button", theme: "secondary", method: "cancel", action: "BACK", classes: "icon-left", icon: "fa fa-times", tabindex: 8, status: true, shortcut: "" },
                    { label: "Save", theme: "primary", method: "post", action: "SAVE_build_form", classes: "icon-left", icon: "fa fa-save", tabindex: 8, status: true, shortcut: "" }
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
                                width: "50%",
                                layout: "horizontal",
                                collapsible: false,
                                classes: "",
                                fields: [
                                    { type: "text", label: "Release Name", handle: "releaseDetails", value: "", placeholder: "", classes: "", mandatory: true, pattern: "", disabled: false, tabindex: 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    { type: "date", label: "Release Date", handle: "releas_date", value: "", placeholder: "", classes: "", mandatory: true, pattern: "", disabled: false, tabindex: 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    { type: "text", label: "App Version", handle: "version", value: "", placeholder: "", classes: "", mandatory: true, pattern: "", disabled: false, tabindex: 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" },
                                    { type: "select", label: "OS", handle: "os", value: "1", value_key: "value", label_key: "label", options: [{ label: "Android", value: "android", selected: true, disabled: false }, { label: "IOS", value: "Ios", selected: false, disabled: false }], classes: "", mandatory: true, disabled: false, tabindex: 1, align: "right", label_width: 0, label_position: "top", prompt_message: "", validation_message: "", source: "local", endpoint: "" },
                                    { type: "textarea", label: "Description", handle: "description", value: "", placeholder: "", classes: "", mandatory: false, pattern: "", disabled: false, tabindex: 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "" }

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


    },
    enums: {}

};

export default user_config;