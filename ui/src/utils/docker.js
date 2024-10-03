import React, { createRef } from "react";

export default class Docker {

    constructor () {
        /* */
        this.indicatorRef = createRef();
        /* */
        this.indicatorCounter = 0;
    }

    dock = async (_request) => {

        try {

            const header = new Headers();
            header.append(
                "Content-Type",
                _request.content_type ? _request.content_type : "application/json"
            );   
            
            const token = sessionStorage.getItem("pharmarack_cms_token");
    
            if (token) {              
                header.append("Authorization", `Bearer ${token}`);
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

                if (response.status === 401) {
                    sessionStorage.removeItem("pharmarack_cms_user");
                    sessionStorage.removeItem("pharmarack_cms_token");
                    document.location.href = "";
                    return;
                }
    
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
        this.indicatorRef.current.style.display = "block";        
        
        const token = sessionStorage.getItem("pharmarack_cms_token");
        if (user && token) {
            headers.append("authorization", `Bearer ${token}`);
        }

        try {

            const response = await fetch(process.env.REACT_APP_GATEWAY_URL + _endpoint, {
                method: 'POST',
                body: _formData,
                headers: headers
            });

            this.indicatorRef.current.style.display = "none";

            if (!response.ok) {
                throw new Error(`Error uploading file: ${response.statusText}`);
            }

            return await response.json();

        } catch (error) {
            this.indicatorRef.current.style.display = "none";
            return error.message;
        }

    };

}