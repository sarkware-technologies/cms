import React, { createRef } from "react";

export default class Docker {

    constructor () {
        /* */
        this.indicatorRef = createRef();
        /* */
        this.indicatorCounter = 0;
    }

    dock = async (_request, isPrivate = true, _token = null) => {

        try {

            const header = new Headers();
            header.append(
                "Content-Type",
                _request.content_type ? _request.content_type : "application/json"
            );  
            
            if (isPrivate) {
                const token = localStorage.getItem("pharmarack_cms_access_token");
                if (token) {              
                    header.append("Authorization", `Bearer ${token}`);
                } else if (_token) {
                    /* Check whether token passed as */
                    header.append("Authorization", `Bearer ${_token}`);
                } else {
                    throw new Error("Access token is not found");
                }
            }
    
            let config = {
                headers: header,
                method: _request.method
            };
    
            if (config.method !== "get" && config.method !== "delete" && _request.payload) {
                config.body = JSON.stringify(_request.payload);
            }
    
            if (this.indicatorRef.current) {
                this.indicatorCounter++;
                this.indicatorRef.current.style.display = "block";
            }
    
            const gatewayUrl = process.env.REACT_APP_GATEWAY_URL;
            const response = await fetch(gatewayUrl + _request.endpoint, config);
    
            if (this.indicatorRef.current) {
                this.indicatorCounter--;
                if (this.indicatorCounter === 0) {
                    this.indicatorRef.current.style.display = "none";
                }
            }
    
            if (response.ok) {

                const contentType = response.headers.get("content-type");
    
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const result = await response.json();
                    return result;
                } else {
                    const text = await response.text();
                    return text;
                }

            } else {

                if (response.status === 401 && !_token) {                    
                    window._controller.utils.clearSession();
                    return;
                } else if (response.status === 504) {
                    const pathSegments = new URL(response.url).pathname.split("/");
                    window._controller.notify( pathSegments[1] +" service is down", "error");
                }
    
                console.log(response.status);

                const errorData = await response.text();
                let errorMessage;
                try {
                    errorMessage = JSON.parse(errorData).message;
                } catch (e) {
                    errorMessage = errorData;
                }    
               
                throw new Error(errorMessage);

            }
        } catch (error) { 

            if (this.indicatorRef.current) {
                this.indicatorRef.current.style.display = "none";
            }
    
            throw error;

        }

    };

    dockAll = () => {
        
    };

    upload = async (_endpoint, _formData) => {

        const headers = new Headers();

        if (this.indicatorRef.current) {
            this.indicatorRef.current.style.display = "block";    
        }
        
        const token = localStorage.getItem("pharmarack_cms_access_token");
        if (token) {              
            headers.append("Authorization", `Bearer ${token}`);
        } else {
            throw new Error("Access token is not found");
        }

        try {

            const response = await fetch(process.env.REACT_APP_GATEWAY_URL + _endpoint, {
                method: 'POST',
                body: _formData,
                headers: headers
            });

            if (this.indicatorRef.current) {
                this.indicatorRef.current.style.display = "none";
            }

            if (!response.ok) {
                throw new Error(`Error uploading file: ${response.statusText}`);
            }

            return await response.json();

        } catch (error) {
            if (this.indicatorRef.current) {
                this.indicatorRef.current.style.display = "none";
            }
            return error.message;
        }

    };

}