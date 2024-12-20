import React, {useState, useEffect, forwardRef, useImperativeHandle} from "react";
import { v4 as uuidv4 } from 'uuid';
import DataGrid from "./data-grid";
import Input from "./form/input";
import Select from "./form/select";
import RadioButton from "./form/radiobutton";
import CheckBox from "./form/checkbox";
import TextArea from "./form/textarea";
import Actions from "./actions";
import Toggle from "./form/toggle";
import Search from "./search";
import Helper from "../utils/helper";
import SubView from "./sub-view"
import Text from "./form/text";
import MultiSelect from "./multi-select";
import Media from './media';
import Image from "./factory/editor/image";
import Button from "./form/button";

const Tab = (props, ref) => {
 
    const handle = props.config.handle;    
    const _namespace = props.config.handle +"_";
    const contextObj = window._controller.getCurrentModuleInstance(); 

    const [state, setState] = useState({
        config: {...props.config},  
        currentView: null,
        currentViewMode: "archive",
        lastActive: props.config.default_tab,
        capability: { get: true, post: false, delete: false, put: false } 
    });
    
    const handleTabItemClick = (_currentView) => {         
        window._controller.snapshot.tabs[handle] = _currentView;  
        if (contextObj && contextObj.beforeTabViewSwitch) {
            if (contextObj.beforeTabViewSwitch(state.config.handle, state.config.currentView, _currentView)) {
                setState({
                    ...state, 
                    currentView: _currentView, 
                    lastActive: _currentView,
                    capability: window._controller.getModuleCapability(state.config.items[_currentView].context)
                });                 
            }                
        } else {
            setState({
                ...state, 
                currentView: _currentView, 
                lastActive: _currentView,
                capability: window._controller.getModuleCapability(state.config.items[_currentView].context)
            }); 
        }         
    };       

    const renderTabBody = () => { 

        let rows = [];
        const sections = [];             
        let tabConfig = state.config.items[state.currentView]; 

        /* Render Header Part */
        if (tabConfig.header.show) {            
            sections.push(<Actions key={uuidv4()} context={tabConfig.context} config={tabConfig.header} type="header" />);
        }

        rows = [];
        /* Render Content Part */        
        if (tabConfig.content.show) {
            for (let i = 0; i < tabConfig.content.rows.length; i++) {
                rows.push(renderRow(tabConfig.content.rows[i]));
            }
            sections.push(<div key={uuidv4()} className="pharmarack-cms-tab-content-section">{rows}</div>);
        }

        /* Render Footer Part */
        rows = [];
        if (tabConfig.footer.show) {            
            sections.push(<Actions key={uuidv4()} context={tabConfig.context} config={tabConfig.footer} type="footer" />);
        }

        let cssProps = {
            width: "100%"        
        };

        if (state.config.type === "fixed") {
            cssProps = {
                width: state.config.width       
            };
        }

        return <div key={uuidv4()} className={`pharmarack-cms-tab-body ${state.currentView}`} id={state.config.content_div} style={cssProps}>{sections}</div>

    };

    const renderRow = (_config) => {

        if (!_config.columns) {
            return <></>;
        }

        let columns = [];
        for (let i = 0; i < _config.columns.length; i++) {
            columns.push(renderColumn(_config.columns[i]));
        }

        return <div key={uuidv4()} className="pharmarack-cms-tab-row">{columns}</div>

    };

    const renderColumn = (_config) => {
        
        let widget = null,
            titles = [],
            heading = [],
            custom = null;

        if (_config.type === "fields") {
            
            let fields = [];
            for (let i = 0; i < _config.fields.length; i++) {
                fields.push(renderField(_config.fields[i]));
            } 
            widget = <div className="fields-wrapper">{fields}</div>           

        } else if (_config.type === "datagrid") {            
            
            let gridRef = React.createRef();
            widget = <DataGrid ref={gridRef} source="records" config={_config.datagrid} access={state.capability["get"]} />                       
            window._controller.registerField(_config.datagrid.handle, _config.type, gridRef);   

        } else if (_config.type === "rows") {

            widget = [];
            for (let i = 0; i < _config.rows.length; i++) {
                widget.push(renderRow(_config.rows[i]));
            }

        } else if (_config.type === "placeholder") {

            const holderRef = React.createRef();
            widget = <div ref={holderRef} id={_config.placeholder} className="pharmarack-cms-placeholder-container"></div>;
            window._controller.registerField(_config.placeholder, _config.type, holderRef);

        } else if (_config.type === "view") {

            if (_config.view) {                           
                const viewConfig = {...contextObj.config.views[_config.view]};
                widget = <SubView config={viewConfig} handle={_config.view} />;
            }            

        } else if (_config.type === "tab") {            
            /* Nested tab not yet supported */
        } else {
            /* Safe to ignore */
        }

        let cssProps = {width: _config.width};

        if (_config.title) {
            titles.push(<h3 key={uuidv4()}>{_config.title}</h3>);
        }
        if (_config.sub_title) {
            titles.push(<p key={uuidv4()}>{_config.sub_title}</p>);
        }
        if (titles.length > 0) {
            heading.push(<div key={uuidv4()} className="pharmarack-cms-view-column-title">{titles}</div>);
        }        

        if (widget) {            
            return <div key={uuidv4()} className="pharmarack-cms-tab-column" style={cssProps}>{heading}{widget}</div>
        } else {
            return null;
        }
        
    };

    const renderField = (_config) => {
                
        let field = null;        
        let fieldRef = React.createRef();


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
            field = <MultiSelect ref={fieldRef} namespace={_namespace} config={_config} original={_config.original ? _config.original : []} />
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

        if (_config.label) {
            return (
                <div key={uuidv4()} className={`pharmarack-cms-form-field-wrapper ${_config.handle}`}>
                    <div className={`pharmarack-cms-form-field-wrap ${_config.label_position}`}>
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


    const renderTabItems = (_view, _config) => {

        let classes = "";

        if (state.config.items[state.currentView].custom) {
            if (state.lastActive === _view) {
                classes = "active";
            }
        } else {
            if (state.currentView === _view) {
                classes = "active";
            }
        }
        
        let btnText = [];
        if (_config.icon !== "") {
            btnText.push(<i key={"i_"+_view} className={_config.icon}></i>);
        }
        btnText.push(<span key={"span_"+_view}>{_config.title}</span>);        
        return <button key={_view} className={classes} onClick={() => handleTabItemClick(_view)}>{btnText}</button>

    };

    const prepareTabItems = () => {

        if (state.config.tabview) {
            let tabHeaders = [];
            const itemKeys = Object.keys(state.config.items);
            for (let i = 0; i < itemKeys.length; i++) {
                if (!state.config.items[itemKeys[i]].custom) {
                    tabHeaders.push(renderTabItems(itemKeys[i], state.config.items[itemKeys[i]]));
                }                
            }
            return <div key={uuidv4()} className="pharmarack-cms-tab-header">{tabHeaders}</div>
        } else {
            return <></>;
        }  

    };

    const renderTabTopLeftLayout = () => {

        let sections = [];
        if (state.config.tabview) {
            sections.push(prepareTabItems());
        }
        sections.push(renderTabBody());
        return <div key={uuidv4()} className={`pharmarack-cms-tab ${state.config.position} ${handle}`}>{sections}</div>

    };

    const renderTabBottomRightLayout = () => {

        let sections = [];
        sections.push(renderTabBody());
        if (state.config.tabview) {
            sections.push(prepareTabItems());
        }        
        return <div key={uuidv4()} className={`pharmarack-cms-tab ${state.config.position}`}>{sections}</div>

    };

    const renderTab = () => {

        if (!state.config || !state.currentView) {
            return null;
        }                 

        if (state.currentView) {
            if (state.config.position === "top" || state.config.position === "left") {
                return renderTabTopLeftLayout();
            } else {
                return renderTabBottomRightLayout();
            }
        } else {
            return <></>;
        }
        
    };
    
    const self =  { 

        init: () => {
            if (contextObj && contextObj.beforeTabViewSwitch) {
                if (contextObj.beforeTabViewSwitch(state.config.handle, null, state.config.default_tab)) {
                    setState({...state, currentView: state.config.default_tab});
                }                
            } else {
                setState({...state, currentView: state.config.default_tab});
            }           
        },        
        switchTab: (_view) => {   
            if (state.config.items[_view]) {
                setState({...state, currentView: _view});
            } else {
                console.error("Unkown tab view : "+ _view);
            }
        },
        setFormFields: (_payload) => {

            const _namespace = state.config.handle + "_";
            const tabConfig = state.config.items[state.currentView];

            if (tabConfig.header.show && tabConfig.header.rows) {
                Helper.setFieldValues(_namespace, tabConfig.header.rows, _payload);
            }
            if (tabConfig.content.show && tabConfig.content.rows) {
                Helper.setFieldValues(_namespace, tabConfig.content.rows, _payload);
            }
            if (tabConfig.footer.show && tabConfig.footer.rows) {
                Helper.setFieldValues(_namespace, tabConfig.footer.rows, _payload);
            }

        },
        getFormFields: () => {

            let fieldValues = {}, payload = {};
            const _namespace = state.config.handle + "_";
            const tabConfig = state.config.items[state.currentView];             

            if (tabConfig.header.show && tabConfig.header.rows) {
                fieldValues = Helper.getFieldValues(_namespace, tabConfig.header.rows);
                payload = {...payload, ...fieldValues}                                   
            }
            if (tabConfig.content.show && tabConfig.content.rows) {
                fieldValues = Helper.getFieldValues(_namespace, tabConfig.content.rows);
                payload = {...payload, ...fieldValues}                                   
            }
            if (tabConfig.footer.show && tabConfig.footer.rows) {
                fieldValues = Helper.getFieldValues(_namespace, tabConfig.footer.rows);
                payload = {...payload, ...fieldValues}                                   
            }

            return payload;

        },
        resetFormFields: () => {

            const res = true;
            const _namespace = state.config.handle + "_";                          
            
            if (contextObj.onResetTabView) {
                res = contextObj.onResetTabView(state.config.handle, state.currentView);
            }

            if (!res) {
                return;
            }

            const tabConfig = state.config.items[state.currentView];
            if (tabConfig.header.show && tabConfig.header.rows) {
                Helper.resetForm(_namespace, tabConfig.header.rows);
            }
            if (tabConfig.content.show && tabConfig.content.rows) {
                Helper.resetForm(_namespace, tabConfig.content.rows);
            }
            if (tabConfig.footer.show && tabConfig.footer.rows) {
                Helper.resetForm(_namespace, tabConfig.footer.rows);
            }

        }

    };
        
    /* Expose the component to the consumer */
    useImperativeHandle(ref, () => self);

    useEffect(() => {       
        if (contextObj && contextObj.onTabViewMounted && state && state.currentView) {                        
            contextObj.onTabViewMounted(state.config.handle, state.currentView);
        }
    }, [state]);
    
    useEffect(() => {        
        window._controller.snapshot.tabs[handle] = state.config.default_tab;
        window._controller.onTabMount(state.config.handle, state.config.default_tab);
    }, []);    

    return renderTab();

}

export default forwardRef(Tab);