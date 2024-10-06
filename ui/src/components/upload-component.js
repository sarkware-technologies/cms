import React, {useState, forwardRef, useImperativeHandle} from "react";

const UploadComponent = (props, ref) => {

    const [record, setRecord] = useState( (('record' in props) ? props.record : {}) );  

    const ErrorRecord = (_props) => {
        return <tr><td>{_props.row}</td><td>{_props.message}</td></tr>
    };
    
    const renderErrorRecords = () => {
        const keys = Object.keys(record.error_summary);
        if (keys.length > 0) {
            return keys.map((_key, index) => <ErrorRecord key={index} row={_key} message={record.error_summary[_key]} />);
        } else {
            return <tr><td colSpan={2}><h2>No error message</h2></td></tr>
        }
    };

    const borderNone = {
        marginBottom: "0px",
        borderBottomColor: "transparent"
    }

    return (
        <div className="pharmarack-cms-component-upload-summary">
            
            <div>
                <div className="pharmarack-cms-view-column-title" style={borderNone}>
                    <h3>Summary</h3>
                    <p>Over all summary about this upload</p>
                </div>
                <div className="upload-summary-left">

                    <div className="upload-summary-row">
                        <label>File</label>
                        <label><a className="pharmarack-cms-btn primary icon-left" href={record.url} ><i className="fa fa-download"></i> Download</a></label>
                    </div>
                    <div className="upload-summary-row">
                        <label>Imported Date</label>
                        <label>{record.upload_date}</label>
                    </div>
                    <div className="upload-summary-row">
                        <label>Total Component</label>
                        <label>{record.total}</label>
                    </div>
                    <div className="upload-summary-row">
                        <label>Succeed</label>
                        <label>{record.succeed}</label>
                    </div>
                    <div className="upload-summary-row">
                        <label>Updated</label>
                        <label>{record.updated}</label>
                    </div>

                    <div className="upload-summary-row">
                        <label>Failed</label>
                        <label>{record.failed}</label>
                    </div>

                    <div className="upload-summary-row">
                        <label>Re Uploaded</label>
                        <label>{record.re_uploaded}</label>
                    </div>

                    <div className="upload-summary-row">
                        <label>Status</label>
                        <label>{record.note}</label>
                    </div>
                </div>

            </div>

            <div>
                <div className="pharmarack-cms-view-column-title" style={borderNone}>
                    <h3>Error</h3>
                    <p>Error summary for the components which failed to import</p>
                </div>
                <div className="upload-summary-right">

                    <div className="upload-summary-error-summary">
                        <table>
                            <thead>
                                <tr>
                                    <th>Row Number</th>
                                    <th>Error Message</th>
                                </tr>
                            </thead>
                            <tbody>{renderErrorRecords()}</tbody>
                        </table>
                    </div>

                </div>

            </div>

        </div>
    );

};

export default forwardRef(UploadComponent);