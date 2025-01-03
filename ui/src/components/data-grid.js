/**
 * 
 * @author      : Sark
 * @version     : 1.0.0
 * @description : Data grid module, responsible for rendering record list view
 *                Supported features - searchable, filterable, sortable & bulk edit.
 *                It's a part of Fields Factory platform - (specifically designed)
 * 
 */

import { v4 as uuidv4 } from 'uuid';
import React, {useState, useEffect, forwardRef, useRef, memo, useImperativeHandle} from "react";
import { useNavigate } from "react-router-dom";

/**
 *
 * Header cell component
 *
 */
const HeaderCell = ({ 
    config, 
    lastSearch, 
    lastFilter,
    handleSearch, 
    handleSearchClick, 
    handleSearchBlur, 
    handleFilterClick, 
    handleSeedCheck, 
    handleFilterBlur,
    handleCheckAllRecord,
    getDataSource }) => {
        
    const cssProperties = {
        width: (config.width + "%"),
        textAlign: config.header.align                        
    };
    
    let widget = config.header.title;

    const [searchVisible, setSearchVisible] = useState(false);
    const searchInputRef = useRef(null);

    /**
     * 
     * Used to set focus on search box
     * 
     */
    useEffect(() => {
        if (searchVisible && searchInputRef.current) {                        
            searchInputRef.current.defaultValue = lastSearch;
            searchInputRef.current.focus();            
        }
    }, [searchVisible]);

    /**
     * 
     * Handler for search button click event
     * Which eventualy makes the search box appear on the header
     * 
     */
    const handleSearchButtonClick = (_e) => {
        setSearchVisible(true);
        handleSearchClick(_e, config);
    };

    const handleSearchBoxBlur = (_e) => {
        //setSearchVisible(false);
        //handleSearchBlur(_e, config);
    };

    if (config.header.searchable) { 

        /* Add search button */

        if (config.search) {
            /* This means the user has clicked the search button, hence rendering the search box */
            widget = <div className="pharmarack-cms-header-search-box"><input ref={searchInputRef} type="text" className="pharmarack-cms-search-text" placeholder={config.header.placeholder} onBlur={(_e) => handleSearchBoxBlur(_e)} onChange={(_e) => handleSearch(_e)} /></div>;
        } else {
            /* Just render the search button */
            widget = <div className="pharmarack-cms-header-search-box"><span>{widget}</span><button onClick={(_e) => handleSearchButtonClick(_e)}><i className="fa fa-search"></i></button></div>;
        }

    } else if (config.header.filterable) {

        /* Add filter button */

        if (config.filter) {
            /* This means the user has clicked the filter button, hence rendering the filter box */
            widget = <FilterBox config={config} lastFilter={lastFilter} handleSeedCheck={handleSeedCheck} handleFilterBlur={handleFilterBlur} getDataSource={getDataSource} />
        } else {
            /* Just render the filter button */
            widget = <div className="pharmarack-cms-header-filter-box"><span>{widget}</span><button onClick={(_e) => handleFilterClick(_e, config)}><i className="fa fa-filter"></i></button></div>
        }
        
    } else if (config.field.type == "check") {
        widget = <input type="checkbox" onChange={(e) => handleCheckAllRecord(e)} />
    }

    

    return <th style={cssProperties}>{widget}</th>;

};

/**
 *
 * Header row component
 *
 */
const TableHeader =  memo(({ headers, lastSearch, lastFilter, handleSearch, handleSearchClick, handleSearchBlur, handleFilterClick, handleSeedCheck, handleFilterBlur, handleCheckAllRecord, getDataSource }) => {        

    return (
        <thead><tr>{
            headers.map((item, index) => {
                return <HeaderCell 
                    key={index} 
                    config={item} 
                    lastSearch={lastSearch}
                    lastFilter={lastFilter}
                    handleSearch={handleSearch} 
                    handleSearchClick={handleSearchClick} 
                    handleSearchBlur={handleSearchBlur} 
                    handleFilterClick={handleFilterClick} 
                    handleSeedCheck={handleSeedCheck}
                    handleFilterBlur={handleFilterBlur} 
                    handleCheckAllRecord={handleCheckAllRecord}
                    getDataSource={getDataSource} />
                })}</tr></thead>
    );

});

const SearchBox = memo((props, ref) => {

    const self = {
        getSearch: () => {}
    };    

    /* Expose the component to the consumer */
    useImperativeHandle(ref, () => self);

});

/**
 * 
 * Filter box component
 * 
 */
