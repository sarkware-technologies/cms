import React, { useState, useEffect } from 'react';

const ForgotPassword = (props) => {  console.log("ForgotPassword is called");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;    

    const [state, setState] = useState({
        username: "",
        userNameEmpty: true,
        loading: false,
        authError: false, 
        authErrorMsg: ""
    });

    const [btnEnable, setBtnEnable] = useState(false);
    const [linkSend, setLinkSend] = useState(false);

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

            setState((prevState) => ({ ...prevState, authError: false, authErrorMsg: "" }));

            const response = await window._controller.docker.dock({
                method: "POST",
                endpoint: "/system/v1/auth/send-forgot-password-token",
                payload: { 
                    user: state.username
                }
            }, false); 

            setLinkSend(true);
            setTimeout(() => {
                location.href="/";
            }, 5000);

        } catch (e) {
            setState((prevState) => ({ ...prevState, authError: true, authErrorMsg: e.message }));
        }
        
    };

    return (

        <div className="pharmarack-cms-login-wrapper">

            {state.authError ? (<div className={`pharmarack-cms-form-error-message login`}><i className="fa fa-circle-xmark"></i> {state.authErrorMsg}</div>) : null}

            <div className="pharmarack-cms-login-form">

            {
                !linkSend ? 
                <div className="pharmarack-cms-login-form-header">
                    <img src="/assets/imgs/logo.svg" />
                    <p>Forgot Password</p>
                    <p className="pharmarack-cms-forgot-password-form-desc">{ linkSend ? "" : "Reset link will be sent to your email" }</p>
                </div>
                : ""
            }

                {
                    linkSend ? 
                    <div className='pharmarack-cms-forgot-sumbitted-view'>
                        <div className='send-header'><i className='fa fa-paper-plane'></i></div>                        
                        <p>Password reset link has been sent to your email, please check and follow the instruction.!</p>
                    </div>
                    :
                    <div>
                        <div className="pharmarack-cms-form-fields">
                            <div className="pharmarack-cms-form-row">
                                <input type='text' placeholder='Registered Email' onKeyDown={handleUserKeyDown} onChange={handleUserChange} value={state.username} />
                            </div>
                        </div>

                        <div className="pharmarack-cms-form-action">
                            <button className={`pharmarack-cms-btn primary block ${!btnEnable ? "disabled" : ""}`} disabled={!btnEnable} onClick={handleSubmitBtnClick}>Send Reset Link</button>
                            <p className="pharmarack-cms-login-link-p">Remember password? <a href="/login" className='pharmarack-cms-register-link'>Login Now</a></p>
                        </div>
                    </div>
                }

                <div className="pharmarack-cms-login-powered-by">
                    <span>Powered by</span>
                    <img src='/assets/imgs/powered.svg' />
                </div>

            </div>

        </div>

    )

}

export default ForgotPassword;