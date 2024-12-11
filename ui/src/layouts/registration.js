import React, { useState, useEffect } from 'react';

const Registration = (props) => {

    const emailRegx = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const mobileRegx = /^[6-9]\d{9}$/;
    const alphaRegx = /^(?=.*[a-z])(?=.*[A-Z]).+$/;
    const numberRegx = /^(?=.*\d).+$/;
    const specialRegx = /^(?=.*[!@#$%^&*(),.?":{}|<>]).+$/;

    const [role, setRole] = useState(null); 
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
        if (emailRegx.test(state.email) && mobileRegx.test(state.mobile) && state.fullName && state.password && state.confirmPassword) {
            
            if (state.password == state.confirmPassword) {
                if (validatePassword()) {
                    setBtnEnable(true);
                    setResponse({
                        msgType: "success",
                        message: ""
                    });
                } else {
                    setBtnEnable(false);
                    setResponse({
                        msgType: "error",
                        message: "Password strength is weak"
                    });    
                }                
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
        const _roles = roles.filter((item) => item._id == _e.target.value);        
        setRole(_roles ? _roles[0] : null);
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
                endpoint: "/system/v1/register/user-types",
            }, false);

            setRoles(roles);
            if (roles && roles.length > 0) {
                setState({...state, userType: roles[0]._id});
                setRole(roles[0]);
            }            

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
                endpoint: "/system/v1/register",
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

    const updatePasswordStatus = () => {

        if (!role) return null;
    
        const { minLength, maxLength, complex } = role.authType;
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

        if (role) {
            if (state.password) {
                if (role.authType.complex == 1) {
                    return (state.password.length >= role.authType.minLength && state.password.length <= role.authType.maxLength);
                } else {
                    return (state.password.length >= role.authType.minLength && state.password.length <= role.authType.maxLength && alphaRegx.test(state.password) && numberRegx.test(state.password) && specialRegx.test(state.password));
                }
            }
        }

        return false;

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

            <div className='pharmarack-cms-password-status-box'>{updatePasswordStatus()}</div>

        </div>

    )

}

export default Registration;