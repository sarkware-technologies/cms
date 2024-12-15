import React, {forwardRef, useImperativeHandle, useEffect, useState} from "react";

const SponsoredSummary = (props, ref) => {

    const [state, setState] = useState({
        impression: props.options ? props.options.impression : 1000,
        addedToCart: props.options ? props.options.addedToCart : 80,
        ordered: props.options ? props.options.ordered : 60,
        averageQty: props.options ? props.options.averageQty : 5,
        revenue: props.options ? props.options.revenue : 25000 
    });

    const self = {        
        setSummary: (options) => setState(options)
    };

    useImperativeHandle(ref, () => self);

    return (
        <table className="sponsored-summary-widget">
            <tbody>
                <tr>
                    <td><span>{state.impression}</span><span>Impression</span></td>
                    <td><span>{state.addedToCart}</span><span>Added to cart</span></td>
                    <td><span>{state.ordered}</span><span>Ordered</span></td>
                </tr>
                <tr>
                    <td><span>{state.averageQty}</span><span>Average Quantity</span></td>
                    <td colSpan={2}><span>{state.revenue}</span><span>Revenue</span></td>                    
                </tr>
            </tbody>
        </table>
    );

}

export default forwardRef(SponsoredSummary);