import React, { lazy, Suspense } from 'react';
import app_config from '../configs/config';
import Spinner from '../components/spiner';

const LayoutLoader = () => {

    let layout = null;
    let layoutConfig = null;
    const controller = window["_controller"];

    if (controller.utils.isAuthenticated()) {                
        layoutConfig = app_config.authorized.find(item => item.getRole === controller.utils.getRole());        
    } else {
        layoutConfig = app_config.unauthorized.find(item => item.layout === location.pathname);
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

    const LayoutComponent = lazy(() => import(`../layouts/${layout}`));

    return (
        <Suspense fallback={<Spinner />}>
            <LayoutComponent />
        </Suspense>
    );

};

export default LayoutLoader;