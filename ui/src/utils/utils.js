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

        const user = sessionStorage.getItem("pharmarack_cms_user");
        const token = sessionStorage.getItem("pharmarack_cms_token");
        const role = sessionStorage.getItem("pharmarack_cms_role");
    
        return user && token && role;

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