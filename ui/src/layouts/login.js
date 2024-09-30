import React, { useState, useEffect } from 'react';

const Login = (props) => {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const mobileRegex = /^[6-9]\d{9}$/;

    const [state, setState] = useState({
        username: "",
        password: "",
        userNameEmpty: false,
        passwordEmpty: false,
        userNameInvalid: false,
        passwordInalid: false,
        authError: false,
        authErrorMsg: "",
        loading: false
    });

    useEffect(() => { 
        if (emailRegex.test(state.username) || mobileRegex.test(state.username)) {
            //setBtnEnable(true);
        } else {
            //setBtnEnable(false);
        }
    }, [state.username]);

    const handleUserChange = (_e) => {
        let isEmpty = true;
        if (_e.target.value) {
            isEmpty = false;
        }
        setState((prevState) => ({ ...prevState, username: _e.target.value, isUserEmpty: isEmpty }));
    }

    const handlePasswordChange = (_e) => {
        let isEmpty = true;
        if (_e.target.value) {
            isEmpty = false;
        }
        setState((prevState) => ({ ...prevState, password: _e.target.value, isPassEmpty: isEmpty }));
    }

    const handleUserKeyDown = (_e) => {
        if (_e.key === 'Enter') {
            handleSignInBtnClick();
            return true;
        }
    }

    const handlePasswordKeyDown = (_e) => {
        if (_e.key === 'Enter') {
            handleSignInBtnClick();
            return true;
        }
    }

    const handleSignInBtnClick = () => {

        if (state.authType == 1 && state.isPassEmpty) {
            return;
        } else if (state.authType == 2 && state.isOtpEmpty) {
            return;
        }

        window._controller.dock(
            {
                method: "POST",
                endpoint: "/system/user/sign-in",
                payload: { user: state.username, password: state.password }
            },
            (_req, _res) => {

                if (_res.status) {

                    /* Successfully signed in */
                    sessionStorage.setItem("pharmarack_cms_user", _res.payload.user);
                    sessionStorage.setItem("pharmarack_cms_token", _res.payload.token);
                    // sessionStorage.setItem("pharmarack_cms_role", _res.payload.role.handle);
                    //sessionStorage.setItem("ff_menu", JSON.stringify(_res.payload.menu));                     

                    document.location.href = "";

                } else {
                    window._controller?.notify(_res.message, "error");
                }

            },
            (_req, _res) => {
                window._controller?.notify(_res, "error");
            }
        );

    }

    const handleForgotLinkClick = (_e) => {
        document.location.href = "?view=forgot-password";
    }

    const renderBtnLabel = () => {
        if (!state.loading) {
            return 'Sign In';
        } else {
            return <i className='fa fa-cog fa-spin'></i>
        }
    };

    const displayErrorMsg = () => {
        return <div className='pharmarack-cms-form-error-message login'><i className='fa fa-circle-xmark'></i> Please enter you email or phone number</div>
    };

    return (

        <div className="pharmarack-cms-login-wrapper">

            <div className="pharmarack-cms-login-form">

                <div className="pharmarack-cms-login-form-header">
                    <img src="/assets/imgs/logo.svg" />
                    <p>Sign In to Continue</p>
                </div>

                <div className="pharmarack-cms-form-fields">
                    <div className="pharmarack-cms-form-row">
                        <input type='text' placeholder='Email or Mobile Number' onKeyDown={handleUserKeyDown} onChange={handleUserChange} value={state.username} />
                    </div>
                    <div className="pharmarack-cms-form-row">
                        <input type='password' placeholder='Password' onKeyDown={handlePasswordKeyDown} onChange={handlePasswordChange} value={state.password} />
                    </div>
                </div>

                <div className="pharmarack-cms-form-action">
                    <button className={`pharmarack-cms-btn primary block ${state.loading ? "loading" : ""}`} onClick={handleSignInBtnClick}>{renderBtnLabel()}</button>
                    <a href="#" className='pharmarack-cms-forgot-link' onClick={handleForgotLinkClick}>Forgot Password?</a>
                </div>

                <div className="pharmarack-cms-login-powered-by">
                    <span>Powered by</span>
                    <img src='/assets/imgs/powered.svg' />
                </div>

            </div>

            {displayErrorMsg()}

        </div>

    )

}

export default Login;