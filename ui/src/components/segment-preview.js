import React, {useState, forwardRef, useImperativeHandle} from "react";

const SegmentPreview = (props, ref) => {    

    const [segmentType, setSegmentType] = useState(1);
    const [segmentTitle, setSegmentTitle] = useState("");
    const [segmentDescription, setSegmentDescription] = useState("");

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [salesType, setSalesType] = useState(1);
    const [retailerStatus, setRetailerStatus] = useState("All");
    const [orderStatus, setOrderStatus] = useState([]);
    const [geographyType, setGeographyType] = useState("State");
    const [geographyTarget, setGeographyTarget] = useState("");
    const [distributorStatus, setDistributorStatus] = useState("All");
    const [companies, setCompanies] = useState("None");
    const [excludeDistributors, setDistributorExclude] = useState([]);

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
        setDistributorStatus: (_status) => setDistributorStatus(_status),
        setCompanies: (_companies) => setCompanies(_companies),
        setDistributorExclude: (_distributors) => setDistributorExclude(_distributors),
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

    const renderOrderStatus = () => {

        let statusLabel = "";
        for (let i = 0; i < orderStatus.length; i++) {
            if (orderStatus[i] == 1) {
                statusLabel += "Placed ";
            } else if (orderStatus[i] == 2) {
                statusLabel += "Processed ";
            } else if (orderStatus[i] == 3) {
                statusLabel += "Uploaded ";
            }
        }

        return statusLabel;
        
    };

    const renderDynamicSegmentPreview = () => {

        return (
            <>
                <div className="pharmarack-cms-segment-preview-section">
                    <label>Title</label>
                    <p>{segmentTitle}</p>
                    <br/>
                    <label>Description</label>
                    <p>{segmentDescription}</p>
                </div>
                <div className="pharmarack-cms-segment-preview-section">
                    <label>Time Interval</label>
                    <p>{fromDate} <span>to</span> {toDate}</p>
                </div>
                <div className="pharmarack-cms-segment-preview-section">                    
                    <table>
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
                    <table>
                        <tbody>
                            <tr>
                                <td>
                                    <label>Sales</label>
                                    <p>{salesType == 1 ? "Product" : "Band"}</p>
                                </td>
                                <td>
                                    <label>Order Status</label>
                                    <p>{orderStatus}</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>                    
                </div>
                <div className="pharmarack-cms-segment-preview-section">
                    <label>Retailers</label>
                    <p>Status : {retailerStatus}</p>
                </div>
                <div className="pharmarack-cms-segment-preview-section">
                    <table>
                        <tbody>
                            <tr>
                                <td>
                                    <label>Distributors</label>
                                    <p>Status : {distributorStatus}</p>
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
                    <p>{excludeDistributors}</p>
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