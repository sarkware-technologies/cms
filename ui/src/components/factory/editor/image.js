import React, {forwardRef, useImperativeHandle, useState} from "react";
import { v4 as uuidv4 } from 'uuid';
import Helper from "../../../utils/helper";
import RuleGroups from "../../rule-groups";

const Image = (props, ref) => {

    let config = {};        
    let imageConfigFields = {};

    const groupsRef =  React.createRef();
    const leftColRef = React.createRef();

    const [record, setRecord] = useState(props.record);
    const [collaps, setCollapse] = useState(false);

    const imageNameSpace = "image_";

    if (props.config && (typeof props.config !== 'object')) {
        try {
            config = JSON.parse(props.config);
        } catch(_e) {
            console.error(_e);
        }         
    }

    const renderImageConfigFields = () => {

        const result = Helper.renderConfigFields(imageNameSpace, config, record.configuration);       
        imageConfigFields = result.refs;
        return result.fields;

    };    

    const updateRules = () => {       

        const request = {};
        request["method"] = "PUT";
        request["endpoint"] = "/system/api/component/rule/bulk_update?id="+ record._id;
        request["payload"] = groupsRef.current.getGroupRules();  
                      
        window._controller.dock(request, 
            (_req, _res) => {     
               /* Ignore it */
            }, 
            (_req, _res) => {
                window._controller.notify(_res, "error");
            }
        );

    };

    const handleCollapseBtnClick = () => {
        setCollapse(prevState => !prevState);
    };

    const self = {     

        getComponentConfiguration: () => {
            return Helper.getConfigFieldValues(imageNameSpace, config, imageConfigFields);                        
        },
        getComponentRules: () => groupsRef.current.getGroupRules(),
        updateComponentRules: () => updateRules(),
        getConfigFields: () => imageConfigFields

    };
    /* Expose the component to the consumer */
    useImperativeHandle(ref, () => self);

    let cssProps = {
        width: "50%"        
    };

    if (collaps) {
        cssProps.width = "0%"        
    } 

    return (
        <div className="pharmarack-cms-component-editor-container">

            <div key={uuidv4()} ref={leftColRef} className={`component-editor-left-container ${ collaps ? "collapsed" : "" }`} style={cssProps}>

                <div className="pharmarack-cms-view-column-title">
                    <h3>Configuration</h3>
                    <p>Image (Used for FLUTTER)</p>
                </div>

                <div className="component-config-form">{renderImageConfigFields()}</div>

                <a href="#" className="pharmarack-cms-col-collapse-btn" onClick={handleCollapseBtnClick}><i className="fa fa-compress"></i></a>

            </div>

            <div key={uuidv4()} className="component-editor-right-container">

                <div className="pharmarack-cms-view-column-title">
                    <h3>Image Rules</h3>
                    <p>Mapping rules for the image component</p>
                </div>

                <div className="component-editor-items-container">
                    <div className="component-item-rules">{<RuleGroups ref={groupsRef} id={record._id} />}</div>
                </div>

            </div>

        </div>
    );

};

export default forwardRef(Image);