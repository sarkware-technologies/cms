import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";

const Splash = () => {

    return (
        <div className="pharmarack-cms-splash-container">
            <div className="progress-container">
                <div className="progress-ring">
                    <div className="progress"></div>
                </div>
            </div>            
            <p>Loading, please wait...</p>
        </div>
    );

}


export default Splash;