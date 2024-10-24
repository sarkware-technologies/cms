import React, {useState, forwardRef, useImperativeHandle} from "react";

const Confirm = (props, ref) => {

    let timer = null;
    let visibility = "";    
    const [state, setState] = useState({msg: "", type: "info", visible: false});

    const self = {        
        probe: (_msg, _type) => { 
            if (timer) {
                clearTimeout(timer);
            }
            setState({msg: _msg, type: _type, visible: true}); 
        }
    };

    /* Expose the component to the consumer */
    useImperativeHandle(ref, () => self);

    if (state.visible) {
        visibility = "visible";
        //timer = setTimeout(() => { setState({...state, visible: false}) }, 3500);
    }   

    return <div className={`pharmarack-cms-confirm-bar ${state.type} ${visibility}`}>{state.msg}</div>;

}

export default forwardRef(Confirm);