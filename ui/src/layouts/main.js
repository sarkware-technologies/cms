import { Outlet, NavLink, Link } from "react-router-dom";
import TopBar from "../components/top-bar";
import React, { useState, useEffect, createRef, forwardRef, useImperativeHandle } from "react";

const AppLayout = (props, ref) => { 

    let _modules = [];
    try {
        _modules = JSON.parse(sessionStorage.getItem("pharmarack_cms_menus"));
    } catch (e) {
        console.log(e);
    }    

    const [collapse, setCollapse] = useState(false);
    const [modules, setModules] = useState(_modules);

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

    // Example of setting modules from response
    useEffect(() => {
        const signInResponse = {
            modules: [
                // Modules array from the sign-in response goes here
            ]
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
        <div className={`fields-factory-master-container ${wrapperClass}`}>
            <div className="fields-factory-left-section">
                <div className="fields-factory-sidebar-branding">
                    <h1><img src="/assets/imgs/powered.svg" alt="logo" /> <span>CMS</span></h1>
                </div>

                <div className="fields-factory-sidebar-user">
                    <div><i className="fa fa-user"></i></div>
                    <div>
                        <p className="fields-factory-sidebar-user-label">{sessionStorage.getItem("pharmarack_cms_full_name")}</p>
                        <p className="fields-factory-sidebar-user-name">{sessionStorage.getItem("pharmarack_cms_role_name")}</p>
                    </div>
                </div>

                <div className="fields-factory-sidebar-navigation">
                    <ul className="fields-factory-sidebar-main-nav-ul">
                        {modules.map((module) => (
                            <li key={module._id}>
                                <NavLink 
                                    to={`/${module.handle}`} 
                                    className="fields-factory-system-menu-item" 
                                    onClick={() => handleClick(module.handle)}
                                    activeClassName="active"
                                >
                                    <span>{module.title}</span> 
                                    <i className="fa fa-mobile"></i>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="fields-factory-sidebar-bottom-section">
                    <a className="fields-factory-system-menu-item" onClick={handleLogout}>
                        <span>Logout</span> <i className="fa fa-power-off"></i>
                    </a>
                </div>
            </div>

            <div className="fields-factory-right-section">
                <div className="fields-factory-system-master-content-container fields-factory-system-breadcrumb-section">
                    <TopBar ref={topActionBar} />
                </div>
                <div className="fields-factory-system-content-wrapper">
                    <Outlet />
                </div>
            </div>
        </div>
        </>
    );
};

export default forwardRef(AppLayout);
