import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";

const PageNotfound = () => {

    return (
        <div className="not-found">
            <div className="not-found__error-message">
                <h1 className="not-found__heading">404</h1>
                <p className="not-found__paragraph">Oops! The page you are looking for doesn't exist.</p>
                <a href="/" className="not-found__back-home">Go Back Home</a>
            </div>
        </div>
    );

}


export default PageNotfound;