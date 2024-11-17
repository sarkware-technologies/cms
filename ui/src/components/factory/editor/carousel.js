import React, {forwardRef, useImperativeHandle, useState, useEffect} from "react";
import { v4 as uuidv4 } from 'uuid';
import Helper from "../../../utils/helper";
import Media from "../../media";
import Input from "../../form/input";
import RuleGroups from "../../rule-groups";

const Carousel = (props, ref) => {

    let config = {};    
    /* parent configuration */
    let carouselConfigFields = {};
    /* for carousel item configuration */
    let carouselItemConfigFields = {};
    /* For new carousel item creation */
    let carouselItemFormFields = {};     
    /* For sortable */  
    let selected = null;

    let groupsRef = null;

    let webAssetMediaRef = null;
    let mobileAssetMediaRef = null;

    let carouselItemTitleRef = null;    
    let carouselItemEndDateRef = null;
    let carouselItemStartDateRef = null;

    const leftColRef = React.createRef();
    
    const [record, setRecord] = useState(props.record);
    const [childrens, setChildrens] = useState([]);
    const [mode, setMode] = useState("list");
    const [carouselItemMeta, setCarouselItemMeta] = useState({});
    const [carouselItemConfig, setCarouselItemConfig] = useState({});
    const [currentItem, setCurrentItem] = useState(null);
    const [collaps, setCollapse] = useState(false);

    const carouselNameSpace = "carousel_";
    const carouselItemNameSpace = "carousel_item_";

    if (typeof props.config !== 'object') {
        try {
            config = JSON.parse(props.config);
        } catch(_e) {
            console.error(_e);
        }        
    }

    const renderCarouselConfigFields = () => {

        const result = Helper.renderConfigFields(carouselNameSpace, config, record.configuration);       
        carouselConfigFields = result.refs;
        return result.fields;

    };

    const renderCarouselItemForm = () => {

        const contextObj = window._controller.getCurrentModuleInstance();
        if (contextObj) {

            contextObj.componentFormConfig["title"]["value"] = "";
            contextObj.componentFormConfig["sub_title"]["value"] = "";
            contextObj.componentFormConfig["handle"]["value"] = "";
            contextObj.componentFormConfig["start_date"]["value"] = "";
            contextObj.componentFormConfig["end_date"]["value"] = "";
            contextObj.componentFormConfig["status"]["value"] = false;

            const result = Helper.renderConfigFields(carouselItemNameSpace, contextObj.componentFormConfig, {});       
            carouselItemFormFields = result.refs;
            return result.fields;                   
        }
        
        return null;

    };

    const handleCarouselItemToggleChange = (_e, _item) => {

        /* Update the carousel item status */
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
            window._controller.notify(_item.title + " failed to update.!", "error");
        });

    };

    const handleCarouselItemClick = (_e, _item) => {

        _e.preventDefault();

        /* Ftech the carousel items */      
           
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

    const renderCarouselItemConfig = (_item) => {

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

        webAssetMediaRef = React.createRef();
        mobileAssetMediaRef = React.createRef();
        
        carouselItemTitleRef = React.createRef();        
        carouselItemEndDateRef = React.createRef();
        carouselItemStartDateRef = React.createRef();  

        const _webAssetMedia = <Media key={uuidv4()} ref={webAssetMediaRef} config={carouselItemConfig["web_asset_url"]} type={_type} handleMediaChange={handleMediaChange} handleMediaDelete={handleMediaDelete} value={_config["web_asset_url"]} />;
        const _mobileAssetMedia = <Media key={uuidv4()} ref={mobileAssetMediaRef} config={carouselItemConfig["mobile_asset_url"]} type={_type} handleMediaChange={handleMediaChange} handleMediaDelete={handleMediaDelete} value={_config["mobile_asset_url"]} />;

        const webAssetMedia = Helper.buildWrapper(carouselItemConfig["web_asset_url"], _webAssetMedia);
        const mobileAssetMedia = Helper.buildWrapper(carouselItemConfig["mobile_asset_url"], _mobileAssetMedia);

        /* Prevent this media from rendering by the helper */
        carouselItemConfig["web_asset_url"]["visible"] = false;
        carouselItemConfig["mobile_asset_url"]["visible"] = false;

        const result = Helper.renderConfigFields(carouselItemNameSpace, carouselItemConfig, _config);       
        carouselItemConfigFields = result.refs;

        const contextObj = window._controller.getCurrentModuleInstance();
        if (contextObj) {

            const titleConfig = contextObj.componentFormConfig["title"];            
            const endDateConfig = contextObj.componentFormConfig["end_date"];
            const startDateConfig = contextObj.componentFormConfig["start_date"];

            titleConfig["value"] = _item["title"];
            endDateConfig["value"] = _item["end_date"];
            startDateConfig["value"] = _item["start_date"];

            const _carouselItemTitle = <Input ref={carouselItemTitleRef} namespace={carouselNameSpace} config={titleConfig} />;
            const _carouselItemEndDate = <Input ref={carouselItemEndDateRef} namespace={carouselNameSpace} config={endDateConfig} />;
            const _carouselItemStartDate = <Input ref={carouselItemStartDateRef} namespace={carouselNameSpace} config={startDateConfig} />;

            const carouselItemTitle = Helper.buildWrapper(titleConfig, _carouselItemTitle);
            const carouselItemEndDate = Helper.buildWrapper(endDateConfig, _carouselItemEndDate);
            const carouselItemStartDate = Helper.buildWrapper(startDateConfig, _carouselItemStartDate);

            result.fields.splice(0, 0, carouselItemEndDate);
            result.fields.splice(0, 0, carouselItemStartDate);
            result.fields.splice(0, 0, carouselItemTitle);

        }   
        
        result.fields.splice(0, 0, webAssetMedia);
        result.fields.splice(0, 0, mobileAssetMedia);

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
        request["payload"] = getCarouselItemSequence();                    
        
        window._controller.docker.dock(request).then((_res) => {            
            window._controller.notify("Carousel item's sequence updated", "info");
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

    }

    const renderCarouselItem = (_item) => {

        return (
            <div key={uuidv4()} data-id={_item._id} className="component-editor-child-item" draggable="true" onDragStart={(_e) => handleDragStart(_e)} onDragEnd={handleDragEnd} onDragOver={(_e) => handleDragOver(_e)}>

                <div className="component-item-header">
                    <div key={uuidv4()}>
                        <h3><a href="#" className="drag-handle"><i className="fa fa-grip-vertical"></i></a><a href="#" onClick={(_e) => handleCarouselItemClick(_e, _item)} >{_item.title}</a></h3>
                    </div>
                    <div key={uuidv4()}>
                        <div className="toggle-container">
                            <label className="pharmarack-cms-toggle-switch">
                                <input type="checkbox" className="pharmarack-cms-toggle-field" onChange={(_e) => handleCarouselItemToggleChange(_e, _item)} checked={_item.status} />
                                <span className="pharmarack-cms-toggle-slider"></span>
                            </label>            
                        </div>
                    </div>
                </div>

                {renderCarouselItemConfig(_item)}                

            </div>
        )

    };

    const getChildrenRecord = (_id) => {
        const result = childrens.find(item => item._id === _id);
        return result || null;
    };

    const renderCarouselItemsSection = () => {

        const items = [];

        if (record.configuration.sequence && Array.isArray(record.configuration.sequence)) {
            let itemConfig = null;
            for (let i = 0; i < record.configuration.sequence.length; i++) {
                itemConfig = getChildrenRecord(record.configuration.sequence[i]);
                if (itemConfig) {
                    items.push(renderCarouselItem(itemConfig));
                }
            }
        }     

        if (mode === "create") {
            items.push(<div key={uuidv4()} className="component-editor-item-form">{renderCarouselItemForm()}</div>);
        }

        if (items.length === 0) {
            items.push(<div key={uuidv4()} className="component-editor-zero-item-msg">-- No banner configured --</div>);
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

    const handleCarouselItemFormBtnClick = (_mode) => {
        
        const contextObj = window._controller.getCurrentModuleInstance();
        if (!contextObj) {
            console.error("Context object not found");
            return;
        }

        if (_mode === "create") {
            setMode(_mode);
        } else if (_mode === "save") {

            /* Save the carousel item */            
            const carouselItem = Helper.getConfigFieldValues(carouselItemNameSpace, contextObj.componentFormConfig, carouselItemFormFields);                       
            if (carouselItem) {

                /* Validate dates */
                if(!validateDates(carouselItem["start_date"], carouselItem["end_date"], carouselItemFormFields[carouselItemNameSpace +"end_date"])) {
                    return;
                }

                carouselItem["configuration"] = "";
                carouselItem["type"] = carouselItemMeta._id;
                carouselItem["parent"] = record._id;
                
                const request = {};
                request["method"] = "POST";
                request["endpoint"] = "/system/v1/api/component/component/create";
                request["payload"] = carouselItem;   
                
                window._controller.docker.dock(request).then((_res) => {            
                    if (!record.configuration.sequence) {
                        record.configuration.sequence = [];
                    }

                    if (Array.isArray(record.configuration.sequence)) {
                        record.configuration.sequence.push(_res._id);
                    }               
                    
                    window._controller.notify(_res.title + " saved successfully.!");
                    fetchChildrens();

                    setTimeout(() => updateSequence(), 1000);
                })
                .catch((e) => {
                    window._controller.notify(e.message, "error");
                });
                
            }
            
        } else if (_mode === "update") {

            /* Update carousel config */

            const carouselItem = {};   
            const carouselItemConfigValues = Helper.getConfigFieldValues(carouselItemNameSpace, carouselItemConfig, carouselItemConfigFields);   

            if (carouselItemConfigValues && currentItem) {                

                /* Update the carousel item config */

                /* Now update the media fields - since it is not managed by the Helper utils */
                carouselItemConfigValues["web_asset_url"] = webAssetMediaRef.current.getVal();
                carouselItemConfigValues["mobile_asset_url"] = mobileAssetMediaRef.current.getVal();

                /* Get the dimension too */
                carouselItemConfigValues["mobile_assest_dimension"] = mobileAssetMediaRef.current.getDimension();    
                carouselItemConfigValues["web_assest_dimension"] = webAssetMediaRef.current.getDimension();    

                carouselItem["configuration"] = carouselItemConfigValues;                    
                carouselItem["title"] = carouselItemTitleRef.current.getVal();
                carouselItem["start_date"] = carouselItemStartDateRef.current.getVal();
                carouselItem["end_date"] = carouselItemEndDateRef.current.getVal();

                /* Validate dates */
                if(!validateDates(carouselItem["start_date"], carouselItem["end_date"], carouselItemEndDateRef)) {
                    return;
                }

                const request = {};
                request["method"] = "PUT";
                request["endpoint"] = "/system/v1/api/component/component/update?id="+ currentItem._id;
                request["payload"] = carouselItem;

                window._controller.docker.dock(request).then((_res) => {            
                    window._controller.notify(_res.title + " updated successfully.!"); 
                    /* Fetch the banner items */
                    fetchChildrens();
                        /* Also update the rules */
                    updateRules();  
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
                    removeCarouselItemRules(currentItem._id);
                    /* Fetch the carousel items */
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

    const removeCarouselItemRules = (_id) => {

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

    const renderCarouselItemActions = () => {

        if (mode === "create") {
            return (
                <>
                    <button key={uuidv4()} onClick={(e) => handleCarouselItemFormBtnClick("list")} className="pharmarack-cms-btn icon-left secondary"><i className="fa fa-times"></i> Cancel</button>
                    <button key={uuidv4()} onClick={(e) => handleCarouselItemFormBtnClick("save")} className="pharmarack-cms-btn icon-left success"><i className="fa fa-save"></i> Save</button>                    
                </>
            );
        } else if (mode === "edit") {
            return (
                <>
                    <button key={uuidv4()} onClick={(e) => handleCarouselItemFormBtnClick("list")} className="pharmarack-cms-btn icon-left secondary"><i className="fa fa-times"></i> Cancel</button>
                    <button key={uuidv4()} onClick={(e) => handleCarouselItemFormBtnClick("delete")} className="pharmarack-cms-btn icon-left danger"><i className="fa fa-trash"></i> Remove</button>                    
                    <button key={uuidv4()} onClick={(e) => handleCarouselItemFormBtnClick("clone")} className="pharmarack-cms-btn icon-left warning"><i className="fa fa-clone"></i> Clone</button>                    
                    <button key={uuidv4()} onClick={(e) => handleCarouselItemFormBtnClick("update")} className="pharmarack-cms-btn icon-left success"><i className="fa fa-save"></i> Update</button>                    
                </>
            );
        } else {
            return <button key={uuidv4()} onClick={(e) => handleCarouselItemFormBtnClick("create")} className="pharmarack-cms-btn icon-left success"><i className="fa fa-plus"></i> Add Banner Item</button>
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

    const getCarouselItemSequence = () => {

        const dataIdArray = [];
        const carouselItems = document.querySelectorAll('.component-editor-child-item');                

        carouselItems.forEach(item => {    
            /* Better to clear the classes */    
            item.classList.remove("sorted");
            dataIdArray.push(item.getAttribute('data-id'));                        
        });

        return dataIdArray;

    };

    const self = {        
        getComponentConfiguration: () => {
            const _config = Helper.getConfigFieldValues(carouselNameSpace, config, carouselConfigFields);
            if (_config && typeof _config === 'object') {
                /* Update the child sequence */
                _config["sequence"] = getCarouselItemSequence();
            }
            return _config;
        },   
        /* Helper method used by the parent context object for converting title -> handle */     
        getCarouselItemFields: () => carouselItemFormFields
    };
    /* Expose the component to the consumer */
    useImperativeHandle(ref, () => self);

    useEffect(() => {

        /* Fetch the carousel items */
        fetchChildrens();

        const contextObj = window._controller.getCurrentModuleInstance();
        if (!contextObj) {
            console.error("Context object not found");
            return;
        }

        for (let i = 0; i < window._controller.bucket.componentTypeList.length; i++) {
            if (window._controller.bucket.componentTypeList[i].handle === "carousel_item") {
                setCarouselItemMeta(window._controller.bucket.componentTypeList[i]);  
                break;
            }
        }

    }, []); 

    useEffect(() => {
  
        if (typeof carouselItemMeta.configuration === "string") {
            setCarouselItemConfig(JSON.parse(carouselItemMeta.configuration));                        
        } else if (typeof carouselItemMeta.configuration === "object") {
            setCarouselItemConfig(carouselItemMeta.configuration);
        } 

    }, [carouselItemMeta]);

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
                    <p>Carousel Behaviours (Used for FLUTTER)</p>
                </div>

                <div className="component-config-form">{renderCarouselConfigFields()}</div>

                <a href="#" className="pharmarack-cms-col-collapse-btn" onClick={handleCollapseBtnClick}><i className="fa fa-compress"></i></a>

            </div>

            <div key={uuidv4()} className="component-editor-right-container">

                <div className="pharmarack-cms-view-column-title">
                    <h3>Carousel Items</h3>
                    <p>Carousel Item Configurations (Used for FLUTTER)</p>
                </div>

                <div className="component-editor-items-container">{renderCarouselItemsSection()}</div>

                <div className="component-editor-form-action-container">{renderCarouselItemActions()}</div>                

            </div>

        </div>
    );

};

export default forwardRef(Carousel);