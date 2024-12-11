import React, { useState, useEffect } from 'react';

const SubmitPassword = () => {

    const [state, setState] = useState({
        password: "",
        confirmPassword: "",
        msgType: "",
        message: ""       
    });
    
    const [btnEnable, setBtnEnable] = useState(false);
    const [token, setToken] = useState("");
    const [authType, setAuthType] = useState({
        secretType: 1,
        minLength: 8,
        maxLength: 12,
        complex: 1
    });

    const alphaRegx = /^(?=.*[a-z])(?=.*[A-Z]).+$/;
    const numberRegx = /^(?=.*\d).+$/;
    const specialRegx = /^(?=.*[!@#$%^&*(),.?":{}|<>]).+$/;

    const getAuthType = async (_token) => {
        /* Get the auth type  so that we can  validated the password  */
        const request = {
            method: "POST",
            endpoint: "/system/v1/auth/user-auth-type",
            payload: {
                token: _token                   
            }
        };

        window._controller.docker.dock(request, false).then((_res) => {
            setAuthType(_res);          
        }).catch((e) => {
            setState((prevState) => ({
                ...prevState,
                msgType: "error",
                message: "Invalid token expired or invalid, please request again"
            }));
            setTimeout(() => {
                location.href="/";
            },  3000);
        });
    };

    useEffect(() => {
        
        const queryParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = queryParams.get("token");

        if (tokenFromUrl) {
            setToken(tokenFromUrl);
            getAuthType(tokenFromUrl);
        } else {
            setState((prevState) => ({
                ...prevState,
                msgType: "error",
                message: "Token not found in the URL",
            }));
        }

    }, []);

    useEffect(() => {
        if (state.password && state.confirmPassword) {
            if (token && (state.password === state.confirmPassword)) {
                if (validatePassword()) {     
                    setBtnEnable(true);      
                    setState((prevState) => ({
                        ...prevState,
                        msgType: "success",
                        message: ""
                    }));
                } else {   
                    setBtnEnable(false);         
                    setState((prevState) => ({
                        ...prevState,
                        msgType: "error",
                        message: "Password strength is weak"
                    }));    
                }                
            } else {
                setBtnEnable(false);
                setState((prevState) => ({
                    ...prevState,
                    msgType: "error",
                    message: "Password and confirm password must be the same",                    
                }));
            }
        } else {
            setBtnEnable(false);
        }
    }, [state.password, state.confirmPassword]);

    const handlePasswordChange = (_e) => {
        setState({ ...state, password: _e.target.value });
    };

    const handleConfirmPasswordChange = (_e) => {
        setState({ ...state, confirmPassword: _e.target.value });
    };

    const handleUserKeyDown = (_e) => {
        if (_e.key === "Enter") {
            handleSubmitBtnClick();
        }
    };

    const handleSubmitBtnClick = async () => {

        const request = {
            method: "POST",
            endpoint: "/system/v1/auth/submit-forgot-password",
            payload: {
                password: state.password                    
            }
        };

        window._controller.docker.dock(request, true, token).then((_res) => {
            setState((prevState) => ({
                ...prevState,
                msgType: "success",
                message: _res.message,
            }));            
        }).catch((e) => {
            setState((prevState) => ({
                ...prevState,
                msgType: "error",
                message: "Invalid token expired or invalid, please request again"
            }));    
        });     
        
        setTimeout(() => {
            location.href="/";
        },  2500);
        
    };

    const updatePasswordStatus = () => {
    
        const { minLength, maxLength, complex } = authType;
        const { password } = state;
        
        const getPasswordFeedback = (condition, message) => (
            <p className={condition ? "success" : "error"}>{message}</p>
        );
    
        return (
            <>
                {getPasswordFeedback(password && password.length >= minLength, `Minimum ${minLength}`)}
                {getPasswordFeedback(password && password.length <= maxLength, `Maximum ${maxLength}`)}
    
                {complex != 1 && (
                    <>
                        {getPasswordFeedback(alphaRegx.test(password), "[A-Z] & [a-z]")}
                        {getPasswordFeedback(numberRegx.test(password), "[0-9]")}
                        {getPasswordFeedback(specialRegx.test(password), `[!@#$%^&*(),.?":{}|<>]`)}
                    </>
                )}
            </>
        );
    };

    const validatePassword = () => {

        if (authType) {
            if (state.password) {
                if (authType.complex == 1) {
                    return (state.password.length >= authType.minLength && state.password.length <= authType.maxLength);
                } else {
                    return (state.password.length >= authType.minLength && state.password.length <= authType.maxLength && alphaRegx.test(state.password) && numberRegx.test(state.password) && specialRegx.test(state.password));
                }
            }
        }

        return false;

    };

    return (
        <div className="pharmarack-cms-login-wrapper">
            
            {state.message ? (<div className={`pharmarack-cms-form-${state.msgType}-message login`}><i className={`fa ${ state.msgType == "error" ? "fa-circle-xmark" : "fa-circle-check" }`}></i> {state.message}</div>) : null}

            <div className="pharmarack-cms-login-form">
                <div className="pharmarack-cms-login-form-header">
                    <img src="/assets/imgs/logo.svg" alt="Logo" />
                    <p>Submit new Password</p>
                </div>

                <div className="pharmarack-cms-form-fields">
                    <div className="pharmarack-cms-form-row">
                        <input
                            type="password"
                            placeholder="Password"
                            onKeyDown={handleUserKeyDown}
                            onChange={handlePasswordChange}
                            value={state.password}
                        />
                    </div>
                    <div className="pharmarack-cms-form-row">
                        <input
                            type="password"
                            placeholder="Confirm password"
                            onKeyDown={handleUserKeyDown}
                            onChange={handleConfirmPasswordChange}
                            value={state.confirmPassword}
                        />
                    </div>
                </div>

                <div className="pharmarack-cms-form-action">
                    <button
                        className={`pharmarack-cms-btn primary block ${!btnEnable ? "disabled" : ""}`}
                        disabled={!btnEnable}
                        onClick={handleSubmitBtnClick}
                    >
                        Submit
                    </button>
                </div>

                <div className="pharmarack-cms-login-powered-by">
                    <span>Powered by</span>
                    <img src="/assets/imgs/powered.svg" alt="Powered by" />
                </div>
            </div>

            <div className='pharmarack-cms-password-status-box'>{updatePasswordStatus()}</div>

        </div>
    );
};

export default SubmitPassword;