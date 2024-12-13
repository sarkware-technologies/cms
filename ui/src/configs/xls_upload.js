let xls_upload_config = {

    routes: {
        main_view: ['/xls_upload'],
        upload_form: ["/xls_upload/:id"],
    },
    views: {
        main_view: {
            context: "xls_upload",
            source: "",            
            viewFor: "",            
            context_header: {
                show: true,
                title: "Upload Components",
                breadcrumb: "",
                actions: [{ label: "Upload", theme: "primary", action: "NEW_UPLOAD", classes: "pharmarack-cms-action-new icon-left", icon: "fa fa-upload", tabindex: 8, status: true, shortcut: "" }]
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
                                    handle: "upload_grid",
                                    layout: "fluid",
                                    height: "",
                                    header: true,
                                    content: true,
                                    footer: true,
                                    grid_lines: true,
                                    multi_select: false,
                                    full_row_select: false,
                                    is_main_grid: true,
                                    empty_message: "No upload done yet.!",
                                    datasource: { endpoint: "/system/v1/upload", page: 0, populate: false, handler: "dedicated" },
                                    link: { key: "_id", context: "xls_upload", target_type: "view", view: "upload_form", data: "remote", endpoint: "/xls_upload/" },
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
                                            width: "35",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: { title: "File", align: "left", filterable: false, searchable: false, sortable: false },
                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                            field: { handle: "file", type: "link", align: "left", editable: false },
                                            prompt: ""
                                        },
                                        {
                                            show: true,
                                            width: "15",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: { title: "Date", align: "left", filterable: false, searchable: false, sortable: false },
                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                            field: { handle: "upload_date", type: "date", align: "left", editable: false },
                                            prompt: ""
                                        },
                                        {
                                            show: true,
                                            width: "6",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: { title: "Total", align: "center", filterable: false, searchable: false, sortable: false },
                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                            field: { handle: "total", type: "alphanumeric", align: "center", editable: false },
                                            prompt: ""
                                        },
                                        {
                                            show: true,
                                            width: "6",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: { title: "Succeed", align: "center", filterable: false, searchable: false, sortable: false },
                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                            field: { handle: "succeed", type: "alphanumeric", align: "center", editable: false },
                                            prompt: ""
                                        },
                                        {
                                            show: true,
                                            width: "6",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: { title: "Failed", align: "center", filterable: false, searchable: false, sortable: false },
                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                            field: { handle: "failed", type: "alphanumeric", align: "center", editable: false },
                                            prompt: ""
                                        },
                                        {
                                            show: true,
                                            width: "6",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: { title: "Updated", align: "center", filterable: false, searchable: false, sortable: false },
                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                            field: { handle: "updated", type: "alphanumeric", align: "center", editable: false },
                                            prompt: ""
                                        },
                                        {
                                            show: true,
                                            width: "6",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: { title: "Re Uploaded", align: "center", filterable: false, searchable: false, sortable: false },
                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                            field: { handle: "re_uploaded", type: "alphanumeric", align: "center", editable: false },
                                            prompt: ""
                                        },
                                        {
                                            show: true,
                                            width: "15",
                                            search: false,
                                            filter: false,
                                            classes: "",
                                            header: { title: "Status", align: "center", filterable: false, searchable: false, sortable: false },
                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                            field: { handle: "note", type: "alphanumeric", align: "center", editable: false },
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
        upload_form: {
            context: "xls_upload",
            source: "/system/v1/upload/",            
            viewFor: "upload_grid",            
            context_header: {
                show: true,
                title: "Upload",
                breadcrumb: "file",
                actions: [
                    { label: "Cancel", theme: "secondary", action: "BACK", classes: "icon-left", icon: "fa fa-times", tabindex: 8, status: true, shortcut: "" },
                    { label: "Upload", theme: "primary", action: "PROCESS_UPLOAD", classes: "icon-left", icon: "fa fa-upload", tabindex: 8, status: true, shortcut: "" }
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
                                    { type: "file", accept: ".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel", label: "Component Configuration XLS", handle: "file", value: "", placeholder: "", classes: "", mandatory: true, pattern: "", disabled: false, tabindex: 1, align: "right", label_width: 0, label_position: "top", autocomplete: false, prompt_message: "", validation_message: "Please select Component XLS" }
                                ]
                            }
                        ]
                    }
                ]
            },
            footer: {
                show: false,
                rows: [
                    {
                        seperator: false,
                        columns: [
                            {
                                title: "Components",
                                sub_title: "Components created from this upload",
                                type: "datagrid",
                                width: "100%",
                                layout: "horizontal",
                                collapsible: false,
                                datagrid: {
                                    handle: "component_grid",
                                    layout: "fluid",
                                    height: "",
                                    header: true,
                                    content: true,
                                    footer: true,
                                    grid_lines: true,
                                    multi_select: false,
                                    full_row_select: false,
                                    is_main_grid: true,
                                    empty_message: "No component configured yet.!",
                                    datasource: { endpoint: "/system/v1/api/component/uploaded_component/list?populate=component", page: 0, populate: false, handler: "dedicated" },
                                    link: { key: "_id", context: "component", target_type: "view", view: "component_form", data: "local", endpoint: "/system/user/" },
                                    columns: [
                                        {
                                            show: true,
                                            width: "10",
                                            classes: "",
                                            header: { title: "S.No", align: "left", filterable: false, searchable: false },
                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                            field: { handle: "#", type: "serial", align: "left", editable: false, char_length: -1 },
                                            prompt: ""
                                        },
                                        {
                                            show: true,
                                            width: "90",
                                            classes: "",
                                            header: { title: "Component", align: "left", filterable: false, searchable: false },
                                            footer: { title: "", type: "none", total_type: "none", align: "left" },
                                            field: { handle: "component", type: "link_search", label_key: "title", value_key: "_id" },
                                            prompt: ""
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                ]
            },
            sidebar: null,
            manage: true
        }

    }

};

export default xls_upload_config;