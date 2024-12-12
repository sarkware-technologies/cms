import React, { createRef } from "react";
import app_config from "../configs/config";

export default class Utils {

    constructor () {

        /**
         * 
         * Holds the reference to the alert component
         * 
         */
        this.alert = createRef();

        /**
         * 
         * Holds the reference to the alert component
         * 
         */
        this.confirm = createRef();

        /**
         * 
         * This is the reference to the indicator component 
         * 
         */
        this.indicator = createRef();

        /**
         * 
         * Counter to keep track of the number of time indicator is called
         * 
         */
        this.indicatorCounter = 0;

    }

    /**
     * 
     * Load all dependencies
     * 
     */
    loadDependencies = async () => {
        try {

            if (this.isAuthenticated()) {

                const deps = Object.keys(app_config.dependencies);            
                const fetchPromises = deps.map(async (_key) => {
                    const endpoint = app_config.dependencies[_key];
                    const result = await window._controller.docker.dock({ method: "get", endpoint });
                    window._controller.bucket[_key] = result || [];
                });

                await Promise.all(fetchPromises);

            }
            window._controller.setState({ loading: false });

        } catch (error) {
            console.error("Error loading dependencies:", error);
            this.clearSession();
        }
    };

    clearSession = () => {

        /* Successfully signed in */
        localStorage.removeItem("pharmarack_cms_email");
        localStorage.removeItem("pharmarack_cms_mobile");
        localStorage.removeItem("pharmarack_cms_role_name");                    
        localStorage.removeItem("pharmarack_cms_full_name");
        localStorage.removeItem("pharmarack_cms_access_token");
        localStorage.removeItem("pharmarack_cms_refresh_token");
        localStorage.removeItem("pharmarack_cms_menus");

        document.location.href = "/";
        
    };

    indicate = (_msg) => {
        this.indicatorCounter++;
        this.indicator.current.show(_msg);
    };

    alert = (_msg, _type) => {
        this.alert.current.show(_msg, _type);
    };

    confirm = (_config) => {
        this.confirm.current.show(_msg, _type);
    };

    isAuthenticated = () => {

        const accessToken = localStorage.getItem("pharmarack_cms_access_token");
        const refreshToken = localStorage.getItem("pharmarack_cms_refresh_token");
    
        return (accessToken && refreshToken);

    };

    getToken = () => {

        if (app_config.session.type === "sessionstorage") {
            return sessionStorage.getItem(app_config.session.keys.token);
        } else if (app_config.session.type === "localstorage") {
            return localStorage.getItem(app_config.session.keys.token);
        } else {            
            return this.getCookie(app_config.session.keys.token);   
        }

    };

    getUser = () => {

        if (app_config.session.type === "sessionstorage") {
            return sessionStorage.getItem(app_config.session.keys.user);
        } else if (app_config.session.type === "localstorage") {
            return localStorage.getItem(app_config.session.keys.user);
        } else {            
            return this.getCookie(app_config.session.keys.user);   
        }

    };

    getRole = () => {

        if (app_config.session.type === "sessionstorage") {
            return sessionStorage.getItem(app_config.session.keys.role);
        } else if (app_config.session.type === "localstorage") {
            return localStorage.getItem(app_config.session.keys.role);
        } else {            
            return this.getCookie(app_config.session.keys.role);   
        }

    };

    getCookie = (_name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${_name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    };

}