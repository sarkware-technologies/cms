import React, {useState, forwardRef, useImperativeHandle} from "react";

const SegmentPreview = (props, ref) => {    

    const [segmentType, setSegmentType] = useState(1);
    const [segmentTitle, setSegmentTitle] = useState("");
    const [segmentDescription, setSegmentDescription] = useState("");

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [salesType, setSalesType] = useState(1);
    const [retailerStatus, setRetailerStatus] = useState(1);
    const [orderStatus, setOrderStatus] = useState([]);

    const self = {

        setSegmentType: (_type) => setSegmentType(_type),
        setSegmentTitle: (_title) => setSegmentTitle(_title),
        setSegmentDescription: (_description) => setSegmentDescription(_description)

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
                    <p>{fromDate} to {toDate}</p>
                </div>
                <div className="pharmarack-cms-segment-preview-section">
                    <label>Geography</label>
                    <p>{fromDate} to {toDate}</p>
                </div>
                <div className="pharmarack-cms-segment-preview-section">
                    <table>
                        <tr>
                            <td>
                                <label>Sales</label>
                                <p>{retailerStatus == 1 ? "All" : "Authorized"}</p>
                            </td>
                            <td>
                                <label>Order Status</label>
                                <p>{renderOrderStatus()}</p>
                            </td>
                        </tr>
                    </table>                    
                </div>
                <div className="pharmarack-cms-segment-preview-section">
                    <label>Retailers</label>
                    <p>{retailerStatus == 1 ? "All" : "Authorized"}</p>
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