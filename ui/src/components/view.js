import React, {forwardRef, useEffect, createRef, useImperativeHandle, useState} from "react";
import { v4 as uuidv4 } from 'uuid';
import Tab from "./tab";
import DataGrid from "./data-grid";
import Input from "./form/input";
import Select from "./form/select";
import RadioButton from "./form/radiobutton";
import CheckBox from "./form/checkbox";
import TextArea from "./form/textarea";
import Toggle from "./form/toggle";
import Search from "./search";
import Helper from "../utils/helper";
import SubView from "./sub-view"
import Text from "./form/text";
import Actions from "./actions";
import MultiSelect from "./multi-select";
import Media from './media';
import Image from "./factory/editor/image";
import Button from "./form/button";

const View = (props, ref) => {

    const handle = props.handle;    
    const _namespace = handle + "_";
    const columnRefs = {};
    const isSubView = ('isSubView' in props) ? props.isSubView : false;

    const contextObj = window._controller.getCurrentModuleInstance();

    let _preConfig = {...props.config};
    if (isSubView && contextObj && contextObj.beforeViewMount) {        
        _preConfig = contextObj.beforeViewMount(handle, _preConfig);
    }
    const config = _preConfig;

    let record = null;

    let caps = {
        get: true,
        post: false,
        delete: false,
        put: false,
        cancel: true
    };

    if (config.context) {
        caps = window._controller.getModuleCapability(config.context);
    }
    
    const renderView = () => {

        let rows = [];
        let custom = null;
        const sections = [];        

        /* Render Header Part */
        if (config.header.show) {
            if (Array.isArray(config.header.rows)) {
                for (let i = 0; i < config.header.rows.length; i++) {
                    rows.push(renderRow("header", i, config.header.rows[i]));
                }
                if (contextObj && contextObj.onViewSectionRendering) {
                    custom = contextObj.onViewSectionRendering(handle, config.header, "header");
                }
                if (custom && custom.component) {
                    if (custom.pos === "before") {
                        sections.push(<div key={uuidv4()} className="pharmarack-cms-view-header-section before">{custom.component}</div>);
                        sections.push(<div key={uuidv4()} className={`pharmarack-cms-view-header-section ${handle}`}>{rows}</div>);    
                    } else if (custom.pos === "after") {
                        sections.push(<div key={uuidv4()} className={`pharmarack-cms-view-header-section ${handle}`}>{rows}</div>);
                        sections.push(<div key={uuidv4()} className="pharmarack-cms-view-header-section after">{custom.component}</div>);
                    } else {
                        sections.push(<div key={uuidv4()} className="pharmarack-cms-view-header-section after">{custom.component}</div>);
                    }
                } else {
                    sections.push(<div key={uuidv4()} className={`pharmarack-cms-view-header-section ${handle}`}>{rows}</div>);
                }            
            } else if (config.header.actions) {
                sections.push(<Actions key={uuidv4()} config={config.header} type="header" />);
            }            
        }

        rows = [];
        custom = null;
        /* Render Content Part */        
        if (config.content.show) {
            for (let i = 0; i < config.content.rows.length; i++) {
                rows.push(renderRow("content", i, config.content.rows[i]));
            }
            if (contextObj && contextObj.onViewSectionRendering) {
                custom = contextObj.onViewSectionRendering(handle, config.content, "content");
            }
            if (custom && custom.component) {
                if (custom.pos === "before") {
                    sections.push(<div key={uuidv4()} className="pharmarack-cms-view-content-section before">{custom.component}</div>);
                    sections.push(<div key={uuidv4()} className={`pharmarack-cms-view-content-section ${handle}`}>{rows}</div>);    
                } else if (custom.pos === "after") {
                    sections.push(<div key={uuidv4()} className={`pharmarack-cms-view-content-section ${handle}`}>{rows}</div>);
                    sections.push(<div key={uuidv4()} className="pharmarack-cms-view-content-section after">{custom.component}</div>);
                } else {
                    sections.push(<div key={uuidv4()} className="pharmarack-cms-view-content-section after">{custom.component}</div>);
                }
            } else {
                sections.push(<div key={uuidv4()} className={`pharmarack-cms-view-content-section ${handle}`}>{rows}</div>);
            }
        }
        
        rows = [];
        custom = null;
        /* Render Footer Part */
        if (config.footer.show) {
            if (Array.isArray(config.footer.rows)) {
                for (let i = 0; i < config.footer.rows.length; i++) {
                    rows.push(renderRow("footer", i, config.footer.rows[i]));
                }
                if (contextObj && contextObj.onViewSectionRendering) {
                    custom = contextObj.onViewSectionRendering(handle, config.footer, "footer");
                }
                if (custom && custom.component) {
                    if (custom.pos === "before") {
                        sections.push(<div key={uuidv4()} className="pharmarack-cms-view-footer-section before">{custom.component}</div>);
                        sections.push(<div key={uuidv4()} className={`pharmarack-cms-view-footer-section ${handle}`}>{rows}</div>);    
                    } else if (custom.pos === "after") {
                        sections.push(<div key={uuidv4()} className={`pharmarack-cms-view-footer-section ${handle}`}>{rows}</div>);
                        sections.push(<div key={uuidv4()} className="pharmarack-cms-view-footer-section after">{custom.component}</div>);
                    } else {
                        sections.push(<div key={uuidv4()} className="pharmarack-cms-view-footer-section after">{custom.component}</div>);
                    }
                } else {
                    sections.push(<div key={uuidv4()} className={`pharmarack-cms-view-footer-section ${handle}`}>{rows}</div>);
                }
            } else if (config.footer.actions) {
                sections.push(<Actions key={uuidv4()} config={config.footer} type="header" />);
            }

        }

        if (config.sidebar) {            
            if (contextObj.config.views[config.sidebar]) {
                let cssProps = {
                    width: "250px"     
                };  
                const sideBarViewConfig = {...contextObj.config.views[config.sidebar]};
                if (sideBarViewConfig) {
                    
                    return (
                        <div className={`pharmarack-cms-view has-sidebar ${handle}`}>
                            <div className="flex-remaining-width">
                                {sections}
                            </div>
                            <div className="flex-align-right sidebar" style={cssProps}>                                
                                <SubView config={sideBarViewConfig} handle={config.sidebar} />
                            </div>
                        </div>
                    );
                    
                }
            }
        }

        return <div className={`pharmarack-cms-view ${handle}`}>{sections}</div>

    };

    const renderRow = (_section, _row, _config) => {
        let columns = [];
        for (let i = 0; i < _config.columns.length; i++) {
            columns.push(renderColumn(_section, _row, i, _config.columns[i]));
        }
        return <div key={uuidv4()} className="pharmarack-cms-view-row">{columns}</div>
    };

    const renderColumn = (_section, _row, _column, _config) => {

        let widget = null,
            titles = [],
            heading = [],
            custom = null;

        const sections = [];

        if (_config.type === "fields") {
            
            let fields = [];
            for (let i = 0; i < _config.fields.length; i++) {
                fields.push(renderField(_config.fields[i]));
            } 
            widget = fields; 

        } else if (_config.type === "datagrid") {                        
            
            const gridRef = React.createRef();
            widget = <DataGrid ref={gridRef} source="records" config={_config.datagrid} access={caps["get"]} />                       
            window._controller.registerField(_config.datagrid.handle, _config.type, gridRef);        

        } else if (_config.type === "tab") {
           
            const tabRef = React.createRef();            
            const childTabConfig = {..._config.tab};
            widget = <Tab ref={tabRef} config={childTabConfig} />
            window._controller.registerField(childTabConfig.handle, _config.type, tabRef);

        } else if (_config.type === "view") {

            if (_config.view) {                           
                const viewConfig = {...contextObj.config.views[_config.view]};
                widget = <SubView config={viewConfig} handle={_config.view} />;
            }            

        } else if (_config.type === "placeholder") {

            const holderRef = React.createRef();
            widget = <div ref={holderRef} id={_config.placeholder} className="pharmarack-cms-placeholder-container"></div>;
            window._controller.registerField(_config.placeholder, _config.type, holderRef);

        } else if (_config.type === "rows") {

            widget = [];
            for (let i = 0; i < _config.rows.length; i++) {
                widget.push(renderRow("sub-row", i, _config.rows[i]));
            }

        } else {
            /* Safe to ignore */
        }

        let cssProps = {
            width: _config.width     
        };        

        if (_config.title) {
            titles.push(<h3 key={uuidv4()}>{_config.title}</h3>);
        }
        if (_config.sub_title) {
            titles.push(<p key={uuidv4()}>{_config.sub_title}</p>);
        }
        if (titles.length > 0) {
            heading.push(<div key={uuidv4()} className="pharmarack-cms-view-column-title">{titles}</div>);
        }        

        if (contextObj && contextObj.onColumnSectionRendering) {
            custom = contextObj.onColumnSectionRendering(handle, _config, _section, _row, _column);
        }

        let collaps = null;
        const columnKey = uuidv4();
        const columnRef = React.createRef();

        if (_config.collapsible) {
            collaps = <a href="#" className="pharmarack-cms-col-collapse-btn" onClick={(e) => handleCollapseBtnClick(columnKey, _config)}><i className="fa fa-compress"></i></a>
        }

        if (custom && custom.component) {
            if (custom.pos === "before") {
                sections.push(custom.component);
                sections.push(<div ref={columnRef} key={columnKey} className={`pharmarack-cms-view-column ${_config.layout}`} style={cssProps}>{heading}{widget}{collaps}</div>);    
            } else if (custom.pos === "after") {
                sections.push(<div ref={columnRef} key={columnKey} className={`pharmarack-cms-view-column ${_config.layout}`} style={cssProps}>{heading}{widget}{collaps}</div>);    
                sections.push(custom.component);
            } else {                
                sections.push(custom.component);
            }
        } else {
            sections.push(<div  ref={columnRef}key={columnKey} className={`pharmarack-cms-view-column ${_config.layout}`} style={cssProps}>{heading}{widget}{collaps}</div>);    
        }

        columnRefs[columnKey] = columnRef;
       
        return sections;
       
    };

    const renderField = (_config) => {
                
        let field = null;        
        const fieldRef = React.createRef();
        
        if (_config.type === "text" || _config.type === "password" || _config.type === "number" || _config.type === "date" ||  _config.type === "email" || _config.type === "time" || _config.type === "week" || _config.type === "datetime-local" || _config.type === "color" || _config.type === "month" || _config.type === "file") {
            field = <Input ref={fieldRef} namespace={_namespace} config={_config} />
        } else if (_config.type === "select") {
            field = <Select ref={fieldRef} namespace={_namespace} config={_config} />
        } else if (_config.type === "check") {  
            field = <CheckBox ref={fieldRef} namespace={_namespace} config={_config} />
        } else if (_config.type === "radio") {
            field = <RadioButton ref={fieldRef} namespace={_namespace} config={_config} />
        } else if (_config.type === "textarea") {
            field = <TextArea ref={fieldRef} namespace={_namespace} config={_config} />
        } else if (_config.type === "toggle") {
            field = <Toggle ref={fieldRef} namespace={_namespace} config={_config} />
        } else if (_config.type === "search") {
            field = <Search ref={fieldRef} namespace={_namespace} config={_config} />
        } else if (_config.type === "label") {
            field = <Text ref={fieldRef} namespace={_namespace} config={_config} />
        } else if (_config.type === "multiselect") {
            field = <MultiSelect ref={fieldRef} namespace={_namespace} config={_config} />
        } else if (_config.type === "image") {            
            field = <Image ref={fieldRef} namespace={_namespace} config={_config} />
        } else if (_config.type === "button") {            
            field = <Button ref={fieldRef} namespace={_namespace} config={_config} />
        } else if (_config.type === "media") {
            field = <Media ref={fieldRef} namespace={_namespace} config={_config} />
        } else if (_config.type === "view") {
            if (_config.value && contextObj.config.views[_config.value]) {                           
                const viewConfig = {...contextObj.config.views[_config.value]};
                field = <SubView config={viewConfig} handle={_config.value} />;
            }
        } else if (_config.type === "placeholder") {

            const holderRef = React.createRef();
            field = <div ref={holderRef} id={_config.placeholder} className="pharmarack-cms-placeholder-container"></div>;
            window._controller.registerField(_config.placeholder, _config.type, holderRef);

        }

        window._controller.registerField((_namespace + _config.handle), _config.type, fieldRef);                
        return buildWrapper(_config, field);   

    };

    const buildWrapper = (_config, _field) => {

        if (_config.type == "button") {
            return _field;
        }

        if (_config.label) {
            return (
                <div key={uuidv4()} className={`pharmarack-cms-form-field-wrapper ${_config.handle}`}>
                    <div className={`pharmarack-cms-form-field-wrap ${_config.label_position} ${_config.type}`}>
                        <div>
                            <label className={`pharmarack-cms-form-field-label ${ _config.mandatory ? "required" : "" }`} dangerouslySetInnerHTML={{ __html: _config.label }}></label>
                        </div>
                        <div>
                        {_field}
                        <p className="pharmarack-cms-form-error-message">{_config.validation_message}</p>
                        </div>
                    </div>
    
                </div>
            );
        } else {
            return (
                <div key={uuidv4()} className={`pharmarack-cms-form-field-wrapper ${_config.handle}`}>
                    <div className={`pharmarack-cms-form-field-wrap ${_config.label_position}`}>                        
                        <div>
                        {_field}
                        <p className="pharmarack-cms-form-error-message">{_config.validation_message}</p>
                        </div>
                    </div>
    
                </div>
            );
        }

    };

    const handleCollapseBtnClick = (_columnKey, _config) => {

        if (columnRefs[_columnKey].current) {

            if (columnRefs[_columnKey].current.style.width === '0px') {
                columnRefs[_columnKey].current.style.width = _config.width;
                columnRefs[_columnKey].current.className = "pharmarack-cms-view-column "+ _config.layout;
            } else {
                columnRefs[_columnKey].current.style.width = '0px';
                columnRefs[_columnKey].current.className = "pharmarack-cms-view-column collapsed "+ _config.layout;
            }
            
        }

    };

    const self =  {

        getRecord: () => record,
        setFormFields: (_payload) => {

            record = _payload;

            if (config.header.show && config.header.rows) {
                Helper.setFieldValues(_namespace, config.header.rows, _payload);
            }
            if (config.content.show && config.content.rows) {
                Helper.setFieldValues(_namespace, config.content.rows, _payload);
            }
            if (config.footer.show && config.footer.rows) {
                Helper.setFieldValues(_namespace, config.footer.rows, _payload);
            }

        },
        getFormFields: (_payload) => {

            let fieldValues = {}, payload = {};            
            
            if (config.header.show && config.header.rows) {
                fieldValues = Helper.getFieldValues(_namespace, config.header.rows);
                payload = {...payload, ...fieldValues}                                   
            }
            if (config.content.show && config.content.rows) {
                fieldValues = Helper.getFieldValues(_namespace, config.content.rows);
                payload = {...payload, ...fieldValues}                                   
            }
            if (config.footer.show && config.footer.rows) {
                fieldValues = Helper.getFieldValues(_namespace, config.footer.rows);
                payload = {...payload, ...fieldValues}                                   
            }

            return payload;

        },
        resetFormFields: () => {

            let res = true;
            const contextObj = window._controller.getCurrentModuleInstance();  
            
            if (contextObj.onResetView) {
                res = contextObj.onResetView(handle);
            }

            if (!res) {
                return;
            }
            
            if (config.header.show && config.header.rows) {
                Helper.resetForm(_namespace, config.header.rows);
            }
            if (config.content.show && config.content.rows) {
                Helper.resetForm(_namespace, config.content.rows);
            }
            if (config.footer.show && config.footer.rows) {
                Helper.resetForm(_namespace, config.footer.rows);
            }

        },
        setViewConfig: (_config) => {
            setConfig({..._config});
        },
        getViewConfig: () => config

    };

    /* Expose the component to the consumer */
    useImperativeHandle(ref, () => self);

    useEffect(() => {
        
        const contextObj = window._controller.getCurrentModuleInstance();
        if (contextObj) {
            if (config.manage) {
                const viewForm = window._controller.getField(handle);
                if (viewForm) { 
                    const record = contextObj.currentRecord[contextObj.currentGrid];
                    if (record) {                
                        viewForm.setFormFields(record);
                    } else {
                        viewForm.resetFormFields();                
                    }
                }
            }

            if (contextObj.onViewMounted) {
                contextObj.onViewMounted(handle);
            }            
        }

        if (!isSubView && config.context_header.show) {

                const currentRecord = contextObj.currentRecord[contextObj.mainGrid];
                let breadcrumb = "";
                let title = config.context_header.title;            

                if (config.context_header.breadcrumb) {   
                    /* This means it should nbe single record view */             
                    title += currentRecord ? " / " : " - [New]";
                    if (currentRecord && currentRecord[config.context_header.breadcrumb]) {
                        breadcrumb = currentRecord[config.context_header.breadcrumb];
                    }
                }
                window._controller.loadContextBar(title, breadcrumb, config.context_header.actions);

        } else {
            if (!isSubView) {
                window._controller.loadContextBar("", "", []);            
            }
        }

    }, [handle]);  

    return renderView();

};

export default forwardRef(View);