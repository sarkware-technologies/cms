import React, {forwardRef, useImperativeHandle, useState, useEffect} from "react";
import { v4 as uuidv4 } from 'uuid';
import Helper from "../../../utils/helper";
import RuleGroups from "../../rule-groups";

const TopDistributors = (props, ref) => {

    let config = {};        
    let topDistributorsConfigFields = {};

    const groupsRef =  React.createRef();
    const leftColRef = React.createRef();

    const [record, setRecord] = useState(props.record);

    const topDistributorsNameSpace = "top_products_";

    if (props.config && (typeof props.config !== 'object')) {
        try {
            config = JSON.parse(props.config);
        } catch(_e) {
            console.error(_e);
        }        
    }

    const renderTopDistributorsConfigFields = () => {

        const result = Helper.renderConfigFields(topDistributorsNameSpace, config, record.configuration);       
        topDistributorsConfigFields = result.refs;
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

        if (leftColRef.current) {

            if (leftColRef.current.style.width === '0px') {
                leftColRef.current.style.width = "50%";
                leftColRef.current.className = "component-editor-left-container";
            } else {
                leftColRef.current.style.width = '0px';
                leftColRef.current.className = "component-editor-left-container collapsed";
            }
            
        }

    };

    const self = {     

        getComponentConfiguration: () => {
            return Helper.getConfigFieldValues(topDistributorsNameSpace, config, topDistributorsConfigFields);                        
        },
        getComponentRules: () => groupsRef.current.getGroupRules(),
        updateComponentRules: () => updateRules()

    };
    /* Expose the component to the consumer */
    useImperativeHandle(ref, () => self);

    return (
        <div className="pharmarack-cms-component-editor-container">

            <div key={uuidv4()} ref={leftColRef} className="component-editor-left-container">

                <div className="pharmarack-cms-view-column-title">
                    <h3>Configuration</h3>
                    <p>Top Distributors (Used for FLUTTER)</p>
                </div>

                <div className="component-config-form">{renderTopDistributorsConfigFields()}</div>

                <a href="#" className="pharmarack-cms-col-collapse-btn" onClick={handleCollapseBtnClick}><i className="fa fa-compress"></i></a>

            </div>

            <div key={uuidv4()} className="component-editor-right-container">

                <div className="pharmarack-cms-view-column-title">
                    <h3>Top Distributors Rules</h3>
                    <p>Mapping rules for the top distributors component</p>
                </div>

                <div className="component-editor-items-container">
                    <div className="component-item-rules">{<RuleGroups ref={groupsRef} id={record._id} />}</div>
                </div>

            </div>

        </div>
    );

};

export default forwardRef(TopDistributors);