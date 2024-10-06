import React, {useState, forwardRef, useImperativeHandle} from "react";

const Alignment = (props, ref) => {

    const [alignment, setAlignment] = useState((('value' in props.config) ? props.config.value : "left"));

    const self = {
        getVal: () => alignment,
        setVal: (_align) => setAlignment(_align)        
    };
    /* Expose the component to the consumer */
    useImperativeHandle(ref, () => self);

    const handleAlignBtnClick = (_e, _align) => {
        _e.preventDefault();
        setAlignment(_align);
    };

    return (
        <div className="pharmarack-cms-component-text-alignment">
            <a href="#" className={(alignment === "left" ? "active" : "")} onClick={(_e) => handleAlignBtnClick(_e, "left")}><i className="fa fa-align-left"></i></a>
            <a href="#" className={(alignment === "right" ? "active" : "")} onClick={(_e) => handleAlignBtnClick(_e, "right")}><i className="fa fa-align-right"></i></a>
            <a href="#" className={(alignment === "center" ? "active" : "")} onClick={(_e) => handleAlignBtnClick(_e, "center")}><i className="fa fa-align-center"></i></a>
            <a href="#" className={(alignment === "justify" ? "active" : "")} onClick={(_e) => handleAlignBtnClick(_e, "justify")}><i className="fa fa-align-justify"></i></a>
        </div>
    );

};

export default forwardRef(Alignment);