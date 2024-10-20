import React, { lazy, Suspense, useEffect } from 'react';
import app_config from '../configs/config';
import Spinner from '../components/spiner';
import Notification from '../components/notification';

const LayoutLoader = () => {

    let layout = null;
    let layoutConfig = null;
    const controller = window["_controller"];
    //const _pathName =  location.pathname.replace(/^\//, '');
    const _pathName =  location.pathname;

    if (controller.utils.isAuthenticated()) {
        if (_pathName === "" || _pathName === "/") {
            location.href = "/main";
        } else {
            layoutConfig = app_config.routes.unauthorized.find(item => item.layout === "main"); 
        }           
    } else {

        if (location.pathname === "" || location.pathname === "/") {
            layoutConfig = app_config.routes.unauthorized.find(item => item.path === "login");
        } else {
            layoutConfig = app_config.routes.unauthorized.find(item => item.path === _pathName);
        } 

    }

    layout = layoutConfig ? layoutConfig.layout : null; 

    if (!layout) {
        /**
         * 
         * If no layout found, fall back to 'login' layout 
         * We assume that there is alway a layout called 'login'
         * 
         */
        layout = 'login';
    }

    let appLayout = React.createRef();
    const LayoutComponent = lazy(() => import(`../layouts/${layout}`));

    useEffect(() => {
        //window._controller.layout = appLayout;
    }, []);

    return (
        <Suspense fallback={<Spinner />}>
            <LayoutComponent />
            <Notification ref={window._controller.notification} />
        </Suspense>
    );

};

export default LayoutLoader;