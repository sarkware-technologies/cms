import { v4 as uuidv4 } from 'uuid';
import React, {useState, forwardRef, useImperativeHandle} from "react";
import View from "./view";

/**
 * 
 * Just a wrapper for nesting view inside view
 * Since react functional component has issue with direct nested components
 * We are using this dirty method
 * 
 * @param {*} props 
 * @param {*} ref 
 * @returns 
 * 
 */
const SubView = (props) => {

    const viewRef = React.createRef(); 
    const widget = <View key={uuidv4()} ref={viewRef} config={props.config} handle={props.handle} isSubView={true} />
    window._controller.registerField(props.handle, "view", viewRef);

    return widget;

};

export default SubView;