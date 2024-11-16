import React, {useState, forwardRef, useImperativeHandle} from "react";

const Confirm = (props, ref) => {

    const contextObj = window._controller.getCurrentModuleInstance(); 
    const [state, setState] = useState({title : "", msg: "", task: null, visible: false});

    const self = {        
        show: (_task, _title, _msg) => setState({task: _task, title: _title, msg: _msg, visible: true}),
        hide: () => setState({msg: "", visible: false})
    };

    useImperativeHandle(ref, () => self);

    const handleUserClick = (_choice) => {
        if (contextObj && contextObj.onUserConfirm) { 
            contextObj.onUserConfirm(state.task, (_choice == 1 ? false : true));
        }
        self.hide();
    };

    return (
        <div className={`pharmarack-cms-confirm-bar ${state.type} ${state.visible ? "visible" : ""}`}>
            <h3>{state.title}</h3>
            <p>{state.msg}</p>
            <div className="actions">
                <button className="pharmarack-cms-btn secondary" onClick={(e) => handleUserClick(1)}>Cancel</button>
                <button className="pharmarack-cms-btn primary" onClick={(e) => handleUserClick(2)}>Proceed</button>
            </div>
        </div>
    );

}

export default forwardRef(Confirm);