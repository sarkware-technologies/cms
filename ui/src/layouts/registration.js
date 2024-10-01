import React, { useState, useEffect } from 'react';

const Login = (props) => {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const mobileRegex = /^[6-9]\d{9}$/;

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [userType, setUserType] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [btnEnable, setBtnEnable] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");    

    useEffect(() => {  console.log(email, mobile, fullName, password, confirmPassword);
        if (emailRegex.test(email) && mobileRegex.test(mobile) && fullName && password && confirmPassword) {
            
            if (password == confirmPassword) {
                setBtnEnable(true);
                setErrorMessage("");
            } else {
                setBtnEnable(false);
                setErrorMessage("Password and confirm password must be same");
            }

        } else {
            setBtnEnable(false);
        }
    }, [email, mobile, fullName, userType, password, confirmPassword]);

    const handleFullNameChange = (_e) => {
        setFullName(_e.target.value);
    };

    const handleEmailChange = (_e) => {
        setEmail(_e.target.value);
    };

    const handleMobileChange = (_e) => {
        setMobile(_e.target.value);
    };

    const handleUserTypeChange = (_e) => {
        setUserType(_e.target.value);
    };

    const handlePasswordChange = (_e) => {
        setPassword(_e.target.value);
    };

    const handleConfirmPasswordChange = (_e) => {
        setConfirmPassword(_e.target.value);
    };

    const handleRegisterBtnClick = () => {

        if (state.authType == 1 && state.isPassEmpty) {
            return;
        } else if (state.authType == 2 && state.isOtpEmpty) {
            return;
        }

        window._controller.dock(
            {
                method: "POST",
                endpoint: "/system/user/register",
                payload: { 
                    fullName: fullName,
                    email: email,
                    mobile: mobile,
                    userType: userType,
                    password: password
                }
            },
            (_req, _res) => {

                if (_res.status) {

                    

                } else {
                    window._controller?.notify(_res.message, "error");
                }

            },
            (_req, _res) => {
                window._controller?.notify(_res, "error");
            }
        );

    }

    const displaySuccessMsg = () => {
        if (successMessage) {
            return <div className='pharmarack-cms-form-error-message login'><i className='fa fa-circle-xmark'></i> {successMessage}</div>
        }
        return null;        
    };

    const displayErrorMsg = () => {
        if (errorMessage) {
            return <div className='pharmarack-cms-form-error-message login'><i className='fa fa-circle-xmark'></i> {errorMessage}</div>
        }
        return null;        
    };

    return (

        <div className="pharmarack-cms-register-wrapper">

            {displayErrorMsg()}

            <div className="pharmarack-cms-register-form">

                <div className="pharmarack-cms-register-form-header">
                    <img src="/assets/imgs/logo.svg" />
                    <p>Registration</p>
                </div>

                <div className="pharmarack-cms-form-fields">
                    <div className="pharmarack-cms-form-row">
                        <input type='text' placeholder='Full Name' value={fullName} onChange={handleFullNameChange} />
                    </div>
                    <div className="pharmarack-cms-form-row">
                        <input type='text' placeholder='Email Id' value={email} onChange={handleEmailChange} />
                    </div>
                    <div className="pharmarack-cms-form-row">
                        <input type='text' placeholder='Mobile Number' value={mobile} onChange={handleMobileChange} />
                    </div>
                    <div className="pharmarack-cms-form-row">
                        <select value={userType} onChange={handleUserTypeChange} >
                            <option value="" default>Select user type</option>
                        </select>
                    </div>
                    <div className="pharmarack-cms-form-row">
                        <input type='password' placeholder='Password' value={password} onChange={handlePasswordChange} />
                    </div>
                    <div className="pharmarack-cms-form-row">
                        <input type='password' placeholder='Confirm Password' value={confirmPassword} onChange={handleConfirmPasswordChange} />
                    </div>
                </div>

                <div className="pharmarack-cms-form-action">
                    <button className={`pharmarack-cms-btn primary block ${!btnEnable ? "disabled" : ""}`} disabled={!btnEnable} onClick={handleRegisterBtnClick} >Register</button>
                    <p className='pharmarack-cms-login-link-wrapper'>Already a User? <a href="#" className='pharmarack-cms-login-link'>Login Now</a></p>
                </div>

            </div>

        </div>

    )

}

export default Login;