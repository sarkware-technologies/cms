import React, {useState, forwardRef, useImperativeHandle} from "react";

const SegmentPreview = (props, ref) => {    

    const self = {};
    /* Expose the component to the consumer */
    useImperativeHandle(ref, () => self);

    return (
        <div className="pharmarack-cms-segment-preview"></div>
    );

};

export default forwardRef(SegmentPreview);