import React, {forwardRef, useImperativeHandle, useEffect, useState} from "react";

const SponsoredSummary = (props, ref) => {

    const [state, setState] = useState({
        impression: props.options ? props.options.impression : 0,
        addedToCart: props.options ? props.options.addedToCart : 0,
        ordered: props.options ? props.options.ordered : 0,
        averageQty: props.options ? props.options.averageQty : 0,
        revenue: props.options ? props.options.revenue : 0 
    });

    const getSponsoredSummary = () => {

        const request = {
          method: "GET",
          endpoint: `/system/v1/sponsored_product/${props.sponsoredId}/summary`,
        };
  
        window._controller.docker
        .dock(request)
        .then((_res) => {  
              
            setState({
                impression: _res.impression,
                addedToCart: _res.addedToCart,
                ordered: _res.ordered,
                averageQty: _res.averageQty,
                revenue: _res.revenue
            });  
          
        })
        .catch((e) => {
            console.log(e);
        });
  
    };

    useEffect(() => {        
        getSponsoredSummary();
    }, []);

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