import React, {forwardRef, useImperativeHandle, useState, useEffect} from "react";
import { v4 as uuidv4 } from 'uuid';
import Helper from "../../../utils/helper";
import RuleGroups from "../../rule-groups";

const TopWidget = (props, ref) => {

    let config = {};        
    let configFields = {};

    const groupsRef =  React.createRef();
    const leftColRef = React.createRef();

    const [record, setRecord] = useState(props.record);
    const [collaps, setCollapse] = useState(false);
    const [widgetType, setWidgetType] = useState(("configuration" in props.record) ? props.record.configuration.type : "products");

    const namespace = "top_widget_";

    if (props.config && (typeof props.config !== 'object')) {
        try {
            config = JSON.parse(props.config);
        } catch(_e) {
            console.error(_e);
        }        
    }

    const renderConfigFields = () => {

        const _config = JSON.parse(JSON.stringify(config));

        if (widgetType == "brands") {
            delete _config["context"];
            delete _config["show_add_distributors_btn"];
        } else if (widgetType == "distributors") {
            _config["context"] = {
                "type": "select",
                "label": "Context",
                "handle": "context",
                "value": "random",
                "placeholder": "-- select context --",
                "value_key": "value",
                "label_key": "label",
                "options": [{"label": "Priority", "value": "priority"},{"label": "Random", "value": "random"}],
                "classes": "",
                "mandatory": true,
                "disabled": false,
                "tabindex": 1,
                "align": "right",
                "label_width": 0,
                "label_position": "top",
                "prompt_message": "",
                "validation_message": "",
                "source": "local",
                "datasource": ""
            };            
        } else {
            delete _config["show_add_distributors_btn"];
        }

        /* Update the type value */
        _config["type"]["value"] = widgetType;
        if (record.configuration) {
            record.configuration["type"] = widgetType;
        }
        
        const result = Helper.renderConfigFields(namespace, _config, record.configuration);       
        configFields = result.refs;
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
            return Helper.getConfigFieldValues(namespace, config, configFields);                        
        },
        getComponentRules: () => groupsRef.current.getGroupRules(),
        updateComponentRules: () => updateRules(),
        updateTopWidgetType: (_type) => setWidgetType(_type)

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
                    <p>Top Widget (Used for FLUTTER)</p>
                </div>

                <div className="component-config-form">{renderConfigFields()}</div>

                <a href="#" className="pharmarack-cms-col-collapse-btn" onClick={handleCollapseBtnClick}><i className="fa fa-compress"></i></a>

            </div>

            <div key={uuidv4()} className="component-editor-right-container">

                <div className="pharmarack-cms-view-column-title">
                    <h3>Top Widget Rules</h3>
                    <p>Mapping rules for the top widget component</p>
                </div>

                <div className="component-editor-items-container">
                    <div className="component-item-rules">{<RuleGroups ref={groupsRef} id={record._id} />}</div>
                </div>

            </div>

        </div>
    );

};

export default forwardRef(TopWidget);