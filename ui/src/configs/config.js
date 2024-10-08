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
        type: "sessionstorage", // cookie, localstorage or sessionstorage
        keys: {
            user: "user",
            role: "role",
            token: "token"
        }

    }

};

export default app_config;