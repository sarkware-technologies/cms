import React, { useEffect, useState, createRef } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ContextWrapper from '../utils/context';
import AppLayout from './app-layout';
import PageNotfound from './page-not-found';

const System = (props) => {

    let currentModule = React.createRef();
    let appLayout = React.createRef();
    const [modules, setModules] = useState([]);

    const registerCurrentInstance = (_moduleName) => {
        window._controller.setCurrentModuleInstance(_moduleName, currentModule.current);
    }

    useEffect(() => {
        window._controller.layout = appLayout;
        try {
            const _modules = JSON.parse(localStorage.getItem("pharmarack_cms_menus"));
            if (_modules && Array.isArray(_modules)) {
                setModules(_modules); 
            } else {
                document.location.href = "/";
            }
            
        } catch (e) {
            console.log(e);
        }
        
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                {/* Render the AppLayout component */}
                <Route path="/main" element={<AppLayout ref={appLayout} />}>
                    {/* Dynamically render routes based on modules */}
                    {modules.map((module) => (
                        <Route
                            key={module._id}
                            path={module.handle} // Create dynamic routes
                            element={
                                <ContextWrapper
                                    key={module.handle}
                                    ref={currentModule}
                                    registerInstance={(_module) => registerCurrentInstance(_module)}
                                    name={module.handle}  // Pass the module handle
                                />
                            }
                        />
                    ))}
                    {/* Fallback Route */}
                    <Route path="*" element={<PageNotfound />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default System;