import React, {forwardRef, useImperativeHandle, useState, useEffect} from "react";
import { v4 as uuidv4 } from 'uuid';
import Helper from "../../../utils/helper";
import RuleGroups from "../../rule-groups";

const TopProducts = (props, ref) => {

    let config = {};        
    let topProductConfigFields = {};

    const groupsRef =  React.createRef();
    const leftColRef = React.createRef();

    const [record, setRecord] = useState(props.record);

    const topProductsNameSpace = "top_products_";

    if (props.config && (typeof props.config !== 'object')) {
        try {
            config = JSON.parse(props.config);
        } catch(_e) {
            console.error(_e);
        }        
    }

    const renderTopProductsConfigFields = () => {

        const result = Helper.renderConfigFields(topProductsNameSpace, config, record.configuration);       
        topProductConfigFields = result.refs;
        return result.fields;

    };    

    const updateRules = () => {       

        const request = {};
        request["method"] = "PUT";
        request["endpoint"] = "/system/v1/api/component/rule/bulk_update?id="+ record._id;
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
            return Helper.getConfigFieldValues(topProductsNameSpace, config, topProductConfigFields);                        
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
                    <p>Top Products (Used for FLUTTER)</p>
                </div>

                <div className="component-config-form">{renderTopProductsConfigFields()}</div>

                <a href="#" className="pharmarack-cms-col-collapse-btn" onClick={handleCollapseBtnClick}><i className="fa fa-compress"></i></a>

            </div>

            <div key={uuidv4()} className="component-editor-right-container">

                <div className="pharmarack-cms-view-column-title">
                    <h3>Top Products Rules</h3>
                    <p>Mapping rules for the top products component</p>
                </div>

                <div className="component-editor-items-container">
                    <div className="component-item-rules">{<RuleGroups ref={groupsRef} id={record._id} />}</div>
                </div>

            </div>

        </div>
    );

};

export default forwardRef(TopProducts);