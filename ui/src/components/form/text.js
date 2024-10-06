import React, {forwardRef, useImperativeHandle, useState} from "react";

const Text = (props, ref) => {

    const [text, setText] = useState(props.config.text);

    useImperativeHandle(ref, () => {
        return { 
            setVal: (_val) => setText(_val)                
        }
    });

    return (<label className={props.config.classes}>{text}</label>);

}

export default forwardRef(Text);