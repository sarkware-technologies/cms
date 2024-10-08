import {forwardRef, useImperativeHandle} from "react";

const Actions = (props, ref) => {

    const type = props.type;

    const handleActionButtonClick = (_e, _action) => {
        const contextObj = window._controller.getCurrentModuleInstance();        
        if (contextObj && contextObj.onActionBtnClick) {
            contextObj.onActionBtnClick(_action);
        } else {
            console.error("Unexpected Error, current module is missing.!");
        }
    }

    const self = {

    };

    /* Expose the component to the consumer */
    useImperativeHandle(ref, () => self); 

    const renderActionBtn = (_config) => {
        let icon = "";        
        let classes = "pharmarack-cms-btn "+ _config.classes +" "+ _config.theme;
        if (!_config.status) {
            classes += " disabled";
        }
        if (_config.icon !== "") {
            icon = <i className={_config.icon}></i>
        }
        return <button key={_config.action} className={classes} onClick={(e) => handleActionButtonClick(e, _config.action)}>{icon}{_config.label}</button>
    }
  
    let actionBtns = [];
    
    for (let j = 0; j < props.config.actions.length; j++) {
        actionBtns.push(renderActionBtn(props.config.actions[j]));    
    }
    
    return <div className={`pharmarack-cms-action-bar pharmarack-cms-system-${type}-action-bar ${props.config.align}`}>{actionBtns}</div>

}

export default forwardRef(Actions);