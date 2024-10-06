import React, {useState, forwardRef, useImperativeHandle} from "react";

const Asset = (props, ref) => {

    const [alignment, setAlignment] = useState((('value' in props.config) ? props.config.value : "left"));

    const self = {
        getVal: () => alignment,
        setVal: (_align) => setAlignment(_align)        
    };
    /* Expose the component to the consumer */
    useImperativeHandle(ref, () => self);

    const handleAlignBtnClick = (_align) => {
        setAlignment(_align);
    };

    return (
        <div className="pharmarack-cms-component-text-alignment">
            
        </div>
    );

};

export default forwardRef(Asset);