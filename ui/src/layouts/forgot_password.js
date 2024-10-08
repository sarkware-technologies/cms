import React, { useState, useEffect } from 'react';

const ForgotPassword = (props) => {  console.log("ForgotPassword is called");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const mobileRegex = /^[6-9]\d{9}$/;

    const [state, setState] = useState({
        username: "",
        userNameEmpty: true,
        loading: false
    });

    const [btnEnable, setBtnEnable] = useState(false);

    useEffect(() => { 
        if (!state.userNameEmpty ) {
            if (emailRegex.test(state.username)) {
                setBtnEnable(true);
                return;
            }
        }
        setBtnEnable(false);        
    }, [state]);

    const handleUserChange = (_e) => {
        let isEmpty = true;
        if (_e.target.value) {
            isEmpty = false;
        }
        setState((prevState) => ({ ...prevState, username: _e.target.value, userNameEmpty: isEmpty }));
    }

    const handleUserKeyDown = (_e) => {
        if (_e.key === 'Enter') {
            handleSubmitBtnClick();
            return true;
        }
    }

    const handleSubmitBtnClick = async () => {

        try {

            const response = await window._controller.docker.dock({
                method: "POST",
                endpoint: "/system/auth/sign-in",
                payload: { 
                    user: state.username,
                    password: state.password
                }
            }, false); 

            if (response.type == "role") {
                setRoles(response.roles);
                setState((prevState) => ({ ...prevState, roleSelectorVisible: true, authError: false }));
            } else if (response.type == "locked") {
                setState((prevState) => ({ ...prevState, roleSelectorVisible: false, authError: true, authErrorMsg: response.message }));
            } else if (response.type == "success") {
                setupSession(response);
            }            

        } catch (e) {
            setState((prevState) => ({ ...prevState, authError: true, authErrorMsg: e.message }));
        }
        
    };

    return (

        <div className="pharmarack-cms-login-wrapper">

            {state.authError ? (<div className={`pharmarack-cms-form-error-message login`}><i className="fa fa-circle-xmark"></i> {state.authErrorMsg}</div>) : null}

            <div className="pharmarack-cms-login-form">

                <div className="pharmarack-cms-login-form-header">
                    <img src="/assets/imgs/logo.svg" />
                    <p>Forgot Password</p>
                    <p className="pharmarack-cms-forgot-password-form-desc">Reset link will be sent to your email</p>
                </div>

                <div className="pharmarack-cms-form-fields">
                    <div className="pharmarack-cms-form-row">
                        <input type='text' placeholder='Registered Email' onKeyDown={handleUserKeyDown} onChange={handleUserChange} value={state.username} />
                    </div>
                </div>

                <div className="pharmarack-cms-form-action">
                    <button className={`pharmarack-cms-btn primary block ${!btnEnable ? "disabled" : ""}`} disabled={!btnEnable} onClick={handleSubmitBtnClick}>Send Reset Link</button>
                    <p className="pharmarack-cms-login-link-p">Remember password? <a href="/login" className='pharmarack-cms-register-link'>Login Now</a></p>
                </div>

                <div className="pharmarack-cms-login-powered-by">
                    <span>Powered by</span>
                    <img src='/assets/imgs/powered.svg' />
                </div>

            </div>

        </div>

    )

}

export default ForgotPassword;