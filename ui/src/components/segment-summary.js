import React, {forwardRef, useImperativeHandle, useEffect, useState} from "react";

const SegmentSummary = (props, ref) => {

    const [state, setState] = useState({
        retailer: props.options.retailer,
        whitelisted: props.options.whitelisted,
        balcklisted: props.options.balcklisted
    });

    const self = {        
        setSummary: (options) => setState(options)
    };

    useImperativeHandle(ref, () => self);

    return (
        <table className="segment-summary-widget">
            <tbody>
                <tr>
                    <td><span>{state.retailer}</span><span>Retailers</span></td>
                    <td><span>{state.whitelisted}</span><span>Whitelisted</span></td>
                    <td><span>{state.balcklisted}</span><span>Blacklisted</span></td>
                </tr>
            </tbody>
        </table>
    );

}

export default forwardRef(SegmentSummary);