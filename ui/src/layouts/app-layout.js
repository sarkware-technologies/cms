import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import TopBar from "../components/top-bar";
import React, { useState, useEffect, createRef, forwardRef, useImperativeHandle } from "react";

const AppLayout = (props, ref) => {  

    const [collapse, setCollapse] = useState(false);
    const [modules, setModules] = useState([]);

    let topActionBar = createRef();   
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = (_e) => {
        _e.preventDefault();
        window._controller.logout();
    };

    const handleClick = (_context) => {  console.log("handleClick is called  : "+ _context);
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

    const handleLogoutClick = async() => {

        try {

            const response = await window._controller.docker.dock({
                method: "POST",
                endpoint: "/system/v1/auth/sign-out",
                payload: {}
            }); 

            window._controller.utils.clearSession();

        } catch (e) {
            console.log(e);
        }

    };

    // Example of setting modules from response
    useEffect(() => {

        let _modules = [];
        try {
            _modules = JSON.parse(localStorage.getItem("pharmarack_cms_menus"));
        } catch (e) {
            console.log(e);
        }   
    
        _modules.sort((a, b) => a.order - b.order);
        setModules(_modules);

        if (_modules.length > 0 && !location.pathname.includes("/main/")) {
            navigate(`/main/${_modules[0].handle}`); // Navigate to the first menu
        }
        
    }, [location.pathname, navigate]);

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
                        <p className="pharmarack-cms-sidebar-user-label">{localStorage.getItem("pharmarack_cms_full_name")}</p>
                        <p className="pharmarack-cms-sidebar-user-name">{localStorage.getItem("pharmarack_cms_role_name")}</p>
                    </div>
                </div>

                <div className="pharmarack-cms-sidebar-navigation">
                    <ul className="pharmarack-cms-sidebar-main-nav-ul">
                        {modules.map((module) => (
                            <li key={module._id}>                                
                                <NavLink
                                    to={`/main/${module.handle}`}
                                    className={({ isActive }) =>
                                        isActive
                                            ? "pharmarack-cms-system-menu-item active"
                                            : "pharmarack-cms-system-menu-item"
                                    }
                                    onClick={() => handleClick(module.handle)}
                                    title={module.title}
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