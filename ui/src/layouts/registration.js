import React, { useState, useEffect } from 'react';

const Login = (props) => {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const mobileRegex = /^[6-9]\d{9}$/;

    const [roles, setRoles] = useState([]); 
    const [btnEnable, setBtnEnable] = useState(false); 

    const [state, setState] = useState({
        fullName: "",
        email: "",
        mobile: "",
        userType: "",
        password: "",
        confirmPassword: ""
    });

    const [response, setResponse] = useState({
        msgType: "error",
        message: ""
    });

    useEffect(() => {
        if (emailRegex.test(state.email) && mobileRegex.test(state.mobile) && state.fullName && state.password && state.confirmPassword) {
            
            if (state.password == state.confirmPassword) {
                setBtnEnable(true);
                setResponse({
                    msgType: "success",
                    message: ""
                });
            } else {
                setBtnEnable(false);
                setResponse({
                    msgType: "error",
                    message: "Password and confirm password must be same"
                });
            }

        } else {
            setBtnEnable(false);
        }
    }, [state]);

    useEffect(() => {
        getRoleList();
    }, []);

    const handleFullNameChange = (_e) => {
        setState({...state, fullName: _e.target.value});
    };

    const handleEmailChange = (_e) => {
        setState({...state, email: _e.target.value});
    };

    const handleMobileChange = (_e) => {
        setState({...state, mobile: _e.target.value});
    };

    const handleUserTypeChange = (_e) => {
        setState({...state, userType: _e.target.value});
    };

    const handlePasswordChange = (_e) => {
        setState({...state, password: _e.target.value});
    };

    const handleConfirmPasswordChange = (_e) => {
        setState({...state, confirmPassword: _e.target.value});
    };

    const getRoleList = async () => {

        try {

            const roles = await window._controller.docker.dock({
                method: "GET",
                endpoint: "/system/register/user-types",
            }, false);

            setRoles(roles);

        } catch (e) {

            setResponse({
                msgType: "success",
                message: e.message
            });

        }

    };

    const handleRegisterBtnClick = async () => {

        try {

            const response = await window._controller.docker.dock({
                method: "POST",
                endpoint: "/system/register",
                payload: { 
                    fullName: state.fullName,
                    email: state.email,
                    mobile: state.mobile,
                    userType: state.userType,
                    password: state.password
                }
            }, false);

            if (response.status) {
                setState({
                    fullName: "",
                    email: "",
                    mobile: "",
                    userType: "",
                    password: "",
                    confirmPassword: ""
                });
    
                setResponse({
                    msgType: "success",
                    message: response.message
                });
            } else {
                setResponse({
                    msgType: "error",
                    message: response.message
                });
            }

        } catch (e) {

            setResponse({
                msgType: "success",
                message: e.message
            });

        }

    };

    return (

        <div className="pharmarack-cms-register-wrapper">

            {response.message ? (<div className={`pharmarack-cms-form-${response.msgType}-message login`}><i className={`fa ${ response.msgType == "error" ? "fa-circle-xmark" : "fa-circle-check" }`}></i> {response.message}</div>) : null}

            <div className="pharmarack-cms-register-form">

                <div className="pharmarack-cms-register-form-header">
                    <img src="/assets/imgs/logo.svg" />
                    <p>Registration</p>
                </div>

                <div className="pharmarack-cms-form-fields">
                    <div className="pharmarack-cms-form-row">
                        <input type='text' placeholder='Full Name' value={state.fullName} onChange={handleFullNameChange} />
                    </div>
                    <div className="pharmarack-cms-form-row">
                        <input type='text' placeholder='Email Id' value={state.email} onChange={handleEmailChange} />
                    </div>
                    <div className="pharmarack-cms-form-row">
                        <input type='text' placeholder='Mobile Number' value={state.mobile} onChange={handleMobileChange} />
                    </div>
                    <div className="pharmarack-cms-form-row">
                        <select onChange={handleUserTypeChange} value={state.userType} className={`pharma-cms-form-field select`}>
                            {roles.map((_item, _index) => { return <option key={"option_"+ _index} value={_item["_id"]}>{_item["title"]}</option> })}
                        </select>
                    </div>
                    <div className="pharmarack-cms-form-row">
                        <input type='password' placeholder='Password' value={state.password} onChange={handlePasswordChange} />
                    </div>
                    <div className="pharmarack-cms-form-row">
                        <input type='password' placeholder='Confirm Password' value={state.confirmPassword} onChange={handleConfirmPasswordChange} />
                    </div>
                </div>

                <div className="pharmarack-cms-form-action">
                    <button className={`pharmarack-cms-btn primary block ${!btnEnable ? "disabled" : ""}`} disabled={!btnEnable} onClick={handleRegisterBtnClick} >Register</button>
                    <p className='pharmarack-cms-login-link-wrapper'>Already a User? <a href="/" className='pharmarack-cms-login-link'>Login Now</a></p>
                </div>

            </div>

        </div>

    )

}

export default Login;