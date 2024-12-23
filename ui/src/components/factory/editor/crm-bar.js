import React, {forwardRef, useImperativeHandle, useState, useEffect} from "react";
import { v4 as uuidv4 } from 'uuid';
import Helper from "../../../utils/helper";
import Media from "../../media";
import Input from "../../form/input";
import ComponentRuleGroup from "../../component-rule-group";

const CrmBar = (props, ref) => {

    let config = {};    
    /* parent configuration */
    let crmBarConfigFields = {};
    /* for crm bar item configuration */
    let crmBarItemConfigFields = {};
    /* For new crm bar item creation */
    let crmBarItemFormFields = {};     
    /* For sortable */  
    let selected = null;

    let groupsRef = null;
    let assetMediaRef = null;  
    
    let tabAssetMediaRef = null;
    let webAssetMediaRef = null;
    let mobileAssetMediaRef = null;  

    let crmBarItemTitleRef = null;
    let crmBarItemEndDateRef = null;
    let crmBarItemStartDateRef = null;

    const leftColRef = React.createRef();
    
    const [record, setRecord] = useState(props.record);
    const [childrens, setChildrens] = useState([]);
    const [mode, setMode] = useState("list");
    const [crmBarItemMeta, setCrmBarItemMeta] = useState({});
    const [crmBarItemConfig, setCrmBarItemConfig] = useState({});
    const [currentItem, setCurrentItem] = useState(null);
    const [collaps, setCollapse] = useState(false);

    const crmBarNameSpace = "crm_bar_";
    const crmBarItemNameSpace = "crm_bar_item_";

    if (props.config && (typeof props.config !== 'object')) {
        try {
            config = JSON.parse(props.config);
        } catch(_e) {
            console.error(_e);
        }        
    }

    const renderCrmBarConfigFields = () => {

        const result = Helper.renderConfigFields(crmBarNameSpace, config, record.configuration);       
        crmBarConfigFields = result.refs;
        return result.fields;

    };

    const renderCrmBarItemForm = () => {

        const contextObj = window._controller.getCurrentModuleInstance();
        if (contextObj) {
            contextObj.componentFormConfig["title"]["value"] = "";
            contextObj.componentFormConfig["sub_title"]["value"] = "";
            contextObj.componentFormConfig["handle"]["value"] = "";
            contextObj.componentFormConfig["start_date"]["value"] = "";
            contextObj.componentFormConfig["end_date"]["value"] = "";
            contextObj.componentFormConfig["status"]["value"] = false;
            const result = Helper.renderConfigFields(crmBarItemNameSpace, contextObj.componentFormConfig, {});       
            crmBarItemFormFields = result.refs;
            return result.fields;                   
        }
        
        return null;

    };

    const handleCrmBarItemToggleChange = (_e, _item) => {

        /* Update the crm bar item status */
        const request = {};        
        request["method"] = "PUT";
        request["endpoint"] = "/system/v1/api/component/component/update?id="+ _item._id
        request["payload"] = {};                        
        request["payload"]["status"] = _e.target.checked;

        window._controller.docker.dock(request).then((_res) => {            
            /* Update the childrens array too */
            for (let i = 0; i < childrens.length; i++) {
                if (childrens[i]._id === _res._id) {
                    childrens.splice(i, 1, _res);
                }
            }
            setChildrens([...childrens]);
            window._controller.notify( _item.title + (_e.target.checked ? " disabled successfully" : " enabled successfully"));                                   
        })
        .catch((e) => {
            window._controller.notify(e.message, "error");
        });

    };

    const handleCrmBarItemClick = (_e, _item) => {

        _e.preventDefault();

        /* Fetch the crm bar items */               

        if (currentItem && (_item._id === currentItem._id)) {
            setMode("list");
            setCurrentItem(null);
        } else {
            for (let i = 0; i < childrens.length; i++) {
                if (_item._id === childrens[i]._id) {
                    setCurrentItem(childrens[i]);
                    setMode("edit");
                    return;
                }
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
            const response = await window._controller.docker.upload('/system/v1/api/component/component/s3_upload_for_child', formData);
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
            window._controller.notify(_e.message, "error");
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
        
        window._controller.docker.dock(request).then((_res) => {            
            /* Update the childrens array too */
            for (let i = 0; i < childrens.length; i++) {
                if (childrens[i]._id === _res._id) {
                    childrens.splice(i, 1, _res);
                }
            }
            setCurrentItem(_res); 
        })
        .catch((e) => {
            window._controller.notify(e.message, "error");
        });

    };

    const renderCrmBarItemConfig = (_item) => {

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
        tabAssetMediaRef = React.createRef();
        webAssetMediaRef = React.createRef();
        mobileAssetMediaRef = React.createRef();          
        
        crmBarItemTitleRef = React.createRef();        
        crmBarItemEndDateRef = React.createRef();
        crmBarItemStartDateRef = React.createRef();  

        const _tabAssetMedia = <Media key={uuidv4()} ref={tabAssetMediaRef} config={crmBarItemConfig["tab_asset_url"]} type={_type} handleMediaChange={handleMediaChange} handleMediaDelete={handleMediaDelete} value={_config["tab_asset_url"]} />;
        const _webAssetMedia = <Media key={uuidv4()} ref={webAssetMediaRef} config={crmBarItemConfig["web_asset_url"]} type={_type} handleMediaChange={handleMediaChange} handleMediaDelete={handleMediaDelete} value={_config["web_asset_url"]} />;        

        const _assetValue = _config["asset_url"] ? _config["asset_url"] : _config["mobile_asset_url"];
        const _mobileAssetMedia = <Media key={uuidv4()} ref={mobileAssetMediaRef} config={crmBarItemConfig["mobile_asset_url"]} type={_type} handleMediaChange={handleMediaChange} handleMediaDelete={handleMediaDelete} value={_assetValue} />;

        const tabAssetMedia = Helper.buildWrapper(crmBarItemConfig["tab_asset_url"], _tabAssetMedia);
        const webAssetMedia = Helper.buildWrapper(crmBarItemConfig["web_asset_url"], _webAssetMedia);        
        const mobileAssetMedia = Helper.buildWrapper(crmBarItemConfig["mobile_asset_url"], _mobileAssetMedia);        

        /* Prevent this media from rendering by the helper */
        crmBarItemConfig["tab_asset_url"]["visible"] = false;
        crmBarItemConfig["web_asset_url"]["visible"] = false;
        crmBarItemConfig["mobile_asset_url"]["visible"] = false;

        const result = Helper.renderConfigFields(crmBarItemNameSpace, crmBarItemConfig, _config);       
        crmBarItemConfigFields = result.refs;

        const contextObj = window._controller.getCurrentModuleInstance();  
        if (contextObj) {

            const titleConfig = contextObj.componentFormConfig["title"];            
            const endDateConfig = contextObj.componentFormConfig["end_date"];
            const startDateConfig = contextObj.componentFormConfig["start_date"];

            titleConfig["value"] = _item["title"];
            endDateConfig["value"] = _item["end_date"];
            startDateConfig["value"] = _item["start_date"];

            const _crmBarItemTitle = <Input ref={crmBarItemTitleRef} namespace={crmBarNameSpace} config={titleConfig} />;
            const _crmBarItemEndDate = <Input ref={crmBarItemEndDateRef} namespace={crmBarNameSpace} config={endDateConfig} />;
            const _crmBarItemStartDate = <Input ref={crmBarItemStartDateRef} namespace={crmBarNameSpace} config={startDateConfig} />;

            const carouselItemTitle = Helper.buildWrapper(titleConfig, _crmBarItemTitle);
            const carouselItemEndDate = Helper.buildWrapper(endDateConfig, _crmBarItemEndDate);
            const carouselItemStartDate = Helper.buildWrapper(startDateConfig, _crmBarItemStartDate);

            result.fields.splice(0, 0, carouselItemEndDate);
            result.fields.splice(0, 0, carouselItemStartDate);
            result.fields.splice(0, 0, carouselItemTitle);

        }              
        
        result.fields.splice(0, 0, webAssetMedia);
        result.fields.splice(0, 0, tabAssetMedia);        
        result.fields.splice(0, 0, mobileAssetMedia);      

        return (
            <div key={uuidv4()} className="component-item-config">
                {result.fields}
                <div className="component-item-rules">
                    <label>Mapping Rules</label>
                    {<ComponentRuleGroup ref={groupsRef} id={currentItem._id} />}
                </div>
            </div>
        );

    };

    const updateSequence = () => {

        const request = {};
        request["method"] = "POST";
        request["endpoint"] = "/system/v1/api/component/component/update_sequence?id="+ record._id;
        request["payload"] = getCrmBarItemSequence();
        
        window._controller.docker.dock(request).then((_res) => {            
            window._controller.notify("Crm bar item's sequence updated", "info"); 
        })
        .catch((e) => {
            window._controller.notify(e.message, "error");
        });

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

    const renderCrmBarItem = (_item) => {

        return (
            <div key={uuidv4()} data-id={_item._id} className="component-editor-child-item" draggable="true" onDragStart={(_e) => handleDragStart(_e)} onDragEnd={handleDragEnd} onDragOver={(_e) => handleDragOver(_e)}>

                <div className="component-item-header">
                    <div key={uuidv4()}>
                        <h3><a href="#" className="drag-handle"><i className="fa fa-grip-vertical"></i></a><a href="#" onClick={(_e) => handleCrmBarItemClick(_e, _item)} >{_item.title}</a></h3>
                    </div>
                    <div key={uuidv4()}>
                        <div className="toggle-container">
                            <label className="pharmarack-cms-toggle-switch">
                                <input type="checkbox" className="pharmarack-cms-toggle-field" onChange={(_e) => handleCrmBarItemToggleChange(_e, _item)} checked={_item.status} />
                                <span className="pharmarack-cms-toggle-slider"></span>
                            </label>            
                        </div>
                    </div>
                </div>

                {renderCrmBarItemConfig(_item)}                

            </div>
        )

    };

    const getChildrenRecord = (_id) => {
        const result = childrens.find(item => item._id === _id);
        return result || null;
    };

    const renderCrmBarItemsSection = () => {

        const items = [];

        if (record.configuration.sequence && Array.isArray(record.configuration.sequence)) {
            let itemConfig = null;
            for (let i = 0; i < record.configuration.sequence.length; i++) {
                itemConfig = getChildrenRecord(record.configuration.sequence[i]);
                if (itemConfig) {
                    items.push(renderCrmBarItem(itemConfig));
                }
            }
        }     

        if (mode === "create") {
            items.push(<div key={uuidv4()} className="component-editor-item-form">{renderCrmBarItemForm()}</div>);
        }

        if (items.length === 0) {
            items.push(<div key={uuidv4()} className="component-editor-zero-item-msg">-- No crm item configured --</div>);
        }

        return items;

    };

    const validateDates = (_sDate, _eDate, _eField) => {
       
        const sDate = new Date(_sDate);
        const eDate = new Date(_eDate);        

        if (sDate && eDate) {
            sDate.setHours(0,0,0,0);
            eDate.setHours(0,0,0,0);
            if (eDate < sDate) {
                _eField.current.setError();
                window._controller.notify("End date should be greater than or equal to Start date", "error");
                return false;
            }
        } 
        
        if(eDate) {
            eDate.setHours(0,0,0,0);
            var today = new Date();
            today.setHours(0, 0, 0, 0);
            if (eDate < today) {
                _eField.current.setError();
                window._controller.notify("End date should be greater than or equal to Today", "error");
                return false;
            }
        }

        _eField.current.clearError();
        return true;

    };

    const handleCrmBarItemFormBtnClick = (_mode) => {
        
        const contextObj = window._controller.getCurrentModuleInstance();
        if (!contextObj) {
            console.error("Context object not found");
            return;
        }

        if (_mode === "create") {
            setMode(_mode);

        } else if (_mode === "save") {

            /* Save the crm bar item */            
            const crmBarItem = Helper.getConfigFieldValues(crmBarItemNameSpace, contextObj.componentFormConfig, crmBarItemFormFields);                       
            if (crmBarItem) {

                /* Validate dates */
                if(!validateDates(crmBarItem["start_date"], crmBarItem["end_date"], crmBarItemFormFields[crmBarItemNameSpace +"end_date"])) {
                    return;
                }

                crmBarItem["configuration"] = "";
                crmBarItem["type"] = crmBarItemMeta._id;
                crmBarItem["parent"] = record._id;                            

                const request = {};
                request["method"] = "POST";
                request["endpoint"] = "/system/v1/api/component/component/create";
                request["payload"] = crmBarItem; 
                
                window._controller.docker.dock(request).then((_res) => {            
                    if (!record.configuration.sequence) {
                        record.configuration.sequence = [];
                    }

                    if (Array.isArray(record.configuration.sequence)) {
                        record.configuration.sequence.push(_res.payload._id);
                    }                
                    
                    window._controller.notify(_res.payload.title + " saved successfully.!");
                    fetchChildrens();

                    setTimeout(() => updateSequence(), 1000);   
                })
                .catch((e) => {
                    window._controller.notify(e.message, "error");
                });
                
            }
            
        } else if (_mode === "update") {

            /* Update crm bar config */

            const crmBarItem = {}; 
            const crmBarItemConfigValues = Helper.getConfigFieldValues(crmBarItemNameSpace, crmBarItemConfig, crmBarItemConfigFields);   

            if (crmBarItemConfigValues && currentItem) {

                /* Update the crm bar item config */

                /* Now update the media fields - since it is not managed by the Helper utils */
                crmBarItemConfigValues["tab_asset_url"] = tabAssetMediaRef.current.getVal();    
                crmBarItemConfigValues["web_asset_url"] = webAssetMediaRef.current.getVal();    
                crmBarItemConfigValues["mobile_asset_url"] = mobileAssetMediaRef.current.getVal();                   

                /* Keeping this for legacy support */
                crmBarItemConfigValues["asset_url"] = mobileAssetMediaRef.current.getVal();

                /* Get the dimension too */
                crmBarItemConfigValues["tab_assest_dimension"] = tabAssetMediaRef.current.getDimension();
                crmBarItemConfigValues["web_assest_dimension"] = webAssetMediaRef.current.getDimension();
                crmBarItemConfigValues["mobile_assest_dimension"] = mobileAssetMediaRef.current.getDimension();   

                /* Keeping this for legacy support */
                crmBarItemConfigValues["assest_dimension"] = mobileAssetMediaRef.current.getDimension();   

                crmBarItem["configuration"] = crmBarItemConfigValues;                                    
                crmBarItem["title"] = crmBarItemTitleRef.current.getVal();
                crmBarItem["start_date"] = crmBarItemStartDateRef.current.getVal();
                crmBarItem["end_date"] = crmBarItemEndDateRef.current.getVal();

                /* Validate dates */
                if(!validateDates(crmBarItem["start_date"], crmBarItem["end_date"], crmBarItemEndDateRef)) {
                    return;
                }

                const request = {};
                request["method"] = "PUT";
                request["endpoint"] = "/system/v1/api/component/component/update?id="+ currentItem._id;
                request["payload"] = crmBarItem;

                window._controller.docker.dock(request).then((_res) => {            
                    window._controller.notify(_res.title + " updated successfully.!"); 
                    /* Also update the rules */
                    updateRules();                       
                    /* Fetch the crm bar items */
                    fetchChildrens();     
                })
                .catch((e) => {
                    window._controller.notify(e.message, "error");
                });

            }

        } else if (_mode === "delete") {

            if (currentItem) {

                const request = {};
                request["method"] = "DELETE";
                request["endpoint"] = "/system/v1/api/component/component/delete?id="+ currentItem._id;               

                window._controller.docker.dock(request).then((_res) => {            
                    window._controller.notify(currentItem.title + " removed successfully.!"); 
                    /* Remove rules too */
                    removeCrmBarItemRules(currentItem._id);
                    /* Fetch the crm bar items */
                    fetchChildrens();  
                })
                .catch((e) => {
                    window._controller.notify(e.message, "error");
                });

            }

        } else if (_mode === "clone") {

            if (currentItem) {

                const request = {};   
                request["method"] = "POST";
                request["endpoint"] = "/system/v1/api/component/component/clone?component="+ currentItem._id;

                window._controller.docker.dock(request).then((_res) => {            
                    window._controller.notify("Cloned successfully.!");
                    /* Update the sequence */
                    record.configuration.sequence = _res.configuration.sequence;
                    /* reset the mode */
                    setMode(_mode);
                    setCurrentItem(null);
                    /* Fetch the carousel items */
                    fetchChildrens();  
                })
                .catch((e) => {
                    window._controller.notify(e.message, "error");
                });

            }

        } else {
            setMode(_mode);
            setCurrentItem(null);
        }

    };

    const removeCrmBarItemRules = (_id) => {

        let request = {};
        request["method"] = "DELETE";
        request["endpoint"] = "/system/v1/api/component/rule/bulk_filter_delete?field=component&value="+ _id;     

        window._controller.docker.dock(request).then((_res) => {            
            /* Nothing to do, just ignore */   
        })
        .catch((e) => {
            window._controller.notify(e.message, "error");
        });

        request = {};
        request["method"] = "DELETE";
        request["endpoint"] = "/system/v1/api/component/rules_group/bulk_filter_delete?field=component&value="+ _id;  
        
        window._controller.docker.dock(request).then((_res) => {            
            /* Nothing to do, just ignore */   
        })
        .catch((e) => {
            window._controller.notify(e.message, "error");
        });

    }

    const updateRules = () => { 
 
        const request = {};
        request["method"] = "PUT";
        request["endpoint"] = "/system/v1/api/component/rule/bulk_update?id="+ currentItem._id;
        request["payload"] = groupsRef.current.getGroupRules();
        
        window._controller.docker.dock(request).then((_res) => {            
            window._controller.notify("Rule updated successfully.!");            
            setMode("list");
            setCurrentItem(null);
        })
        .catch((e) => {
            window._controller.notify(e.message, "error");
        });           

    };

    const renderCrmBarItemActions = () => {

        if (mode === "create") {
            return (
                <>
                    <button key={uuidv4()} onClick={(e) => handleCrmBarItemFormBtnClick("list")} className="pharmarack-cms-btn icon-left secondary"><i className="fa fa-times"></i> Cancel</button>
                    <button key={uuidv4()} onClick={(e) => handleCrmBarItemFormBtnClick("save")} className="pharmarack-cms-btn icon-left success"><i className="fa fa-save"></i> Save</button>                    
                </>
            );
        } else if (mode === "edit") {
            return (
                <>
                    <button key={uuidv4()} onClick={(e) => handleCrmBarItemFormBtnClick("list")} className="pharmarack-cms-btn icon-left secondary"><i className="fa fa-times"></i> Cancel</button>
                    <button key={uuidv4()} onClick={(e) => handleCrmBarItemFormBtnClick("delete")} className="pharmarack-cms-btn icon-left danger"><i className="fa fa-trash"></i> Remove</button>   
                    <button key={uuidv4()} onClick={(e) => handleCrmBarItemFormBtnClick("clone")} className="pharmarack-cms-btn icon-left warning"><i className="fa fa-clone"></i> Clone</button>                 
                    <button key={uuidv4()} onClick={(e) => handleCrmBarItemFormBtnClick("update")} className="pharmarack-cms-btn icon-left success"><i className="fa fa-save"></i> Update</button>                    
                </>
            );
        } else {
            return <button key={uuidv4()} onClick={(e) => handleCrmBarItemFormBtnClick("create")} className="pharmarack-cms-btn icon-left success"><i className="fa fa-plus"></i> Add Crm Bar Item</button>
        }

    };

    const fetchChildrens = () => {

        window._controller.docker.dock({
            method: "GET",
            endpoint: "/system/v1/api/component/component/childrens?id="+ record._id
        }).then((_res) => {            
            setChildrens((prevState) => (_res)); 
            setMode("list");
        })
        .catch((e) => {
            window._controller.notify(e.message, "error");
        });

    };

    const handleCollapseBtnClick = () => {
        setCollapse(prevState => !prevState);
    };

    const getCrmBarItemSequence = () => {

        const dataIdArray = [];
        const bannerItems = document.querySelectorAll('.component-editor-child-item');                

        bannerItems.forEach(item => {    
            /* Better to clear the classes */    
            item.classList.remove("sorted");
            dataIdArray.push(item.getAttribute('data-id'));                        
        });

        return dataIdArray;

    };

    const self = {     

        getComponentConfiguration: () => {
            const _config = Helper.getConfigFieldValues(crmBarNameSpace, config, crmBarConfigFields);
            if (_config && typeof _config === 'object') {
                /* Update the child sequence */
                _config["sequence"] = getCrmBarItemSequence();
            }
            return _config;
        },   

        /* Helper method used by the parent context object for converting title -> handle */     
        getCrmBarItemFields: () => crmBarItemFormFields

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

        for (let i = 0; i < window._controller.bucket.componentTypeList.length; i++) {
            if (window._controller.bucket.componentTypeList[i].handle === "crm_bar_item") {
                setCrmBarItemMeta(window._controller.bucket.componentTypeList[i]);  
                break;
            }
        }

    }, []); 

    useEffect(() => {

        if (typeof crmBarItemMeta.configuration === "string") {  
            setCrmBarItemConfig(JSON.parse(crmBarItemMeta.configuration));                        
        } else if (typeof crmBarItemMeta.configuration === "object") {
            setCrmBarItemConfig(crmBarItemMeta.configuration);
        } 

    }, [crmBarItemMeta]);

    let cssProps = {
        width: "50%"        
    };

    if (collaps) {
        cssProps.width = "0%"        
    } 

    return (
        <div className="pharmarack-cms-component-editor-container">

            

            <div key={uuidv4()} className="component-editor-right-container">

                <div className="pharmarack-cms-view-column-title">
                    <h3>Crm Bar Items</h3>
                    <p>Crm Bar Item Configurations (Used for FLUTTER)</p>
                </div>

                <div className="component-editor-items-container">{renderCrmBarItemsSection()}</div>

                <div className="component-editor-form-action-container">{renderCrmBarItemActions()}</div>                

            </div>

        </div>
    );

};

export default forwardRef(CrmBar);