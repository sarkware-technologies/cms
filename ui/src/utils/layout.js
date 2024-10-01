import React, { lazy, Suspense } from 'react';
import app_config from '../configs/config';
import Spinner from '../components/spiner';

const LayoutLoader = () => {    console.log("pathname : "+ location.pathname);

    let layout = null;
    let layoutConfig = null;
    const controller = window["_controller"];

    if (controller.utils.isAuthenticated()) {                
        layoutConfig = app_config.routes.authorized.find(item => item.getRole === controller.utils.getRole());        
    } else {
        if (location.pathname === "" || location.pathname === "/") {
            layoutConfig = app_config.routes.unauthorized.find(item => item.layout === "registration");
        } else {
            layoutConfig = app_config.routes.unauthorized.find(item => item.layout === location.pathname);
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
        layout = 'registration';
    }

    const LayoutComponent = lazy(() => import(`../layouts/${layout}`));

    return (
        <Suspense fallback={<Spinner />}>
            <LayoutComponent />
        </Suspense>
    );

};

export default LayoutLoader;