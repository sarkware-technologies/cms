import React, {forwardRef, useEffect, createRef, useImperativeHandle} from "react";

const View = (props, ref) => {

    const self =  {}

    /* Expose the component to the consumer */
    useImperativeHandle(ref, () => self);

};


export default forwardRef(View);