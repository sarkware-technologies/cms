import React, { createRef } from "react";
import Utils from "./utils/utils";
import LayoutLoader from "./utils/layout";

/**
 *
 *
 * @author : Sark
 * @version: 1.0
 *
 *
 */
export default class Controller extends React.Component {
    
    constructor(props) {

        super(props);

        /**
         * 
         * Used to store the snapshot of the contexts
         * 
         */
        this.snapshot = {};
        
        /**
         * 
         * Holds the current name of the context 
         * 
         */
        this.current = null;
        
        /**
         * 
         * Holds the reference to the context bar component
         * 
         */
        this.ContextBar = createRef();                
        
        /**
         * 
         * This is the global state of the application
         * we use to contorl the theme, locale and menus
         * 
         */
        this.state = { theme: "", locale: "", menus: [] };

        /**
         * 
         * 
         * 
         */
        this.utils = new Utils();

        /**
         * 
         * Since app is the root component, we can use this bucket to store shared data
         * which needs to be fetched only once and used across the application
         * 
         */
        this.bucket = {};

        /**
         * 
         * 
         * 
         */
        window["_controller"] = this;

    };      

    render = () => <LayoutLoader />;

}