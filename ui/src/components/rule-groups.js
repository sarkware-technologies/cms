import React, {forwardRef, useImperativeHandle, useState, useEffect} from "react";
import Rule from "./rule";
import { v4 as uuidv4 } from 'uuid';

const RuleGroups = (props, ref) => {

    let groupRules = {};

    const [groups, setGroups] = useState({});    

    const self = {

        getGroupRules: () => {
        
            let ruleKeys = [];
            const records = {};
            const gKeys = Object.keys(groupRules);

            for (let i = 0; i < gKeys.length; i++) {

                ruleKeys = Object.keys(groupRules[gKeys[i]]);

                for (let j = 0; j < ruleKeys.length; j++) {
                    records[ ruleKeys[j] ] = groupRules[gKeys[i]][ruleKeys[j]].getRule();
                }

            } 
            
            return records;
        
        }

    };

    /* Expose the component to the consumer */
    useImperativeHandle(ref, () => self);

    const persistRules = (_type, _groupKey) => {       

        const request = {};
        request["method"] = "PUT";
        request["endpoint"] = "/system/v1/api/component/rules_group/persist_group_rules?id="+ props.id;
        request["payload"] = self.getGroupRules();  

        window._controller.docker.dock(request).then((_res) => {
            groupRules={};  
            if (_type == "group") {
                addGroup(_res)
            } else {
                addRule(_res, _groupKey);
            }    
        })
        .catch((e) => {
            window._controller.notify(e.message, "error");
        });
       
    };

    const addRule = (_groups, _groupKey) => {

        const _rule = {
            type: 1,
            condition: 1,
            segments: "none",
            distributors: "none",
            companies: "none",
            retailer_lookup: 2,
            match: {
                countries: "none",
                states: "none",
                regions: "none",
                retailers: "none"
            },
            component: props.id
        };

        const request = {};
        request["method"] = "POST";
        request["endpoint"] = "/system/v1/api/component/rules_group/create_rule?gid="+ _groupKey;
        request["payload"] = _rule; 
        
        window._controller.docker.dock(request).then((_res) => {
            _groups[_groupKey].push({..._res});        
            setGroups({..._groups});
            window._controller.notify( "Rules created successfully"); 
        })
        .catch((e) => {
            window._controller.notify("Failed to create rule", "error");  
        }); 

    };

    const addGroup = (_groups) => { 

        /* Update the group table  */
        const request = {};
        request["method"] = "POST";
        request["endpoint"] = "/system/v1/api/component/rules_group/create"
        request["payload"] = {
            component: props.id,
            rules: []
        };                                

        window._controller.docker.dock(request).then((_res) => {
            _groups[_res._id] = [];                
            setGroups({..._groups});                 
            window._controller.notify( "Group added successfully"); 
        })
        .catch((e) => {
            window._controller.notify("Failed to add group", "error");  
        });

    };

    const removeRule = (_groupKey, _ruleIndex, _ruleId) => {

        groups[_groupKey].splice(_ruleIndex, 1);

        const request = {};
        request["method"] = "GET";
        request["endpoint"] = "/system/v1/api/component/rules_group/remove_rule?gid="+ _groupKey +"&rid="+ _ruleId;       

        window._controller.docker.dock(request).then((_res) => {
            /* Check if group is empty - then remove it */ 
            if (groups[_groupKey].length == 0) {
                delete groups[_groupKey];
            }
            setGroups({...groups});       
            window._controller.notify( "Group removed successfully");
        })
        .catch((e) => {
            window._controller.notify("Failed to remove group", "error"); 
        });
        
    };

    const registerRuleInstance = (_groupKey, _ruleId, _ref) => {

        if (groupRules[_groupKey]) {
            groupRules[_groupKey][_ruleId] = (_ref);
        } else {
            console.error("registerRuleInstance failed");
        }

    };

    const renderRules = (_groupKey) => {

        if (!groupRules[_groupKey]) {
            groupRules[_groupKey] = {};
        }

        let ruleRef = null;
        let _record = null;
        const items = [];

        for (let i = 0; i < groups[_groupKey].length; i++) {

            if (groups[_groupKey][i]) {
                if (i > 0) {
                    items.push(<label key={uuidv4()}>[AND]</label>);
                }
               
                _record = {
                    countries: groups[_groupKey][i].match.countries,
                    states: groups[_groupKey][i].match.states,
                    regions: groups[_groupKey][i].match.regions,
                    retailers: groups[_groupKey][i].match.retailers,
                    segments: groups[_groupKey][i].segments,
                    distributors: groups[_groupKey][i].distributors,
                    companies: groups[_groupKey][i].companies,
                    retailer_lookup: groups[_groupKey][i].retailer_lookup,
                    condition: groups[_groupKey][i].condition,
                    type: groups[_groupKey][i].type
                };
    
                ruleRef = React.createRef();            
                items.push(<Rule ref={ruleRef} key={uuidv4()} id={groups[_groupKey][i]._id} groupKey={_groupKey} ruleIndex={i} record={_record} registerInstance={(_groupKey, _ruleId, _ref) => registerRuleInstance(_groupKey, _ruleId, _ref)} removeRule={(_groupKey, _rIndex, _ruleId) => removeRule(_groupKey, _rIndex, _ruleId)} />);   
            }

        }        

        return items;

    };

    const renderRuleContainer = (_groupKey) => {        

        return (
            <div key={uuidv4()} className="pharmarack-cms-rules-container">
                {renderRules(_groupKey)}                
            </div>
        );

    };

    /**
     * 
     * @param {*} _groupKey 
     * @returns 
     * 
     * Render single group
     * 
     */
    const renderGroup = (_groupKey) => {

        return (
            <div key={uuidv4()} className="pharmarack-cms-rule-group">
                {renderRuleContainer(_groupKey)}
                <button className="pharmarack-cms-btn primary icon-left" onClick={() => persistRules("rule", _groupKey)}><i className="fa fa-arrows-h"></i> Rule</button>
            </div>
        );

    };

    /**
     * 
     * @returns 
     * 
     * Iterate through rule groups and render
     * 
     */
    const renderGroups = () => {

        const items = [];
        const groupKeys = Object.keys(groups);

        for (let i = 0; i < groupKeys.length; i++) {
            if (i > 0) {
                items.push(<label key={uuidv4()}>[OR]</label>);
            }
            items.push(renderGroup(groupKeys[i]));
        }

        return items;

    };

    useEffect(() => {        
        renderGroups();
    }, [groups]);

    useEffect(() => {  
        
        window._controller.docker.dock({
            method: "GET",
            endpoint: "/system/v1/api/component/component/fetch_rule_groups?id="+ props.id
        }).then((_res) => {
            setGroups(_res);
        })
        .catch((e) => {
            console.error(e);
        });

    }, []);

    return (
        <div className="pharmarack-cms-rule-group-container">

            {renderGroups()}

            <button className="pharmarack-cms-btn primary icon-left" onClick={() => persistRules("group", null)}><i className="fa fa-layer-plus"></i> Group</button>

        </div>
    );

};

export default forwardRef(RuleGroups);