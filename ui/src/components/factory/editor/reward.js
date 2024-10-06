import React, {forwardRef, useImperativeHandle, useState} from "react";
import { v4 as uuidv4 } from 'uuid';
import Helper from "../../../utils/helper";
import RuleGroups from "../../rule-groups";

const Reward = (props, ref) => {

    let config = {};        
    let rewardConfigFields = {};

    const groupsRef =  React.createRef();
    const leftColRef = React.createRef();

    const [record, setRecord] = useState(props.record);
    const [collaps, setCollapse] = useState(false);

    const rewardNameSpace = "feedback_";

    if (props.config && (typeof props.config !== 'object')) {
        try {
            config = JSON.parse(props.config);
        } catch(_e) {
            console.error(_e);
        }        
    }

    const renderRewardConfigFields = () => {

        const result = Helper.renderConfigFields(rewardNameSpace, config, record.configuration);       
        rewardConfigFields = result.refs;
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
            return Helper.getConfigFieldValues(rewardNameSpace, config, rewardConfigFields);                        
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
                    <p>Reward (Used for FLUTTER)</p>
                </div>

                <div className="component-config-form">{renderRewardConfigFields()}</div>

                <a href="#" className="pharmarack-cms-col-collapse-btn" onClick={handleCollapseBtnClick}><i className="fa fa-compress"></i></a>

            </div>

            <div key={uuidv4()} className="component-editor-right-container">

                <div className="pharmarack-cms-view-column-title">
                    <h3>Reward Rules</h3>
                    <p>Mapping rules for the reward component</p>
                </div>

                <div className="component-editor-items-container">
                    <div className="component-item-rules">{<RuleGroups ref={groupsRef} id={record._id} />}</div>
                </div>

            </div>

        </div>
    );

};

export default forwardRef(Reward);