import React, {forwardRef, useImperativeHandle, useState, useEffect} from "react";
import { v4 as uuidv4 } from 'uuid';
import Helper from "../../../utils/helper";
import Media from "../../media";
import Input from "../../form/input";
import RuleGroups from "../../rule-groups";

const TopCategories = (props, ref) => {

    let config = {};    
    /* parent configuration */
    let topCatConfigFields = {};
    /* for crm bar item configuration */
    let topCatItemConfigFields = {};
    /* For new crm bar item creation */
    let topCatItemFormFields = {};     
    /* For sortable */  
    let selected = null;

    let groupsRef = null;
    let assetMediaRef = null;    

    let topCatItemTitleRef = null;
    let topCatItemEndDateRef = null;
    let topCatItemStartDateRef = null;

    const leftColRef = React.createRef();
    
    const [record, setRecord] = useState(props.record);
    const [childrens, setChildrens] = useState([]);
    const [mode, setMode] = useState("list");
    const [topCatItemMeta, setTopCatItemMeta] = useState({});
    const [topCatItemConfig, setTopCatItemConfig] = useState({});
    const [currentItem, setCurrentItem] = useState(null);
    

    const topCatNameSpace = "top_cat_";
    const topCatItemNameSpace = "top_cat_item_";

    if (props.config && (typeof props.config !== 'object')) {
        try {
            config = JSON.parse(props.config);
        } catch(_e) {
            console.error(_e);
        }        
    }

    const renderTopCatConfigFields = () => {

        const result = Helper.renderConfigFields(topCatNameSpace, config, record.configuration);       
        topCatConfigFields = result.refs;
        return result.fields;

    };

    const renderTopCatItemForm = () => {

        const contextObj = window._controller.getCurrentModuleInstance();
        if (contextObj) {
            const result = Helper.renderConfigFields(topCatItemNameSpace, contextObj.componentFormConfig, {});       
            topCatItemFormFields = result.refs;
            return result.fields;                   
        }
        
        return null;

    };

    const handleTopCatItemToggleChange = (_e, _item) => {

        /* Update the crm bar item status */
        const request = {};        
        request["method"] = "PUT";
        request["endpoint"] = "/system/v1/api/component/component/update?id="+ _item._id
        request["payload"] = {};                        
        request["payload"]["status"] = _e.target.checked;

        window._controller.dock(request, 
            (_req, _res) => {    
                
                /* Update the childrens array too */
                for (let i = 0; i < childrens.length; i++) {
                    if (childrens[i]._id === _res._id) {
                        childrens.splice(i, 1, _res);
                    }
                }
                setChildrens([...childrens]);
                window._controller.notify( _item.title + (_e.target.checked ? " disabled successfully" : " enabled successfully"));                                
            }, 
            (_req, _res) => {
                window._controller.notify(_item.title + " failed to update.!", "error");                                
            }
        );

    };

    const handleTopCatItemClick = (_e, _item) => {

        /* Fetch the crm bar items */               

        for (let i = 0; i < childrens.length; i++) {
            if (_item._id === childrens[i]._id) {
                setCurrentItem(childrens[i]);
                setMode("edit");
                return;
            }
        }

    };

    const handleMediaChange = async (_file, _handle) => {

        /* Handle the file change event */

        const file = _file.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('property', _handle);
        formData.append('componentId', currentItem._id);

        try {
            const response = await window._controller.upload(formData);
            if (response) {

                /* Update the childrens array too */
                for (let i = 0; i < childrens.length; i++) {
                    if (childrens[i]._id === response._id) {
                        childrens.splice(i, 1, response);
                    }
                }

                setCurrentItem(response);
            }
        } catch (_e) {
            console.error(_e);
        }

    };

    const handleMediaDelete = async (_handle) => {

        const request = {};
        request["method"] = "POST";
        request["endpoint"] = "/system/v1/api/component/component/remove_asset";
        request["payload"] = {
            componentId: currentItem._id,
            property: _handle
        };                    
        
        window._controller.dock(request, 
            (_req, _res) => {     
                
                /* Update the childrens array too */
                for (let i = 0; i < childrens.length; i++) {
                    if (childrens[i]._id === _res._id) {
                        childrens.splice(i, 1, _res);
                    }
                }

                setCurrentItem(_res);

            }, 
            (_req, _res) => {
                this.controller.notify(_res, "error");
            }
        );
    };

    const renderTopCatItemConfig = (_item) => {

        if (!currentItem || (_item._id !== currentItem._id)) {
            return null;
        }
        
        let _config = {};
        let _type = "image";        

        if (typeof _item.configuration === "string") {
            if (_item.configuration !== "") {
                try {
                    _config = JSON.parse(_item.configuration);
                    _type = _config.type;
                } catch(_e) {
                    console.error(_e);
                } 
            }
        } else {
            _config = _item.configuration ? _item.configuration : {};
        }
        
        groupsRef = React.createRef();        
        assetMediaRef = React.createRef();  
        
        topCatItemTitleRef = React.createRef();
        topCatItemEndDateRef = React.createRef();
        topCatItemStartDateRef = React.createRef(); 

        const _assetMedia = <Media key={uuidv4()} ref={assetMediaRef} config={topCatItemConfig["asset_url"]} type={_type} handleMediaChange={handleMediaChange} handleMediaDelete={handleMediaDelete} url={_config["asset_url"]} />;        
        const assetMedia = Helper.buildWrapper(topCatItemConfig["asset_url"], _assetMedia);        

        const result = Helper.renderConfigFields(topCatItemNameSpace, topCatItemConfig, _config);       
        topCatItemConfigFields = result.refs;

        const contextObj = window._controller.getCurrentModuleInstance();
        if (contextObj) {

            const titleConfig = contextObj.componentFormConfig["title"];
            const endDateConfig = contextObj.componentFormConfig["end_date"];
            const startDateConfig = contextObj.componentFormConfig["start_date"];

            titleConfig["value"] = _item["title"];
            endDateConfig["value"] = _item["end_date"];
            startDateConfig["value"] = _item["start_date"];
            
            const _topCatItemTitle = <Input ref={topCatItemTitleRef} namespace={topCatNameSpace} config={titleConfig} />;
            const _topCatItemEndDate = <Input ref={topCatItemEndDateRef} namespace={topCatNameSpace} config={endDateConfig} />;
            const _topCatItemStartDate = <Input ref={topCatItemStartDateRef} namespace={topCatNameSpace} config={startDateConfig} />;

            const topCatItemTitle = Helper.buildWrapper(titleConfig, _topCatItemTitle);
            const topCatItemEndDate = Helper.buildWrapper(endDateConfig, _topCatItemEndDate);
            const topCatItemStartDate = Helper.buildWrapper(startDateConfig, _topCatItemStartDate);

            result.fields.splice(0, 0, topCatItemEndDate);
            result.fields.splice(0, 0, topCatItemStartDate);
            result.fields.splice(0, 0, topCatItemTitle);

        } 
        
        result.fields.splice(0, 0, assetMedia);        

        return (
            <div key={uuidv4()} className="component-item-config">
                {result.fields}
                <div className="component-item-rules">
                    <label>Mapping Rules</label>
                    {<RuleGroups ref={groupsRef} id={currentItem._id} />}
                </div>
            </div>
        );

    };

    const updateSequence = () => {

        const request = {};
        request["method"] = "POST";
        request["endpoint"] = "/system/v1/api/component/component/update_sequence?id="+ record._id;
        request["payload"] = getTopCatItemSequence();                    
        
        window._controller.dock(request, 
            (_req, _res) => {     
                window._controller.notify("Top category item's sequence updated", "info");
            }, 
            (_req, _res) => {
                window._controller.notify(_res, "error");
            }
        );

    };

    const handleDragEnd = () => { 

        selected = null;
        updateSequence();

    };

    const handleDragOver = (_e) => {

        let targetElement = _e.target;
        if (_e.target.className !== "component-editor-child-item") {
            targetElement = _e.target.closest(".component-editor-child-item");
        }

        if (selected) {
            
            if (!selected.classList.contains('sorted')) {
                selected.classList.add('sorted');
            }

            if (isBefore(selected, targetElement)) {
                selected.className 
                targetElement.parentNode.insertBefore(selected, targetElement);
            } else {
                targetElement.parentNode.insertBefore(selected, targetElement.nextSibling);
            }
        }

    };

    const handleDragStart = (_e) => {

        if (_e.target.closest(".component-item-config")) {
            _e.preventDefault();
            return false;
        }

        _e.dataTransfer.effectAllowed = 'move';
        _e.dataTransfer.setData('text/plain', null);

        if (_e.target.className !== "component-editor-child-item") {            
            selected = _e.target.closest(".component-editor-child-item");
        }  

    };

    function isBefore(el1, el2) {

        let cur

        if (el2.parentNode === el1.parentNode) {
            for (cur = el1.previousSibling; cur; cur = cur.previousSibling) {
                if (cur === el2) return true
            } 
        }

        return false;

    };

    const renderTopCatItem = (_item) => {

        return (
            <div key={uuidv4()} data-id={_item._id} className="component-editor-child-item" draggable="true" onDragStart={(_e) => handleDragStart(_e)} onDragEnd={handleDragEnd} onDragOver={(_e) => handleDragOver(_e)}>

                <div className="component-item-header">
                    <div key={uuidv4()}>
                        <h3><a href="#" className="drag-handle"><i className="fa fa-grip-vertical"></i></a><a href="#" onClick={(_e) => handleTopCatItemClick(_e, _item)} >{_item.title}</a></h3>
                    </div>
                    <div key={uuidv4()}>
                        <div className="toggle-container">
                            <label className="pharmarack-cms-toggle-switch">
                                <input type="checkbox" className="pharmarack-cms-toggle-field" onChange={(_e) => handleTopCatItemToggleChange(_e, _item)} checked={_item.status} />
                                <span className="pharmarack-cms-toggle-slider"></span>
                            </label>            
                        </div>
                    </div>
                </div>

                {renderTopCatItemConfig(_item)}                

            </div>
        )

    };

    const getChildrenRecord = (_id) => {
        const result = childrens.find(item => item._id === _id);
        return result || null;
    };

    const renderTopCatItemsSection = () => {

        const items = [];

        if (record.configuration.sequence && Array.isArray(record.configuration.sequence)) {
            let itemConfig = null;
            for (let i = 0; i < record.configuration.sequence.length; i++) {
                itemConfig = getChildrenRecord(record.configuration.sequence[i]);
                if (itemConfig) {
                    items.push(renderTopCatItem(itemConfig));
                }
            }
        }     

        if (mode === "create") {
            items.push(<div key={uuidv4()} className="component-editor-item-form">{renderTopCatItemForm()}</div>);
        }

        if (items.length === 0) {
            items.push(<div key={uuidv4()} className="component-editor-zero-item-msg">-- No category item configured --</div>);
        }

        return items;

    };

    const handleTopCatItemFormBtnClick = (_mode) => {
        
        const contextObj = window._controller.getCurrentModuleInstance();
        if (!contextObj) {
            console.error("Context object not found");
            return;
        }

        if (_mode === "create") {
            setMode(_mode);
        } else if (_mode === "save") {

            /* Save the crm bar item */            
            const topCatItem = Helper.getConfigFieldValues(topCatItemNameSpace, contextObj.componentFormConfig, topCatItemFormFields);                       
            if (topCatItem) {

                topCatItem["configuration"] = "";
                topCatItem["type"] = topCatItemMeta._id;
                topCatItem["parent"] = record._id;
                topCatItem["page"] = record.page._id;                

                const request = {};
                request["method"] = "POST";
                request["endpoint"] = "/system/v1/api/component/component/create";
                request["payload"] = topCatItem;                    
                
                window._controller.dock(request, 
                    (_req, _res) => { 
                        
                        if (!record.configuration.sequence) {
                            record.configuration.sequence = [];
                        }

                        if (Array.isArray(record.configuration.sequence)) {
                            record.configuration.sequence.push(_res._id);
                        }                
                        
                        window._controller.notify(_res.title + " saved successfully.!");
                        fetchChildrens();

                        setTimeout(() => updateSequence(), 1000);

                    }, 
                    (_req, _res) => {
                        window._controller.notify(_res, "error");
                    }
                );

            }
            
        } else if (_mode === "update") {

            /* Update crm bar config */

            const topCatItem = {}; 
            const topCatItemConfigValues = Helper.getConfigFieldValues(topCatItemNameSpace, topCatItemConfig, topCatItemConfigFields);   

            if (topCatItemConfigValues && currentItem) {

                /* Update the crm bar item config */

                /* Now update the media fields - since it is not managed by the Helper utils */
                topCatItemConfigValues["asset_url"] = assetMediaRef.current.getVal();    
                topCatItem["configuration"] = topCatItemConfigValues;  
                topCatItem["title"] = topCatItemTitleRef.current.getVal();
                topCatItem["start_date"] = topCatItemStartDateRef.current.getVal();
                topCatItem["end_date"] = topCatItemEndDateRef.current.getVal();                                                  

                const request = {};
                request["method"] = "PUT";
                request["endpoint"] = "/system/v1/api/component/component/update?id="+ currentItem._id;
                request["payload"] = topCatItem;

                window._controller.dock(request, 
                    (_req, _res) => {
                        window._controller.notify(_res.title + " updated successfully.!"); 
                        /* Fetch the crm bar items */
                        fetchChildrens();
                         /* Also update the rules */
                        updateRules();                       
                    }, 
                    (_req, _res) => {
                        window._controller.notify(_res, "error");
                    }
                );
                
            }

        } else if (_mode === "delete") {

            if (currentItem) {

                const request = {};
                request["method"] = "DELETE";
                request["endpoint"] = "/system/v1/api/component/component/delete?id="+ currentItem._id;               

                window._controller.dock(request, 
                    (_req, _res) => {
                        window._controller.notify(currentItem.title + " removed successfully.!"); 
                        /* Remove rules too */
                        removeTopCatItemRules(currentItem._id);
                        /* Fetch the crm bar items */
                        fetchChildrens();                         
                    }, 
                    (_req, _res) => {
                        window._controller.notify(_res, "error");
                    }
                );

            }

        } else {
            setMode(_mode);
            setCurrentItem(null);
        }

    };

    const removeTopCatItemRules = (_id) => {

        let request = {};
        request["method"] = "DELETE";
        request["endpoint"] = "/system/v1/api/component/rule/bulk_filter_delete?field=component&value="+ _id;     

        window._controller.dock(request, 
            (_req, _res) => {
                /* Nothing to do, just ignore */        
            }, 
            (_req, _res) => {
                window._controller.notify(_res, "error");
            }
        );

        request = {};
        request["method"] = "DELETE";
        request["endpoint"] = "/system/v1/api/component/rules_group/bulk_filter_delete?field=component&value="+ _id;  
        
        window._controller.dock(request, 
            (_req, _res) => {
                /* Nothing to do, just ignore */        
            }, 
            (_req, _res) => {
                window._controller.notify(_res, "error");
            }
        );

    }

    const updateRules = () => {       

        const request = {};
        request["method"] = "PUT";
        request["endpoint"] = "/system/v1/api/component/rule/bulk_update?id="+ currentItem._id;
        request["payload"] = groupsRef.current.getGroupRules();  
                      
        window._controller.dock(request, 
            (_req, _res) => {     
                window._controller.notify("Rule updated successfully.!");
                
                setMode("list");
                setCurrentItem(null);

            }, 
            (_req, _res) => {
                window._controller.notify(_res, "error");
            }
        );

    };

    const renderTopCatItemActions = () => {

        if (mode === "create") {
            return (
                <>
                    <button key={uuidv4()} onClick={(e) => handleTopCatItemFormBtnClick("list")} className="pharmarack-cms-btn icon-left secondary"><i className="fa fa-times"></i> Cancel</button>
                    <button key={uuidv4()} onClick={(e) => handleTopCatItemFormBtnClick("save")} className="pharmarack-cms-btn icon-left success"><i className="fa fa-save"></i> Save</button>                    
                </>
            );
        } else if (mode === "edit") {
            return (
                <>
                    <button key={uuidv4()} onClick={(e) => handleTopCatItemFormBtnClick("list")} className="pharmarack-cms-btn icon-left secondary"><i className="fa fa-times"></i> Cancel</button>
                    <button key={uuidv4()} onClick={(e) => handleTopCatItemFormBtnClick("delete")} className="pharmarack-cms-btn icon-left danger"><i className="fa fa-trash"></i> Remove</button>                    
                    <button key={uuidv4()} onClick={(e) => handleTopCatItemFormBtnClick("update")} className="pharmarack-cms-btn icon-left success"><i className="fa fa-save"></i> Update</button>                    
                </>
            );
        } else {
            return <button key={uuidv4()} onClick={(e) => handleTopCatItemFormBtnClick("create")} className="pharmarack-cms-btn icon-left success"><i className="fa fa-plus"></i> Add Offer Item</button>
        }

    };

    const fetchChildrens = () => {
        window._controller.dock({
            method: "GET",
            endpoint: "/system/v1/api/component/component/childrens?id="+ record._id
            }, 
            (_req, _res) => {                                            
                setChildrens((prevState) => (_res)); 
                setMode("list");
            }, 
            (_req, _res) => {
                console.error(_res);
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

    const getTopCatItemSequence = () => {

        const dataIdArray = [];
        const topCatItems = document.querySelectorAll('.component-editor-child-item');                

        topCatItems.forEach(item => {    
            /* Better to clear the classes */    
            item.classList.remove("sorted");
            dataIdArray.push(item.getAttribute('data-id'));                        
        });

        return dataIdArray;

    };

    const self = {     

        getComponentConfiguration: () => {
            const _config = Helper.getConfigFieldValues(topCatNameSpace, config, topCatConfigFields);
            if (_config && typeof _config === 'object') {
                /* Update the child sequence */
                _config["sequence"] = getTopCatItemSequence();
            }
            return _config;
        },   

        /* Helper method used by the parent context object for converting title -> handle */     
        getTopCatItemFields: () => topCatItemFormFields

    };
    /* Expose the component to the consumer */
    useImperativeHandle(ref, () => self);

    useEffect(() => {

        /* Fetch the crm bar items */
        fetchChildrens();

        const contextObj = window._controller.getCurrentModuleInstance();
        if (!contextObj) {
            console.error("Context object not found");
            return;
        }

        for (let i = 0; i < contextObj.componentTypeList.length; i++) {
            if (contextObj.componentTypeList[i].handle === "category_item") {
                setTopCatItemMeta(contextObj.componentTypeList[i]);  
                break;
            }
        }

    }, []); 

    useEffect(() => {

        if (typeof topCatItemMeta.configuration === "string") {  
            setTopCatItemConfig(JSON.parse(topCatItemMeta.configuration));                        
        } else if (typeof topCatItemMeta.configuration === "object") {
            setTopCatItemConfig(topCatItemMeta.configuration);
        } 

    }, [topCatItemMeta]);

    return (
        <div className="pharmarack-cms-component-editor-container">

            <div key={uuidv4()} ref={leftColRef} className="component-editor-left-container">

                <div className="pharmarack-cms-view-column-title">
                    <h3>Configuration</h3>
                    <p>Top Categories (Used for FLUTTER)</p>
                </div>

                <div className="component-config-form">{renderTopCatConfigFields()}</div>

                <a href="#" className="pharmarack-cms-col-collapse-btn" onClick={handleCollapseBtnClick}><i className="fa fa-compress"></i></a>

            </div>

            <div key={uuidv4()} className="component-editor-right-container">

                <div className="pharmarack-cms-view-column-title">
                    <h3>Top Category Items</h3>
                    <p>Top Category Item Configurations (Used for FLUTTER)</p>
                </div>

                <div className="component-editor-items-container">{renderTopCatItemsSection()}</div>

                <div className="component-editor-form-action-container">{renderTopCatItemActions()}</div>                

            </div>

        </div>
    );

};

export default forwardRef(TopCategories);