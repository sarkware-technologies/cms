import { Outlet, NavLink, Link } from "react-router-dom";
import TopBar from "../components/top-bar";
import React, { useState, useEffect, createRef, forwardRef, useImperativeHandle } from "react";

const AppLayout = (props, ref) => {  

    const [collapse, setCollapse] = useState(false);
    const [modules, setModules] = useState([]);

    let topActionBar = createRef();    

    const handleLogout = (_e) => {
        _e.preventDefault();
        window._controller.logout();
    };

    const handleClick = (_context) => {
        const current = window._controller.getCurrentModule();
        if (current == _context) {
            const contextObj = window._controller.getCurrentModuleInstance();
            if (contextObj) {
                const cKeys = Object.keys(contextObj.component.currentRecord);
                for (let i = 0; i < cKeys.length; i++) {
                    contextObj.currentRecord[cKeys[i]] = null;
                }                                
                contextObj.switchView("main_view");
            }
        }
    };

    const renderMenuIcon = (_module) => {

        if (_module.iconType == 1) {
            return null;
        } else if (_module.iconType == 2) {
            return null;
        } else if (_module.iconType == 3) {
            return <i className={_module.icon}></i>
        }

    };

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
                    }); 

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
                }); 
    
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

    const handleLogoutClick = async() => {

        try {

            const response = await window._controller.docker.dock({
                method: "POST",
                endpoint: "/system/auth/sign-out",
                payload: { 
                    user: state.username,
                    password: state.password
                }
            }); 

            clearSession();

        } catch (e) {

        }

    };

    const clearSession = () => {

        /* Successfully signed in */
        sessionStorage.removeItem("pharmarack_cms_email");
        sessionStorage.removeItem("pharmarack_cms_mobile");
        sessionStorage.removeItem("pharmarack_cms_role_name");                    
        sessionStorage.removeItem("pharmarack_cms_full_name");
        sessionStorage.removeItem("pharmarack_cms_access_token");
        sessionStorage.removeItem("pharmarack_cms_refresh_token");
        sessionStorage.removeItem("pharmarack_cms_menus");

        document.location.href = "/";
        
    };

    // Example of setting modules from response
    useEffect(() => {
        let _modules = [];
        try {
            _modules = JSON.parse(sessionStorage.getItem("pharmarack_cms_menus"));
        } catch (e) {
            console.log(e);
        }   
        
        const signInResponse = {
            modules: _modules
        };
        setModules(signInResponse.modules); // Set the modules into state
        
    }, []);

    useImperativeHandle(ref, () => {
        return {
            toggleSidebar: () => setCollapse(!collapse),
            getTopActionBar: () => topActionBar    
        };        
    }); 

    useEffect(() => {        
        window._controller.ContextBar = topActionBar;
    }, [topActionBar]); 
    
    let wrapperClass = collapse ? "collapse" : "expand";

    return (
        <>
        <div className={`pharmarack-cms-master-container ${wrapperClass}`}>
            <div className="pharmarack-cms-left-section">
                <div className="pharmarack-cms-sidebar-branding">
                    <h1><img src="/assets/imgs/logo.svg" alt="logo" /> <span>CMS</span></h1>
                </div>

                <div className="pharmarack-cms-sidebar-user">
                    <div><i className="fa fa-user"></i></div>
                    <div>
                        <p className="pharmarack-cms-sidebar-user-label">{sessionStorage.getItem("pharmarack_cms_full_name")}</p>
                        <p className="pharmarack-cms-sidebar-user-name">{sessionStorage.getItem("pharmarack_cms_role_name")}</p>
                    </div>
                </div>

                <div className="pharmarack-cms-sidebar-navigation">
                    <ul className="pharmarack-cms-sidebar-main-nav-ul">
                        {modules.map((module) => (
                            <li key={module._id}>
                                <NavLink 
                                    to={`/main/${module.handle}`} 
                                    className="pharmarack-cms-system-menu-item" 
                                    onClick={() => handleClick(module.handle)}
                                    activeClassName="active"
                                >
                                    <span>{module.title}</span> 
                                    {renderMenuIcon(module)}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="pharmarack-cms-sidebar-bottom-section">
                    <a className="pharmarack-cms-system-menu-item" onClick={handleLogoutClick}>
                        <span>Logout</span> <i className="fa fa-power-off"></i>
                    </a>
                </div>
            </div>

            <div className="pharmarack-cms-right-section">
                <div className="pharmarack-cms-system-master-content-container pharmarack-cms-system-breadcrumb-section">
                    <TopBar ref={topActionBar} />
                </div>
                <div className="pharmarack-cms-system-content-wrapper">
                    <Outlet />
                </div>
            </div>
        </div>
        </>
    );
};

export default forwardRef(AppLayout);