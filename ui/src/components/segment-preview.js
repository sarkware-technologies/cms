import React, {useState, forwardRef, useImperativeHandle} from "react";

const SegmentPreview = (props, ref) => {    

    const [segmentType, setSegmentType] = useState(1);
    const [segmentTitle, setSegmentTitle] = useState("");
    const [segmentDescription, setSegmentDescription] = useState("");

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
        )

    };

    const renderDynamicSegmentPreview = () => {

    };

    return (
        <div className="pharmarack-cms-segment-preview">
            {segmentType == 1 ? renderDynamicSegmentPreview() : renderStaticSegmentPreview()}
        </div>
    );

};

export default forwardRef(SegmentPreview);