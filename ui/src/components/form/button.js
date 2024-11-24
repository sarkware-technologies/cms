import { v4 as uuidv4 } from 'uuid';
import React, {forwardRef, useImperativeHandle, useState} from "react";

const Button = (props, ref) => {

    const config = {...props.config};
    
    const [state, setState] = useState({               
        label: ('label' in props) ? props.label : "",        
        disable: ('disable' in props) ? props.disable : false        
    });

    const handleButtonClick = (_e, _action) => {
        let contextObj = window._controller.getCurrentModuleInstance();
        if (contextObj && contextObj.onActionBtnClick) {           
            contextObj.onActionBtnClick(_action);
        }
    }

    const renderButton = () => {
        
        let classes = "pharmarack-cms-btn "+ config.action +" ";
        if (config.theme) {
            classes += config.theme +" ";
        }
        if (config.classes) {
            classes += config.classes;
        }
        if (state.disable) {
            classes += " disabled";
        }        

        return <button key={uuidv4()} className={classes} onClick={(e) => handleButtonClick(e, config.action)}>{config.label}</button>;

    }

    useImperativeHandle(ref, () => {
        return { 
            getVal: () => state.label,
            setVal: (_label) => setState({...state, label: _label}),
            setStatus: (_status) => setState({...state, disable: _status}) 
        }
    });    

    return renderButton();

}

export default forwardRef(Button);