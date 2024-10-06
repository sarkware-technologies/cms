import React, { useState, useEffect } from 'react';

const Login = (props) => {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const mobileRegex = /^[6-9]\d{9}$/;

    const [state, setState] = useState({
        username: "",
        password: "",
        role: null,
        userNameEmpty: true,
        passwordEmpty: true,
        authError: false,
        authErrorMsg: "",
        loading: false,
        roleSelectorVisible: false
    });

    const [roles, setRoles] = useState([]); 
    const [btnEnable, setBtnEnable] = useState(false);
    const [roleLabel, setRoleLabel] = useState('');

    useEffect(() => { 
        if (!state.userNameEmpty && !state.passwordEmpty) {
            if (emailRegex.test(state.username) || mobileRegex.test(state.username)) {
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

    const handlePasswordChange = (_e) => {
        let isEmpty = true;
        if (_e.target.value) {
            isEmpty = false;
        }
        setState((prevState) => ({ ...prevState, password: _e.target.value, passwordEmpty: isEmpty }));
    }

    const handleRoleChange = (_e) => {
        const selectedOption = _e.target.selectedOptions[0];
        setRoleLabel(selectedOption.label);
        setState((prevState) => ({ ...prevState, role: _e.target.value }));
    };

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

    const handleSignInBtnClick = async () => {

        try {

            if (state.roleSelectorVisible) {

                if (state.role) {

                    const response = await window._controller.docker.dock({
                        method: "POST",
                        endpoint: "/system/auth/select-role",
                        payload: { 
                            user: state.username,
                            password: state.password,
                            role: state.role
                        }
                    }, false); 

                    if (response.type == "success") {
                        setupSession(response);
                    } else {
                        setState((prevState) => ({ ...prevState, authError: true, authErrorMsg: "Something went wrong, please try again" }));
                    }

                } else {
                    setState((prevState) => ({ ...prevState, authError: true, authErrorMsg: "Please select your role" }));
                }

            } else {

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
            }

        } catch (e) {
            setState((prevState) => ({ ...prevState, authError: true, authErrorMsg: e.message }));
        }
        
    }

    const setupSession = (_response) => {

        /* Successfully signed in */
        localStorage.setItem("pharmarack_cms_email", _response.email);
        localStorage.setItem("pharmarack_cms_mobile", _response.mobile);
        localStorage.setItem("pharmarack_cms_role_name", _response.roleName);                    
        localStorage.setItem("pharmarack_cms_full_name", _response.fullName);
        localStorage.setItem("pharmarack_cms_access_token", _response.accessToken);
        localStorage.setItem("pharmarack_cms_refresh_token", _response.refreshToken);
        localStorage.setItem("pharmarack_cms_menus", JSON.stringify(_response.modules));

        document.location.href = "/main";
        
    };

    const handleForgotLinkClick = (_e) => {
        document.location.href = "?view=forgot-password";
    }

    const handleRegisterLinkClick = (_e) => {
        document.location.href = "/registration";
    };

    const renderBtnLabel = () => {
        if (!state.loading) {
            return roles.length > 0 ? `${ (state.role && roleLabel) ? ("Sign in as "+ roleLabel) : "Select Role" }` : 'Sign In';
        } else {
            return <i className='fa fa-cog fa-spin'></i>
        }
    };

    return (

        <div className="pharmarack-cms-login-wrapper">

            {state.authError ? (<div className={`pharmarack-cms-form-error-message login`}><i className="fa fa-circle-xmark"></i> {state.authErrorMsg}</div>) : null}

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

                <div className={`pharmarack-cms-form-action ${ roles.length > 0 ? "visible" : "hidden" }`}>
                    <select onChange={handleRoleChange} value={state.role} className={`pharma-cms-form-field select`}>
                        {roles.map((_item, _index) => { return <option key={"option_"+ _index} value={_item["_id"]}>{_item["title"]}</option> })}
                    </select>
                </div>

                <div className="pharmarack-cms-form-action">
                    <button className={`pharmarack-cms-btn primary block ${!btnEnable ? "disabled" : ""}`} disabled={!btnEnable} onClick={handleSignInBtnClick}>{renderBtnLabel()}</button>
                    <a href="#" className='pharmarack-cms-forgot-link' onClick={handleForgotLinkClick}>Forgot Password?</a>
                    <div className="pharmarack-cms-login-form-seperator"></div>
                    <p className="pharmarack-cms-register-link-p">New User? <a href="/registration" className='pharmarack-cms-register-link' onClick={handleRegisterLinkClick}>Register Now</a></p>
                </div>

                <div className="pharmarack-cms-form-action">


                </div>

                <div className="pharmarack-cms-login-powered-by">
                    <span>Powered by</span>
                    <img src='/assets/imgs/powered.svg' />
                </div>

            </div>

        </div>

    )

}

export default Login;