const FilterBox = memo(({config, lastFilter, handleSeedCheck, handleFilterBlur, getDataSource}) => {

    
    const self = {
        getSearch: () => {}
    };    

    /* Expose the component to the consumer */
    //useImperativeHandle(ref, () => self);

    const [state, setState] = useState({
        source: null, 
        records: null,
        currentPage: 1,        
        totalPages: 0,       
        recordsPerPage: 10,
        next: true,
        prev: false,
    });

    /**
     * 
     * Maintain the checked state
     * 
     */    
    const [checked, setChecked] = useState(Array.isArray(lastFilter) ? lastFilter : []);

    const filterBoxRef = useRef(null);

    /**
     * 
     * Get the distinct values for the configured field
     * 
     */
    const fetchSeeds = () => {  
        
        let _endPoint = "";
        const datasource = getDataSource();        
        
        if (datasource.endpoint.indexOf("?") !== -1) {
            _endPoint = datasource.endpoint +"&filter="+ config.field.handle +"&filter_type=seeds"
        } else {
            _endPoint = datasource.endpoint +"?filter="+ config.field.handle +"&filter_type=seeds"
        }

        const request = {
            method: "GET",
            endpoint: _endPoint
        }

        window._controller.docker.dock(request)
        .then((_res) => {
            setState((prevState) => ({
                ...prevState,
                progress: false,
                records: _res,
                source: _res,
                totalPages: Math.ceil(_res.length / prevState.recordsPerPage)
            }));
        })
        .catch((e) => {
            console.log(e);
        });

    };

    /**
     * 
     * @param {*} _e 
     * @param {*} _record 
     * 
     * Handler for filter record check change event
     * 
     */
    const handleCheckedChange = (_e, _record) => {

        if (_e.target.checked) {
            if (checked.indexOf(_record) === -1) {
                checked.push(_record);
            }
        } else {
            if (checked.indexOf(_record) !== -1) {                
                checked.splice(checked.indexOf(_record), 1);
            }
        }        

        handleSeedCheck(config, checked);

    };

    const handleSearchBoxChange = (_e) => {

        let _source = [];

        if (_e.target.value) {
            for (let i = 0; i < state.records.length; i++) {
                if (state.records[i].indexOf(_e.target.value) !== -1) {
                    _source.push(state.records[i]);
                }
            }
        } else {
            _source = state.records;
        }    
           
        setState((prevState) => ({...prevState, source: _source}));

    };
    
    const handlePrevBtnClick = (_e) => {
        setState((prevState) => ({...prevState, currentPage: (prevState.currentPage - 1)}));
    };

    const handleNextBtnClick = (_e) => {
        setState((prevState) => ({...prevState, currentPage: (prevState.currentPage + 1)}));
    };

    /**
     * 
     * @param {*} param0 
     * @returns 
     * 
     * Render the actual filter record
     * 
     */
    const SeedRecord = (_props) => {
        return <label><input type="checkbox" onChange={(_e) => handleCheckedChange(_e, _props.id)} checked={checked.includes(_props.id)} /> {_props.label}</label>
    };

    /**
     * 
     * @returns 
     * 
     * Render the filter list along with search box (top portion)
     * 
     */
    const FilterList = () => {
  
        if (state.source) {

            if (!state.currentPage) {
                state.currentPage = 1;
            }

            if (state.source.length > 0) {
                
                let recordsTRs = [];
                let endIndex = state.source.length;
                let startIndex = ((state.currentPage - 1) * state.recordsPerPage); 
    
                if ((startIndex + state.recordsPerPage) < state.source.length) {
                    endIndex = startIndex + state.recordsPerPage;
                }
                
                if (config.header.filter_type === "object") {

                    for (let i = startIndex; i < endIndex; i++) {
                        recordsTRs.push(<SeedRecord key={i} id={state.source[i][config.header.filter_key]} label={state.source[i][config.header.filter_label]} />);
                    }

                } else {
                    for (let i = startIndex; i < endIndex; i++) {
                        recordsTRs.push(<SeedRecord key={i} id={state.source[i]} label={state.source[i]} />);
                    }
                }

                
    
                return recordsTRs;
                
            } else {
                return <h2>No seeds found</h2>
            }
        } else {
            return <h2><i className="fa fa-cog fa-spin"></i></h2>
        }        

    };

    /**
     * 
     * @returns 
     * 
     * Render paginator - bottom portion
     * 
     */
    const FilterPage = () => {

        if (state.source && (state.source.length > state.recordsPerPage)) {

            let prevClass = (state.currentPage === 1) ? "disable" : "";
            let nextClass = (state.currentPage === state.totalPages) ? "disable" : "";

            return (
                <div className="filter-box-paginator">
                    <button className={prevClass} onClick={handlePrevBtnClick}><i className="far fa-chevron-left"></i></button>                    
                    <button className={nextClass} onClick={handleNextBtnClick}><i className="far fa-chevron-right"></i></button>
                </div>
            );

        }

        return <></>;
    };

    /**
     * 
     * Initiate the seed fetching process
     * 
     */
    useEffect(() => {        
        fetchSeeds();

        const handleDocumentClick = (event) => {
            if (filterBoxRef.current && !filterBoxRef.current.contains(event.target)) {            
                //handleFilterBlur();
            }
        };
    
        document.addEventListener('mousedown', handleDocumentClick);  

        return () => { 
            document.removeEventListener('mousedown', handleDocumentClick);
        };

    }, []);    

    return (
        <div className="pharmarack-cms-filter-box" ref={filterBoxRef}>
            <div className="filter-box-list">
                <div className="filter-box-list-top">
                    <input type="text" placeholder={`Search for ${config.header.title}`} onChange={(_e) => handleSearchBoxChange(_e)} />
                </div>
                <div className="filter-box-list-bottom">
                    <FilterList />
                </div>
            </div>
            <div className="filter-box-pages">
                <FilterPage />
            </div>
        </div>
    );

});

