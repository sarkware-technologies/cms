import { Component } from "react";

const app_config = {
    
    routes: {
        authorized: [        
            {
                role: "admin",
                path: "/app",
                layout: "app",
                prefetch: []            
            },
            {
                role: "system",
                path: "/system",
                layout: "system",
                prefetch: []            
            }
        ],
        unauthorized: [
            {
                path: "/",
                layout: "login"
            },
            {
                path: "/login",
                layout: "login"
            },
            {
                path: "/registration",
                layout: "registration"
            },
            {
                path: "/forgot-password",
                layout: "forgot_password"
            },
            {
                path: "/submit-password",
                layout: "submit_password"
            },
            {
                path: "/reset-password",
                layout: "reset_password"
            },
            {
                path: "/main",
                layout: "main"
            },
            {
                path: "*",
                layout: "unknown"
            }            
        ],
        not_found: {
            path: "/404",
            layout: "404.js"
        }
    },
    session: {    
        type: "sessionstorage",
        keys: {
            user: "user",
            role: "role",
            token: "token"
        }
    },
    dependencies: {        
        segmentRecords: '/system/v1/api/component/component/multi_select_list?entity=cms_segment',
        distributorRecords: '/system/v1/api/component/component/multi_select_list?entity=distributor',
        companyRecords: '/system/v1/api/component/component/multi_select_list?entity=company',
        componentTypeList: '/system/v1/api/component/component_type/all_component_type',
        retailerList: '/segmentation/v1/api/segment/segment/multi_select_list?entity=cms_master_retailer&select=_id|RetailerId|RetailerName'
    }

};

export default app_config;