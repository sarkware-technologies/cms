import React, { lazy, Suspense } from 'react';
import app_config from '../configs/config';
import Spinner from '../components/spiner';
import Notification from '../components/notification';

const LayoutLoader = () => {

    let layout = null;
    let layoutConfig = null;
    const controller = window["_controller"];
    //const _pathName =  location.pathname.replace(/^\//, '');
    const _pathName =  location.pathname;

    if (controller.utils.isAuthenticated()) { console.log("It is authenticated");
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

    layout = layoutConfig ? layoutConfig.layout : null;  console.log("Before final layout : "+ layout);

    if (!layout) {
        /**
         * 
         * If no layout found, fall back to 'login' layout 
         * We assume that there is alway a layout called 'login'
         * 
         */
        layout = 'login';
    }

    const LayoutComponent = lazy(() => import(`../layouts/${layout}`));

    return (
        <Suspense fallback={<Spinner />}>
            <LayoutComponent />
            <Notification ref={window._controller.notification} />
        </Suspense>
    );

};

export default LayoutLoader;