/**
 * 
 * DataGrid main component
 * 
 */
const DataGrid = (props, ref) => {
    
    let datasource = null;
    let searchTimer = null;
    const searchTimeout = 400;         
    const lastSearchForRef = useRef(""); 
    const lastFilterByRef = useRef(""); 

    const headerInstances = {};
    const [collapseState, setCollapseState] = useState({});
    const [checked, setChecked] = useState([]);

    const navigate = useNavigate();
    const contextObj = window._controller.getCurrentModuleInstance();

    /* State used by Paginator component */
    const [state, setState] = useState({
        records: [],
        headers: props.config.columns,
        progress: false,
        currentPage: (window._controller.snapshot.dataGrids[props.config.handle]) ? window._controller.snapshot.dataGrids[props.config.handle].currentPage : 1,
        currentRecord: {},
        totalPages: 0,       
        recordsPerPage: 25
    });    

    /* We maintain the height for using with loading progress widget */
    const [bodyHeight, setBodyHeight] = useState(200);

    const getDataSource = () => {
        if (!datasource && contextObj && contextObj.onDatagridRequest) {
            datasource = contextObj.onDatagridRequest(props.config.handle, props.config.datasource);                
        }
        return datasource;
    };
    
    const handleFilterClick = (_e, _config) => {
        
        let _headers = JSON.parse(JSON.stringify(state.headers));

        for (let i = 0; i < _headers.length; i++) {
            _headers[i].filter = false;             
            if (_headers[i].field.handle === _config.field.handle) {
                _headers[i].filter = true;
                _headers[i].search = false; 
            }
        }        
        
        setState((prevState) => ({...prevState, headers: _headers}));  

    };

    const handleFilterBlur = (_e, _config) => {

        let _headers = JSON.parse(JSON.stringify(state.headers));

        for (let i = 0; i < _headers.length; i++) {
            _headers[i].filter = false;             
        }        
        
        setState((prevState) => ({...prevState, headers: _headers}));

    };

    const handleCheckRecord = (_e, _record) => {

        if(props.config.link.key) {
            const _records = [...state.records]
            for (let i = 0; i < _records.length; i++) {
                if (_records[i][props.config.link.key] == _record[props.config.link.key]) {
                    _records[i]["__isChecked"] = _e.target.checked;
                }
            }
            setState((prevState) => ({...prevState, records: _records}));
        }

    };

    const handleCheckAllRecord = (_e) => {

        const _records = [...state.records];
        for (let i = 0; i < _records.length; i++) {
            _records[i]["__isChecked"] = _e.target.checked;
        }

        setState((prevState) => ({...prevState, records: _records}));

    };

    const handleSeedCheck = (_config, _checked) => {        
        lastFilterByRef.current = _checked;
        fetchRecords();
    };

    const handleSearchClick = (_e, _config) => {
        
        //lastSearchForRef.current = "";
        let _headers = JSON.parse(JSON.stringify(state.headers));

        for (let i = 0; i < _headers.length; i++) {
            _headers[i].search = false;             
            if (_headers[i].field.handle === _config.field.handle) {
                _headers[i].search = true;
                _headers[i].filter = false; 
            }
        }        
        
        setState((prevState) => ({...prevState, headers: _headers, currentPage: 1}));    

    };

    const handleSearch = (_e, _config) => {

        if (searchTimer) {
            clearTimeout(searchTimer);
			searchTimer = null;
        }

        if (lastSearchForRef.current === _e.target.value ) {
            return;
        }

        lastSearchForRef.current = _e.target.value;
        searchTimer = setTimeout(() => fetchRecords(), searchTimeout);	        

    } ;

    const handleSearchBlur = (_e, _config) => {

        let _headers = JSON.parse(JSON.stringify(state.headers));

        for (let i = 0; i < _headers.length; i++) {
            _headers[i].search = false;             
        }        
        
        setState((prevState) => ({...prevState, headers: _headers, currentPage: 1}));

    };

    const handleRecordLinkClick = (_e, _gridName, _targetContext, _value) => {

        _e.preventDefault();
        state.currentRecord = _value;            

        if (contextObj) {

            contextObj.viewMode = "single";
            contextObj.currentGrid = props.config.handle;
            contextObj.currentRecord[props.config.handle] = state.currentRecord;  

            if (props.config.is_main_grid) {
                contextObj.mainGrid = props.config.handle;
            } 

            if (contextObj && contextObj.onRecordLinkClick) {
                contextObj.onRecordLinkClick(_e, _gridName, _targetContext, state.currentRecord);
                return;
            }

            if (props.config.link.target_type == "tab") {
                /* Target is view */
                switchView();
            } else {
                /* Target is view */
                /* Persist the context state */
                window._controller.snapshot[window._controller.current] = {
                    mainGrid: props.config.handle,
                    currentGrid: props.config.handle
                }

                const href = _e.target.getAttribute("href");
                if (href) {
                    navigate(href);
                }
            }            

        } else {
            console.error("Unexpected Error, current module is missing.!");
        }

    };
    
    const handleRecordBtnClick = (_e, _field, _gridName, _record) => {              
        if (contextObj && contextObj.onRecordButtonClick) {
            contextObj.onRecordButtonClick(_e, _field, _gridName, _record);
        }
    };

    const handleCollapseBtnClick = (_e, _config, _record) => {

        setCollapseState((prevState) => {

            if(prevState[_record[_config.key]]) {
                delete prevState[_record[_config.key]];
            } else {
                prevState[_record[_config.key]] = true;
            }

            return {...prevState};

        });

    };

    const getSourceUrl = () => {

        if (props.config.link.target_type == "view") {
            return contextObj.config.views[props.config.link.view].source || null;            
        } else {
            return props.config.link.endpoint;
        }

    };

    const switchView = () => {        

        if (contextObj && props.config.link && props.config.link.target_type && contextObj.currentRecord[props.config.handle]) {
        
            if (props.config.link.target_type == "view") { 
                window._controller.switchView(props.config.link.view);
            } else if (props.config.link.target_type == "tab") {
                window._controller.switchTab(props.config.link.tab, props.config.link.tab_item);
            }
            
        } else {
            console.log("something is missing");
        }

    }

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
        
    }

    const Toggle = (_props) => { 

        const [status, setStatus] = useState(_props.status);

        const handleToggleChange = (_e, _record) => {
            setStatus(_e.target.checked);

            /* Update the grid record */
            const id = _record[_props.config.value_key];
            for (let i = 0; i < state.records.length; i++) {
                if (state.records[i][_props.config.value_key] === id) {
                    state.records[i][_props.config.handle] = _e.target.checked;
                    break;
                }
            }
    
            if (contextObj) {                

                let proceed = true;
                if (contextObj.onRecordToggleStatus) {
                    proceed = contextObj.onRecordToggleStatus(props.config.handle, _props.config.handle,  _record, _e.target.checked);
                }
                
                if (proceed) {

                    if (_record[_props.config.value_key]) {

                        _record[_props.config.handle] = _e.target.checked;

                        const request = {};
                        const endPoint = getSourceUrl();
                        const id = _record[_props.config.value_key];                                   

                        request["method"] = "PUT";
                        request["endpoint"] = (endPoint + id);
                        request["payload"] = {};                        
                        request["payload"][_props.config.handle] = _e.target.checked;

                        window._controller.docker.dock(request)
                        .then((_res) => {
                            window._controller.notify( _record[_props.config.label_key] + (_e.target.checked ? " enabled successfully" : " disabled successfully"));
                        })
                        .catch((e) => {
                            window._controller.notify(_record[_props.config.label_key] + " failed to update.!", "error"); 
                        });

                    }
                }
            } else {
                console.error("Unexpected Error, current module is missing.!");
            }

        };

        return (
            <div className="toggle-container">
                <label className="pharmarack-cms-toggle-switch">
                    <input type="checkbox" className="pharmarack-cms-toggle-field" onChange={(_e) => handleToggleChange(_e, _props.record)} checked={status} />
                    <span className="pharmarack-cms-toggle-slider"></span>
                </label>            
            </div>
        );

    }

    const RecordButton = (_props) => {

        let icon = "";        
        let classes = "pharmarack-cms-btn "+ _props.config.classes +" "+ _props.config.field.theme;

        if (_props.config.field.icon !== "") {
            icon = <i className={_props.config.field.icon}></i>
        }

        return <button key={_props.config.field.action} className={classes} onClick={e => handleRecordBtnClick(e, _props.config.field.action, props.config.field.handle, _props.record)}>{icon}{_props.config.field.label}</button>

    }

    const CollapseField = (_props) => {
        
        return (
            <table className="pharmarack-cms-collapse-table">
                <tr>
                    {
                        _props.fields.map((item, index) => {
                            
                            const cssProperties = {
                                textAlign: item.field.align 
                            }                            
                            
                            if (item.field.type === "alphanumeric") {                                                                
                                return <td key={uuidv4()} style={cssProperties} className={`${item.classes}`}>
                                        <label>{item.header.title}</label>
                                        {_props.record[item.field.handle]}
                                    </td>;
                            } else if (item.field.type === "serial") {
                                return <td key={uuidv4()} style={cssProperties} className={`${item.classes}`}>
                                        <label>{item.header.title}</label>
                                        {_props.serial}
                                    </td>;
                            } else if (item.field.type === "link") {                                
                                return <td key={uuidv4()} style={cssProperties} className={`${item.classes}`}>
                                        <label>{item.header.title}</label>
                                        <a href="#1" onClick={e => handleRecordLinkClick(e, item.field.handle, item.field.link.context, _props.record)}>{_props.record[item.field.handle]}</a>
                                    </td>;
                            } else if (item.field.type === "toggle") {
                                return <td key={uuidv4()} style={cssProperties} className={`${item.classes}`}>
                                        <label>{item.header.title}</label>
                                        <Toggle status={_props.record[item.field.handle]} config={item.field} record={_props.record} />
                                    </td>;                            
                            } else if (item.field.type === "button") {                                
                                return <td key={uuidv4()} style={cssProperties} className={`${item.classes}`}>
                                        <label>{item.header.title}</label>
                                        <RecordButton config={item} record={_props.record} />
                                    </td>
                            } else if (item.field.type === "static") {                                
                                return <td key={uuidv4()} style={cssProperties} className={`${item.classes}`}>
                                        <label>{item.header.title}</label>
                                        {item.field.value}
                                    </td>;
                            }

                        })
                    }
                </tr>
            </table>
        )

    }

    const RecordCell = (_props) => {

        const cssProperties = {
            textAlign: _props.config.field.align 
        }        

        if (_props.config.field.type === "link" || _props.config.field.type === "link_search") {
            return <td style={cssProperties} className={_props.config.classes}><a href={`/main${props.config.link.endpoint}${_props.record[props.config.link.key]}`} onClick={e => handleRecordLinkClick(e, props.config.handle, props.config.link.context, _props.record)}>{_props.data}</a></td>;
        } else if (_props.config.field.type === "button") {
            if (!_props.config.field.icon) {
                return <td style={cssProperties} className={_props.config.classes}><button className={`pharmarack-cms-btn ${_props.config.field.classes}`} onClick={e => handleRecordBtnClick(e, _props.config.field.action, props.config.handle, _props.record)}>{_props.data}</button></td>
            } else {
                return <td style={cssProperties} className={_props.config.classes}><button className={`pharmarack-cms-btn ${_props.config.field.classes}`} onClick={e => handleRecordBtnClick(e, _props.config.field.action, props.config.handle, _props.record)}><i className={_props.config.field.icon}></i> {_props.data}</button></td>
            }            
        } else if (_props.config.field.type === "collapse") {
            return <td style={cssProperties} className={_props.config.classes}><button className="" onClick={e => handleCollapseBtnClick(e, _props.config.field, _props.record)}><i className="fa fa-chevron-down"></i></button></td>;
        } else if (_props.config.field.type === "check") {
            return <td style={cssProperties} className={_props.config.classes}><input type="checkbox" checked={_props.record["__isChecked"]} onChange={e => handleCheckRecord(e, _props.record)} /></td>;
        }

        return <td style={cssProperties} className={_props.config.classes}>{_props.data}</td>;

    }

    const TableRecord = (_props) => {

        const rows = [];
        let expand = false;
        let collapseFields = null;

        if (props.config.is_keyless) {            
            rows.push(
                <tr key={uuidv4()}>
                {
                    props.config.rows.map((item, index) => {
                        let _data = "";                        
                        if (item.type === "alphanumeric") {
                            _data = _props.record[item.field.handle];
                        } else if (item.type === "serial") {
                            _data = _props.serial;
                        } else if (item.type === "link") {
                            _data = _props.record[item.field.handle];
                        } else if (item.field.type === "toggle") {
                            _data = <Toggle key={uuidv4()} status={_props.record[item.field.handle]} config={item.field} record={_props.record} />;
                        } else if (item.field.type === "search") {
                            _data = _props.record[item.field.handle][item.field.label_key];
                        } else if (item.field.type === "collapse") {
                            _data = _props.record[item.field.handle][item.field.label_key];
                        } 
                        return <RecordCell key={_props.serial +"-"+index} config={item} record={_props.record} data={_data} />;
                    })
                }
                </tr>
            );
        } else {    
            rows.push(
                <tr key={uuidv4()}>
                { 
                    props.config.columns.map((item, index) => { 
                        let _data = ""; 
                        if (item.field.type === "alphanumeric") {
                            _data = _props.record[item.field.handle];
                        } else if (item.field.type === "serial") {
                            _data = _props.serial;
                        } else if (item.field.type === "link") {
                            _data = _props.record[item.field.handle];
                        } else if (item.field.type === "toggle") {
                            _data = <Toggle key={uuidv4()} status={_props.record[item.field.handle]} config={item.field} record={_props.record} />;
                        } else if (item.field.type === "search" || item.field.type === "link_search") {
                            if (_props.record[item.field.handle] && _props.record[item.field.handle][item.field.label_key]) {
                                _data = _props.record[item.field.handle][item.field.label_key]; 
                            }
                        } else if (item.field.type === "date") {
                            _data = _props.record[item.field.handle];
                            if (_data) {
                                const dateObj = new Date(_data);
                                _data = dateObj.toDateString();
                            } 
                        } else if (item.field.type === "button") {
                            _data = item.field.label;                            
                        } else if (item.field.type === "collapse") {
                            collapseFields = item.field.fields;                            
                            expand = collapseState[_props.record[item.field.key]];
                            const arrowClass = expand ? 'fa fa-chevron-up' : 'fa fa-chevron-down';
                            const cssProperties = {
                                textAlign: item.field.align 
                            } 
                            return <td style={cssProperties}><button className="" onClick={e => handleCollapseBtnClick(e, item.field, _props.record)}><i className={arrowClass}></i></button></td>;
                        } else if (item.field.type === "enum") {
                            if (contextObj && contextObj.config && contextObj.config.enums[item.field.enum]) {
                                _data = contextObj.config.enum[item.field.enum][_props.record[item.field.handle]];
                            }
                        }
                        return <RecordCell key={_props.serial +"-"+index} config={item}  record={_props.record} data={_data} />;
                    })
                }
                </tr>
            );
        }     

        if (collapseFields && expand) {

            rows.push(
                <tr key={uuidv4()}>
                    <td colSpan={props.config.columns.length}>
                        <CollapseField key={_props.serial +"-collapse-form"} fields={collapseFields} record={_props.record} />
                    </td>
                </tr>
            );

        } 

        return rows;

    }

    const TableRecords = memo(({ records, access }) => {
      
        let widget = null;

        if (!state.progress) {

            if (records && records.length > 0) {
                widget = <tbody key={uuidv4()} id="pharmarack-cms-data-grid-record-body">{records.map((item, index) => <TableRecord key={index} serial={((index + 1) + ((state.currentPage - 1) * state.recordsPerPage))} record={item} />)}</tbody>;                
            } else {
                let msg = "No record found.!";
                if (props.config.empty_message) {
                    msg = props.config.empty_message;
                }     
                msg = access ? msg : "Read access forbidden.!";  
                widget = <tbody key={uuidv4()} id="pharmarack-cms-data-grid-record-body"><tr><td colSpan={state.headers.length}><h2 className={`pharmarack-cms-data-grid-no-record ${ access ? "" : "access-restricted" }`}>{msg}</h2></td></tr></tbody>;
            }        

        } else {
            widget = <tbody key={uuidv4()} id="pharmarack-cms-data-grid-record-body" style={{height: bodyHeight+"px"}}>
                <tr>
                    <td colSpan={state.headers.length}>
                        <div className="data-grid-loading-container">
                            <div className="data-grid-loading-spinner"></div>
                            <p>Loading, please wait...</p>
                        </div>
                    </td>
                </tr>
            </tbody>;
        }

        useEffect(() => {            
            const tbodyElement = document.getElementById("pharmarack-cms-data-grid-record-body");
            if (tbodyElement) {
                setBodyHeight(tbodyElement.clientHeight);
                setTimeout(() => {
                    if (contextObj && contextObj.afterDataGridRecordLoaded) {
                        contextObj.afterDataGridRecordLoaded(props.config.handle);
                    }
                }, 500);
            }
        }, [records]);

        return widget;
        
    });

    const TableFooter = () => {
        return <></>;
    }

    const Paginator = memo(() => {
        
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

    });

    const fetchRecords = async() => { 

        if (!props.access) {
            setState((prevState) => ({
                ...prevState, 
                progress: false,
                records: [],
                totalPages: 0,       
                recordsPerPage: 0, 
                currentRecord: {},                     
            }));
            return;
        }

        if (contextObj && contextObj.onDatagridRequest) {
            if ((!datasource)) {
                datasource = contextObj.onDatagridRequest(props.config.handle, props.config.datasource); 
                if (!datasource) {
                    return null;
                }
            }
        } else if (!datasource) {
            datasource = props.config.datasource;
        }

        let endPoint = "";

        if (datasource.endpoint.indexOf("?") !== -1) {
            endPoint = datasource.endpoint +"&page="+ state.currentPage;        
        } else {
            endPoint = datasource.endpoint +"?page="+ state.currentPage;        
        }
        
        let lastSearchFrom = null;
        for (let i = 0; i < state.headers.length; i++) {
            if (state.headers[i].search) {
                lastSearchFrom = state.headers[i].field.handle;
            }
        }        

        if (lastSearchFrom) {
            endPoint += "&field="+ lastSearchFrom +"&search="+ lastSearchForRef.current;
        }     
        
        let lastFilterBy = null;
        for (let i = 0; i < state.headers.length; i++) {
            if (state.headers[i].filter) {
                lastFilterBy = state.headers[i].field.handle;
            }
        }

        if (lastFilterBy) {
            if (!Array.isArray(lastFilterByRef.current)) {
                lastFilterByRef.current = [];
            }
            endPoint += "&filter="+ lastFilterBy +"&filter_by="+ lastFilterByRef.current.join('|') +"&filter_type=records";
        }

        const request = {
            method: "GET",
            endpoint: endPoint
        }

        const cached = ("cached" in datasource) ? datasource.cached : false;        

        if (cached) {

            if (state.currentPage == 1) {

                setState((prevState) => ({...prevState, progress: true}));

                try {

                    const _res = await window._controller.docker.dock(request);

                    /* Persist the state in context */
                    window._controller.snapshot.dataGrids[props.config.handle] = {
                        currentPage: state.currentPage,
                        headers: state.headers,
                        endPoint: endPoint
                    };                    

                    let _records = _res.payload;
                    if (contextObj && contextObj.beforeLoadingDatagrid) {
                        _records = contextObj.beforeLoadingDatagrid(props.config.handle, _res.payload);
                    } 
    
                    const pRecords = [];
                        const _source = JSON.parse(JSON.stringify(_records));
                        const _endIndex = (_source.length > _res.recordPerPage) ? _res.recordPerPage : _source.length;
                        for (let i = 0; i < _endIndex; i++) {
                            pRecords.push(_source[i]);
                        }
                        
                        setState((prevState) => ({
                            ...prevState, 
                            progress: false,
                            records: pRecords,
                            source: _source,
                            totalPages: _res.totalPages,       
                            recordsPerPage: _res.recordPerPage, 
                            currentRecord: {},                     
                        }));
    
                } catch (e) {
                    console.log(e);
                    window._controller.notify(e.message, "error");
                    setState((prevState) => ({...prevState, progress: false}));
                }

            } else {

                let startIndex = (state.currentPage - 1) * state.recordsPerPage;
                let endIndex = startIndex + state.recordsPerPage;

                if (endIndex > state.source.length) {
                    endIndex = state.source.length;
                }

                const pRecords = [];
                for (let i = startIndex; i < endIndex; i++) {
                    pRecords.push(state.source[i]);
                }

                let _records = checkForCheckedRecord(pRecords);

                setState((prevState) => ({
                    ...prevState, 
                    progress: false,
                    records: _records,                    
                    currentRecord: {},                     
                }));

            }

        } else {                        

            setState((prevState) => ({...prevState, progress: true}));

            try {

                const _res = await window._controller.docker.dock(request);

                /* Persist the state in context */
                window._controller.snapshot.dataGrids[props.config.handle] = {
                    currentPage: state.currentPage,
                    headers: state.headers,
                    endPoint: endPoint
                };                  

                let _records = _res.payload;
                if (contextObj && contextObj.beforeLoadingDatagrid) {
                    _records = contextObj.beforeLoadingDatagrid(props.config.handle, _res.payload);
                } 

                _records = checkForCheckedRecord(_records);

                setState((prevState) => ({
                    ...prevState, 
                    progress: false,
                    records: _records,
                    totalPages: _res.totalPages,       
                    recordsPerPage: _res.recordPerPage, 
                    currentRecord: {},                     
                }));

            } catch (e) {
                window._controller.notify(e.message, "error");
                setState((prevState) => ({...prevState, progress: false}));
            }

        }       
               
    };

    const checkForCheckedRecord = (_records) => {

        let hasChecked = false;
        for (let i = 0; i < state.headers.length; i++) {
            if (state.headers[i].field.type == "check") {
                hasChecked = true;
            }
        }

        const newRecords = [..._records];
        if (hasChecked) {
            for (let i = 0; i < newRecords.length; i++) {                
                newRecords[i]["__isChecked"] = false;
            }
        }

        return newRecords;

    };

    // Handler function for the escape key
    const handleEscapeKey = (event) => {
        if (event.key === 'Escape') {
            handleSearchBlur();
            handleFilterBlur();
            fetchRecords();
        }
    };

    useEffect(() => {

        // Add event listener for keydown event
        window.addEventListener('keydown', handleEscapeKey);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('keydown', handleEscapeKey);
        };

    }, []);

    const self = {
        count: () => state.records.length,
        initFetch: () => fetchRecords(),            
        searchRecords: (_search) => {},
        filterRecords: () => {},
        getRecords: () => state.records,
        getSource: () => { return state.source ? state.source : [] },
        getCurrentRecord: () => state.currentRecord,            
        loadRecords: (_records, _totalPages, _recordsPerPage, _currentPage) => {
            setState((prevState) => ({
                ...prevState, 
                records: _records,
                totalPages: _totalPages,       
                recordsPerPage: _recordsPerPage, 
                currentRecord: {}, 
                currentPage: _currentPage || 1
            }));            
        },
        reloadRecords: () => {
            fetchRecords();
        },
        getCurrentPage: () => state.currentPage,
        getCurrentSearch: () => {
            let lastSearchFrom = null;
            for (let i = 0; i < state.headers.length; i++) {
                if (state.headers[i].search) {
                    lastSearchFrom = state.headers[i].field.handle;
                }
            }        

            if (lastSearchFrom) {
                return {
                    field: lastSearchFrom,
                    search: lastSearchForRef.current
                };
            }

            return null;
        },
        getCheckedRecords: () => {
            const checked = [];
            for (let i = 0; i < state.records.length; i++) {
                if (state.records[i]["__isChecked"]) {
                    checked.push(state.records[i]);
                }
            } 
            return checked;
        }
    };    

    /* Expose the component to the consumer */
    useImperativeHandle(ref, () => self);

    useEffect(() => {            
        fetchRecords();
    }, [state.currentPage]);

    let cssProps = {
        width: "100%"        
    };

    if (props.config.type === "fixed") {
        cssProps = {
            width: props.config.width       
        };
    }

    return ( 
        <div className={`pharmarack-cms-data-table-container ${props.config.handle}`}>
            <table style={cssProps} className="pharmarack-cms-data-table">
                <TableHeader 
                    headers={state.headers} 
                    lastSearch={lastSearchForRef.current}
                    lastFilter={lastFilterByRef.current}
                    handleSearch={handleSearch} 
                    handleSearchClick={handleSearchClick} 
                    handleSearchBlur={handleSearchBlur}                     
                    handleFilterClick={handleFilterClick} 
                    handleSeedCheck={handleSeedCheck} 
                    handleFilterBlur={handleFilterBlur}                    
                    handleCheckAllRecord={handleCheckAllRecord}
                    getDataSource={getDataSource} 
                />
                <TableRecords records={state.records} access={props.access} />
                <TableFooter />                
            </table>           
            <Paginator />     
        </div>      
    );    

}

export default forwardRef(DataGrid);