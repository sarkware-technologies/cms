import React, {useState, useEffect, forwardRef, useImperativeHandle, memo} from "react";
import { v4 as uuidv4 } from 'uuid';
import StringFieldConfig from "./string-config";
import NumberFieldConfig from "./number-config"
import BooleanFieldConfig from "./boolean-config";
import DateFieldConfig from "./date-config";
import ObjectIdFieldConfig from "./object-id-config";
import ArrayFieldConfig from "./array-config";
import BigIntConfig from "./bigint-config";
import MixedConfig from "./mixed-config";

const FieldEditor = (props, ref) => {

    const [state, setState] = useState({
        currentField: null,        
        records: [],
        currentPage: 1,
        currentRecord: {},
        totalPages: 0,       
        recordsPerPage: 5
    });

    const fieldsEnum = {
        "1": "String",
        "2": "Number",
        "3": "Date",    
        "4": "Boolean",    
        "5": "ObjectId",
        "6": "Array",        
        "7": "BigInt",
        "8": "Mixed"
    };

    const typeSelect = React.createRef();
    const titleInput = React.createRef();
    const handleInput = React.createRef();

    const self = {        
        getConfig: () => state,
        setConfig: (_state) => setState({..._state})
    };

    /* Expose the component to the consumer */
    useImperativeHandle(ref, () => self);

    const getIcon = (_type) => {

        if (fieldsEnum[_type] === "String") {
            return "far fa-input-text";
        } else if (fieldsEnum[_type] === "Number") {
            return "far fa-input-numeric";
        } else if (fieldsEnum[_type] === "Boolean") {
            return "far fa-toggle-on";
        } else if (fieldsEnum[_type] === "Date") {
            return "far fa-calendar";
        } else if (fieldsEnum[_type] === "ObjectId") {            
            return "far fa-link";
        } else if (fieldsEnum[_type] === "Array") {
            return "far fa-brackets-square";
        } else if (fieldsEnum[_type] === "BigInt") {
            return "far fa-money";
        } else if (fieldsEnum[_type] === "Mixed") {
            return "far fa-brackets-curly";
        } else {
            /* Safe to ignore */
        }

    };

    const fetchFields = () => {
        
        const request = {
            method: "GET",
            endpoint: "/system/v1/entity/"+ props.record._id +"/fields?page="+ state.currentPage
        };    
        
        window._controller.docker.dock(request).then((_res) => {
            setState((prevState) => ({
                    ...prevState, 
                    records: _res.payload,
                    currentPage: _res.currentPage,                    
                    totalPages:  _res.totalPages,       
                    recordsPerPage:  _res.recordPerPage
                }
            )); 
        })
        .catch((e) => {
            window._controller.notify("Failed to fetch fields.!", "error");
        });        

    };

    const onConfigCancelBtnClick = (_e) => {
        setState((prevState) => ({...prevState, currentField: null}));
    }

    const onConfigUpdateBtnClick = (_config, _state) => {

        const payload = {}; 
        const options = {};  

        payload["required"] = _state.required;        
        payload["unique"] = _state.unique;

        options["default"] = _state.default;   

        if (fieldsEnum[_config.type] === "String") {            
            options["lowercase"] = _state.lowercase;
            options["uppercase"] = _state.uppercase;
            options["trim"] = _state.trim;
            options["match"] = _state.match;
            options["enum"] = _state.enum;
            options["minLength"] = _state.minLength;
            options["maxLength"] = _state.maxLength;
        } else if (fieldsEnum[_config.type] === "Number" || fieldsEnum[_config.type] === "Date") {
            options["min"] = _state.min;
            options["max"] = _state.max;
        } else if (fieldsEnum[_config.type] === "ObjectId") {
            options["entity"] = _state.entity;
        } else if (fieldsEnum[_config.type] === "Array") {
            options["itemType"] = _state.itemType;
            options["itemTarget"] = _state.itemTarget;
        } else {
            /*  */
        }

        payload["options"] = JSON.stringify(options);

        const request = {};                   
        /* It's a new record */
        request["method"] = "PUT";
        request["endpoint"] = "/system/v1/field/"+ _config._id;            
        request["payload"] = payload;

        window._controller.docker.dock(request).then((_res) => {
            window._controller.notify("Updated successfully.!"); 
            fetchFields();
        })
        .catch((e) => {
            window._controller.notify("Failed to update.!", "error");
        });  

    }

    const configRemoveBtnClick = (_id) => {

        const request = {};                   
        /* It's a new record */
        request["method"] = "DELETE";
        request["endpoint"] = "/system/v1/field/"+ _id;   
        
        window._controller.docker.dock(request).then((_res) => {
            window._controller.notify("Removed successfully.!"); 
            fetchFields();
        })
        .catch((e) => {
            window._controller.notify("Failed to remove.!", "error");
        });        

    }

    const handleFieldNameClick = (_e, _record) => {
        _e.preventDefault();
        if (_record._id === state.currentField) {
            setState((prevState) => ({...prevState, currentField: null}));
        } else {
            setState((prevState) => ({...prevState, currentField: _record._id}));
        } 
    };

    const handleFieldToggleChange = (_e, _property, _record) => {

        const _fields = state.records;
        for (let i = 0; i < _fields.length; i++) {

            if (_fields[i]._id === _record._id) {
                _fields[i][_property] = _e.target.checked;
                setState((prevState) => ({...prevState, fields: _fields}));
                break;
            }
        }

        const request = {};
        request["method"] = "PUT";
        request["endpoint"] = "/system/v1/field/"+ _record._id;
        request["payload"] = {};                        
        request["payload"][_property] = _e.target.checked;

        window._controller.docker.dock(request).then((_res) => {
            if (_property === "status") {
                window._controller.notify( _record.title + (_e.target.checked ? " enabled successfully" : " disabled successfully"));                                
            } else {
                window._controller.notify( _record.title +" unique option" + (_e.target.checked ? " enabled successfully" : " disabled successfully"));                                
            } 
        })
        .catch((e) => {
            window._controller.notify(_record.title + " failed to update.!", "error");
        });

    };

    const handleConfigView = (_record) => {

        if (state.currentField === _record._id) {

            let options = {};

            if (_record.options) {
                if (typeof _record.options === 'string') {
                    try {
                        options = JSON.parse(_record.options)
                    } catch (_e) {                     
                        options = {};
                    }
                }
            }

            if (fieldsEnum[_record.type] === "String") {
                
                _record["default"] = ('default' in options) ? options.default : "";
                _record["lowercase"] = ('lowercase' in options) ? options.lowercase : false;
                _record["uppercase"] = ('uppercase' in options) ? options.uppercase : false;
                _record["trim"] = ('trim' in options) ? options.trim : false;
                _record["match"] = ('match' in options) ? options.match : "";
                _record["enum"] = ('enum' in options) ? options.enum : "";
                _record["minLength"] = ('minLength' in options) ? options.minLength : -1;
                _record["maxLength"] = ('maxLength' in options) ? options.maxLength : -1;

                return <StringFieldConfig config={_record} configCancelAction={onConfigCancelBtnClick} configUpdateAction={onConfigUpdateBtnClick} configRemoveAction={configRemoveBtnClick} />;
                
            } else if (fieldsEnum[_record.type] === "Number") {
                
                _record["min"] = ('min' in options) ? options.min : -1;
                _record["max"] = ('max' in options) ? options.max : -1;
                _record["default"] = ('default' in options) ? options.default : 0;

                return <NumberFieldConfig config={_record} configCancelAction={onConfigCancelBtnClick} configUpdateAction={onConfigUpdateBtnClick} configRemoveAction={configRemoveBtnClick} />

            } else if (fieldsEnum[_record.type] === "Boolean") {

                _record["default"] = ('default' in options) ? options.default : false;
                return <BooleanFieldConfig config={_record} configCancelAction={onConfigCancelBtnClick} configUpdateAction={onConfigUpdateBtnClick} configRemoveAction={configRemoveBtnClick} />

            } else if (fieldsEnum[_record.type] === "Date") {

                _record["min"] = ('min' in options) ? options.min : -1;
                _record["max"] = ('max' in options) ? options.max : -1;
                _record["default"] = ('default' in options) ? options.default : null;

                return <DateFieldConfig config={_record} configCancelAction={onConfigCancelBtnClick} configUpdateAction={onConfigUpdateBtnClick} configRemoveAction={configRemoveBtnClick} />

            } else if (fieldsEnum[_record.type] === "ObjectId") {

                _record["entity"] = ('entity' in options) ? options.entity : null;
                _record["default"] = ('default' in options) ? options.default : null;

                return <ObjectIdFieldConfig config={_record} configCancelAction={onConfigCancelBtnClick} configUpdateAction={onConfigUpdateBtnClick} configRemoveAction={configRemoveBtnClick} />

            } else if (fieldsEnum[_record.type] === "Array") {

                _record["default"] = ('default' in options) ? options.default : [];
                _record["itemType"] = ('itemType' in options) ? options.itemType : "";
                _record["itemTarget"] = ('itemTarget' in options) ? options.itemTarget : null;

                return <ArrayFieldConfig config={_record} configCancelAction={onConfigCancelBtnClick} configUpdateAction={onConfigUpdateBtnClick} configRemoveAction={configRemoveBtnClick} />

            } else if (fieldsEnum[_record.type] === "BigInt") {

                _record["default"] = ('default' in options) ? options.default : 0;
                return <BigIntConfig config={_record} configCancelAction={onConfigCancelBtnClick} configUpdateAction={onConfigUpdateBtnClick} configRemoveAction={configRemoveBtnClick} />

            } else if (fieldsEnum[_record.type] === "Mixed") {

                _record["default"] = ('default' in options) ? options.default : {};
                return <MixedConfig config={_record} configCancelAction={onConfigCancelBtnClick} configUpdateAction={onConfigUpdateBtnClick} configRemoveAction={configRemoveBtnClick} />

            } else {
                /* Safe to ignore */
            }
        }

    };

    const handleNameChange = (_e) => {
        handleInput.current.value = _e.target.value.replace(/\s+/g, '_').toLowerCase();
    };

    const handleNewFieldClick = (_e) => {

        const handle = handleInput.current.value;
        const name = titleInput.current.value;

        if (name) {

            const request = {};                   
            /* It's a new record */
            request["method"] = "POST";
            request["endpoint"] = "/system/v1/field";            

            request["payload"] = {};
            request["payload"]["type"] = typeSelect.current.value; 
            request["payload"]["title"] = name;                         
            request["payload"]["handle"] = handle;                         
            request["payload"]["entity"] = props.record._id;

            window._controller.docker.dock(request).then((_res) => {
                window._controller.notify(request["payload"].handle + " saved successfully.!"); 
                fetchFields();
                titleInput.current.value = "";
                handleInput.current.value = "";
            })
            .catch((e) => {
                window._controller.notify(request["payload"].handle + " failed to save.!", "error");
            });

        }

    };

    const RenderField = (props) => {

        return (
            <>
                <tr className="field-record-header">
                    <td><label>{props.sno}</label></td>
                    <td><a href="#" onClick={(_e) => handleFieldNameClick(_e, props.record)}>{props.record.handle}</a></td>
                    <td><label><i className={getIcon(props.record.type)}></i> {fieldsEnum[props.record.type]}</label></td>
                    <td>
                        <div className="toggle-container">
                            <label className="pharmarack-cms-toggle-switch">
                                <input type="checkbox" className="pharmarack-cms-toggle-field unique" onChange={(_e) => handleFieldToggleChange(_e, "unique", props.record)} checked={props.record.unique} />
                                <span className="pharmarack-cms-toggle-slider"></span>
                            </label>            
                        </div>
                    </td>
                    <td>
                        <div className="toggle-container">
                            <label className="pharmarack-cms-toggle-switch">
                                <input type="checkbox" className="pharmarack-cms-toggle-field status" onChange={(_e) => handleFieldToggleChange(_e, "status", props.record)} checked={props.record.status} />
                                <span className="pharmarack-cms-toggle-slider"></span>
                            </label>            
                        </div>  
                    </td>
                </tr>
                <tr className="field-record-config"><td colSpan="5">{handleConfigView(props.record)}</td></tr>   
            </>         
        );

    }

    const renderFields = () => {
        if (state.records.length > 0) {
            return state.records.map((_item, _index) => <RenderField key={uuidv4()} record={_item} sno={((_index + 1) + ((state.currentPage - 1) * state.recordsPerPage))} />);
        } else {
            return <tr><td colSpan="5" key={uuidv4()} className="pharmarack-cms-fields-empty-msg">Entity has no fields</td></tr>;
        }        
    };

    const handlePageClick = (_e, _page) => {

        _e.preventDefault(); 
        _e.stopPropagation();      

        let _currentPage = state.currentPage;

        if (_page === "PREV") {
            _currentPage = _currentPage - 1;            
        } else if (_page === "NEXT") {
            _currentPage = _currentPage + 1;            
        } else if (_page === "FIRST") {
            _currentPage = 1; 
        } else if (_page === "LAST") {
            _currentPage = state.totalPages; 
        } else {
            _currentPage = _page;            
        } 
        
        setState((prevState) => ({...prevState, currentPage: _currentPage}));            
        
    };

    const Paginator = () => {
        
        const pages = []; 
        let disableClass, currentPageClass; 
        
        const maxPagesToShow = 11;
        const halfMaxPagesToShow = Math.floor(maxPagesToShow / 2);

        let startPage = Math.max(state.currentPage - halfMaxPagesToShow, 0);
        let endPage = Math.min(state.currentPage + halfMaxPagesToShow, state.totalPages);

        if (endPage - startPage + 1 < maxPagesToShow) {
            if (state.currentPage <= halfMaxPagesToShow) {
                endPage = maxPagesToShow;
            } else {
                if (state.totalPages <= (maxPagesToShow + 1)) {
                    startPage = 1;
                } else {
                    startPage = state.totalPages - maxPagesToShow + 1;
                }                
            }
        }

        if (endPage > state.totalPages) {
            endPage = state.totalPages;
        }

        if (state.totalPages && state.totalPages > 1) {

            disableClass = (state.currentPage === 1) ? "disable" : "";        
            pages.push(<a key="first" href="FIRST" className={disableClass} onClick={(e) => handlePageClick(e, "FIRST")} ><i className="far fa-chevrons-left"></i></a>);
            pages.push(<a key="prev" href="PREV" className={disableClass} onClick={(e) => handlePageClick(e, "PREV")} ><i className="far fa-chevron-left"></i></a>);

            for (let i = startPage; i < endPage; i++) {
                currentPageClass = (i === (state.currentPage - 1)) ? "current" : "";
                pages.push(<a key={i} href={i} className={currentPageClass} onClick={(e) => handlePageClick(e, (i + 1))} >{(i + 1)}</a>);
            }

            disableClass = (state.currentPage === state.totalPages) ? "disable" : "";        
            pages.push(<a key="next" href="NEXT" className={disableClass} onClick={(e) => handlePageClick(e, "NEXT")} ><i className="far fa-chevron-right"></i></a>);
            pages.push(<a key="last" href="LAST" className={disableClass} onClick={(e) => handlePageClick(e, "LAST")} ><i className="far fa-chevrons-right"></i></a>);

            return <div className={`pharmarack-cms-data-table-paginator ${state.progress ? "disabled" : ""}`}>{pages}</div>;

        }

        return null;

    };

    useEffect(() => {            
        fetchFields();
    }, []);

    useEffect(() => {            
        fetchFields();
    }, [state.currentPage]);

    return (
        <div className="pharmarack-cms-field-editor">

            <h1>Fields Configuration</h1>

            <table className="pharmarack-cms-field-editor-factory-table">
                <tbody>
                    <tr>
                        <th className="type">
                            <label>Type</label>
                            <select ref={typeSelect} >
                                <option value="1">String</option>
                                <option value="2">Number</option>
                                <option value="3">Date</option>
                                <option value="4">Boolean</option>                        
                                <option value="5">ObjectId</option>
                                <option value="6">Arrays</option>   
                                <option value="7">Big Int</option>   
                                <option value="8">Mixed</option>                                                                            
                            </select>                    
                        </th>
                        <th className="title">
                            <label>Title</label>
                            <input ref={titleInput} onChange={handleNameChange} type="text" />
                        </th>
                        <th className="handle">
                            <label>Handle</label>
                            <input ref={handleInput} type="text" />
                        </th>
                        <th className="action">
                            <button className="pharmarack-cms-btn icon-left primary" onClick={handleNewFieldClick} ><i className="far fa-plus"></i> Add Field</button>
                        </th>
                    </tr>
                </tbody>
            </table>

            <table className="pharmarack-cms-field-editor-record-table">
                <thead>
                    <tr>
                        <th className="sno">S.No</th>
                        <th className="handle">Handle</th>
                        <th className="type">Type</th>
                        <th className="unique">Unique</th>
                        <th className="status">Status</th>
                    </tr>
                </thead>
                <tbody>{renderFields()}</tbody>                
            </table>

            <Paginator />

        </div>
    );

};

export default forwardRef(FieldEditor);