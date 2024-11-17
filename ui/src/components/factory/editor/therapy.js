import React, {forwardRef, useImperativeHandle, useState} from "react";
import { v4 as uuidv4 } from 'uuid';
import Helper from "../../../utils/helper";
import RuleGroups from "../../rule-groups";

const Therapy = (props, ref) => {

    let config = {};        
    let therapyConfigFields = {};

    const groupsRef =  React.createRef();
    const leftColRef = React.createRef();

    const [record, setRecord] = useState(props.record);
    const [collaps, setCollapse] = useState(false);

    const therapyNameSpace = "therapy_";

    if (props.config && (typeof props.config !== 'object')) {
        try {
            config = JSON.parse(props.config);
        } catch(_e) {
            console.error(_e);
        }        
    }

    const renderTherapyConfigFields = () => {

        const result = Helper.renderConfigFields(therapyNameSpace, config, record.configuration);       
        therapyConfigFields = result.refs;
        return result.fields;

    };    

    const updateRules = () => {       

        const request = {};
        request["method"] = "PUT";
        request["endpoint"] = "/system/v1/api/component/rule/bulk_update?id="+ record._id;
        request["payload"] = groupsRef.current.getGroupRules();  
          
        window._controller.docker.dock(request).then((_res) => {            
            /* Nothing to do, just ignore */   
        })
        .catch((e) => {
            window._controller.notify(e.message, "error");
        });

    };

    const handleCollapseBtnClick = () => {
        setCollapse(prevState => !prevState);
    };

    const self = {     

        getComponentConfiguration: () => {
            return Helper.getConfigFieldValues(therapyNameSpace, config, therapyConfigFields);                        
        },
        getComponentRules: () => groupsRef.current.getGroupRules(),
        updateComponentRules: () => updateRules()

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
                    <p>Therapy (Used for FLUTTER)</p>
                </div>

                <div className="component-config-form">{renderTherapyConfigFields()}</div>

                <a href="#" className="pharmarack-cms-col-collapse-btn" onClick={handleCollapseBtnClick}><i className="fa fa-compress"></i></a>

            </div>

            <div key={uuidv4()} className="component-editor-right-container">

                <div className="pharmarack-cms-view-column-title">
                    <h3>Therapy Rules</h3>
                    <p>Mapping rules for the therapy component</p>
                </div>

                <div className="component-editor-items-container">
                    <div className="component-item-rules">{<RuleGroups ref={groupsRef} id={record._id} />}</div>
                </div>

            </div>

        </div>
    );

};

export default forwardRef(Therapy);