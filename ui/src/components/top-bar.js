import React, {useState, forwardRef, useImperativeHandle} from "react";
import { useNavigate } from "react-router-dom";

const TopBar = (props, ref) => {

    const [context, setContext] = useState({
        title: "",
        actions: [],
        breadcrumb: ""        
    });

    let caps = {
        get: true,
        post: false,
        delete: false,
        put: false,
        cancel: true
    };

    const navigate = useNavigate();
    const contextObj = window._controller.getCurrentModuleInstance();     

    if (contextObj) {
        caps = contextObj.component.capability;
    }

    const self = {
        loadTitle: _title => setContext({...context, title: _title}),
        loadActions: _actions => setContext({...context, actions: _actions}),
        loadBreadcrumb: _breadcrumb => setContext({...context, breadcrumb: _breadcrumb}),
        loadTopBar: (_title, _breadcrumb, _action) => setContext({title: _title, actions: _action, breadcrumb: _breadcrumb})
    };       

    /* Expose the component to the consumer */
    useImperativeHandle(ref, () => self);

    const dispatchClickEvent = (_e, _action) => { 

        _e.preventDefault();

        const href = _e.target.getAttribute("href");
        if (href) {
            navigate(href);
        } else {
            if (contextObj && contextObj.onActionBtnClick) {
                if (_action.toLowerCase() == "back") {
                    contextObj.triggerBack();
                } else {
                    contextObj.onActionBtnClick(_action);
                }            
            }
        }
        
    };    

    const handleCollapsibleClick = (_e) => {
        window._controller.layout.current.toggleSidebar();
    };

    const renderAction = (_config) => {

        if (!_config.method || !caps || !caps[_config.method]) {
            return null;
        }

        let icon = "";        
        let classes = "pharmarack-cms-btn "+ _config.classes +" "+ _config.theme;

        if (!_config.status) {
            classes += " disabled";
        }

        if (_config.icon !== "") {
            icon = <i className={_config.icon}></i>
        }

        if (_config.type && _config.type == "link") {
            return <a href={'/main'+_config.action} key={_config.action} className={classes} onClick={(e) => dispatchClickEvent(e,  _config.action)}>{icon}{_config.label}</a>
        } else {
            return <button key={_config.action} className={classes} onClick={(e) => dispatchClickEvent(e, _config.action)}>{icon}{_config.label}</button>
        }

    };

    let _topBarDisplay = (context.title === "" && context.actions.length === 0) ? "none" : "flex";
    let _breadcrumbDisplay = context.breadcrumb !== "" ? "flex" : "none";
    
    return (
        <div className="pharmarack-cms-top-bar" style={{display: _topBarDisplay}}>
            <div className="pharmarack-cms-breadcrump-bar">
                <h1><button onClick={(e) => handleCollapsibleClick(e)}><i className="fa fa-bars"></i></button> {context.title} <span style={{display: _breadcrumbDisplay}}>{context.breadcrumb}</span></h1>                
            </div>
            {
                context.actions ? 
                <div className="pharmarack-cms-top-action-bar">{context.actions.map((item) => renderAction(item))}</div>
                : null
            }
            
        </div>
    );

}

export default forwardRef(TopBar);