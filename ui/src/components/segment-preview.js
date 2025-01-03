import React, {useState, forwardRef, useImperativeHandle} from "react";

const SegmentPreview = (props, ref) => {    

    const [segmentType, setSegmentType] = useState(1);
    const [segmentTitle, setSegmentTitle] = useState("");
    const [segmentDescription, setSegmentDescription] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");    
    const [retailerStatus, setRetailerStatus] = useState("All");
    const [orderStatus, setOrderStatus] = useState([]);
    const [geographyType, setGeographyType] = useState("State");
    const [geographyTarget, setGeographyTarget] = useState("");
    const [storeStatus, setStoreStatus] = useState("All");
    const [companies, setCompanies] = useState("None"); 
    const [excludedStores, setExcludedStores] = useState([]);
    const [segmentRules, setSegmentRules] = useState([]);

    const self = {

        setSegmentType: (_type) => setSegmentType(_type),
        setSegmentTitle: (_title) => setSegmentTitle(_title),
        setSegmentDescription: (_description) => setSegmentDescription(_description),
        setFromDate: (_date) => setFromDate(_date),
        setToDate: (_date) => setToDate(_date),
        setSalesType: (_type) => setSalesType(_type),
        setRetailerStatus: (_status) => setRetailerStatus(_status),
        setOrderStatus: (_status) => setOrderStatus(_status),
        setGeographyType: (_type) => setGeographyType(_type),
        setGeographyTarget: (_target) => setGeographyTarget(_target),
        setStoreStatus: (_status) => setStoreStatus(_status),
        setCompanies: (_companies) => setCompanies(_companies),
        setExcludedStores: (_distributors) => setExcludedStores(_distributors),
        setSegmentRules: (_rules) => setSegmentRules(_rules)
    };
    /* Expose the component to the consumer */
    useImperativeHandle(ref, () => self);

    const renderStaticSegmentPreview = () => {

        return (
            <div className="pharmarack-cms-segment-preview-section">
                <label>Title</label>
                <p>{segmentTitle}</p>
                <br/>
                <label>Description</label>
                <p>{segmentDescription}</p>
            </div>
        );

    };

    const renderSegmentRule = () => {

        if (Array.isArray(segmentRules) && segmentRules.length > 0) {
            return segmentRules.map((rule, index) => {

                if (!rule.target) {
                    return null;
                }
    
                return (
                    <tr key={`rules_${(index+1)}`}>
                        <td><p>{rule.ruleType == 1 ? "Product" : "Brand"}</p></td>
                        <td><p>{rule.target}</p></td>
                        <td><p>{rule.from} - {rule.to}</p></td>
                    </tr>
                );
    
            });
        } else {
            return (
                <tr><td colSpan={3} style={{textAlign: "center"}}>-- No rules configured --</td></tr>
            );
        }

    };

    const renderDate = (_date) => {
        if (_date) {
            const dateObj = new Date(_date);
            return dateObj.toDateString();
        } else {
            return "Any";
        }        
    };

    const renderDynamicSegmentPreview = () => {

        return (
            <>
                <div className="pharmarack-cms-segment-preview-section">
                    <label>Title</label>
                    <p>{segmentTitle}</p>
                    <br/>
                    <label>Description</label>
                    <p>{segmentDescription ? segmentDescription : "-- No description --"}</p>
                </div>
                <div className="pharmarack-cms-segment-preview-section">
                    <label>Time Interval</label>
                    <p>{renderDate(fromDate)} <span>- to -</span> {renderDate(toDate)}</p>
                </div>
                <div className="pharmarack-cms-segment-preview-section">                    
                    <table className="preview-table">
                        <tbody>
                            <tr>
                                <td>
                                    <label>Geography</label>
                                    <p>{geographyType}</p>
                                </td>
                                <td>
                                    <label>Selected</label>
                                    <p>{geographyTarget}</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>                
                <div className="pharmarack-cms-segment-preview-section">
                    <label>Order Status</label>
                    <p>{orderStatus ? (orderStatus.length > 0 ? orderStatus : "All") : "All"}</p>
                </div>
                <div className="pharmarack-cms-segment-preview-section">
                    <label>Retailers</label>
                    <p>Status : {retailerStatus}</p>
                </div>
                <div className="pharmarack-cms-segment-preview-section">
                    <table className="preview-table">
                        <tbody>
                            <tr>
                                <td>
                                    <label>Distributors</label>
                                    <p>Status : {storeStatus}</p>
                                </td>
                                <td>
                                    <label>Companies</label>
                                    <p>{companies}</p>                                    
                                </td>
                            </tr>
                        </tbody>
                    </table>                    
                </div>
                <div className="pharmarack-cms-segment-preview-section">
                    <label>Exclude Distributors</label>
                    <p>{excludedStores ? (excludedStores.length ? excludedStores : "None") : "None"}</p>
                </div>
                <div className="pharmarack-cms-segment-preview-section">
                    <table className="pharmarack-cms-segment-preview-rule-table">
                        <tbody>
                            <tr key="rules_0">
                                <td>
                                    <label>Rule Type</label>                                    
                                </td>
                                <td>
                                    <label>Target</label>                                    
                                </td>
                                <td>
                                    <label>Quantity</label>                                    
                                </td>
                            </tr>
                            {renderSegmentRule()}
                        </tbody>
                    </table>                    
                </div>
            </>
        )

    };

    return (
        <div className="pharmarack-cms-segment-preview">
            {segmentType == 1 ? renderDynamicSegmentPreview() : renderStaticSegmentPreview()}
        </div>
    );

};

export default forwardRef(SegmentPreview);