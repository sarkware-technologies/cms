import React, { forwardRef, useImperativeHandle, useState, useRef, useEffect } from "react";

const DropDown = (props, ref) => {

    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);
    const resultInputRef = useRef(null);
    const containerRef = useRef(null);

    const contextObj = window._controller.getCurrentModuleInstance();

    const [state, setState] = useState({
        active: false,
        loading: true,
        value: props.value || null,
        records: [],     
        allRecords: [],   
        totalPages: 0,
        recordsPerPage: props.config.datasource.recordsPerPage || 10,        
        currentPage: 1,
        searchText: "",        
        currentRecord: {},
        classes: ""        
    });

    const self = {

        getRecords: () => state.records,
        getCurrentRecord: () => state.currentRecord[props.config.value_key] || null,
        setCurrentRecord: (_record) => {
            setState({ ...state, currentRecord: _record || {} });
            if (contextObj && contextObj.onDropdownRecordSelected) {
                contextObj.onDropdownRecordSelected(props.config.handle, _record);
            }
        },
        loadRecords: (_records, _totalRecords, _recordsPerPage) => {
            setState({
                ...state,
                records: _records,
                totalPages: Math.ceil(_totalRecords / _recordsPerPage),
                recordsPerPage: _recordsPerPage
            });
        },
        setError: () => {
            if (!state.classes.includes("invalid")) {
                setState({ ...state, classes: state.classes + " invalid" });
            }
        },
        clearError: () => {
            setState({ ...state, classes: state.classes.replace("invalid", "") });
        }

    };

    useImperativeHandle(ref, () => self);

    const fetchRecords = () => {        

        let endPoint = props.config.datasource.endpoint;
        if (contextObj && contextObj.onDropdownRequest) {
            endPoint = contextObj.onDropdownRequest(props.config.handle, endPoint);
        }

        window._controller.docker.dock({
            method: "GET",
            endpoint: endPoint
        })
        .then((_res) => {

            let currentRecord = {};
            const allRecords = _res;
            const totalPages = Math.ceil(allRecords.length / state.recordsPerPage);
            
            if (props.value) {
                for (let i = 0; i < allRecords.length; i++) {
                    if (allRecords[i][props.config.value_key] == props.value) {
                        currentRecord = allRecords[i];
                    }
                }                
            }

            setState({
                ...state,
                allRecords,
                records: allRecords.slice(0, state.recordsPerPage),
                totalPages,
                currentPage: 1,                
                loading: false,
                active: state.active,
                currentRecord: currentRecord
            });
            
        })
        .catch((e) => {
            console.log(e);
            setState({ ...state,  loading: false });
        });

    };

    const updatePageRecords = (newPage) => {
        
            const startIdx = (newPage - 1) * state.recordsPerPage;
            const endIdx = startIdx + state.recordsPerPage;

            setState({
                ...state,
                records: state.allRecords.slice(startIdx, endIdx),
                currentPage: newPage
            });
        
    };

    const renderSearchRecords = () => {

        if (searchInputRef && searchInputRef.current) {
            searchInputRef.current.focus();
        }        

        if (Array.isArray(state.records) && state.records.length > 0) {  
            return state.records.map((_record, _index) => <a href="#" key={_index} className={ ((state.currentRecord && state.currentRecord[props.config.value_key]) && state.currentRecord[props.config.value_key] === _record[props.config.value_key]) ? "selected" : "" } onClick={(e) => {handleRecordClick(e, _record)}}>{_record[props.config.label_key]}</a>);
        } else { 
            return <div className="pharmarack-cms-search-box-empty-records">No matching records found.!</div>
        }  
        
    };

    const handleDoneBtnClick = (_e) => {
        _e.stopPropagation();
        _e.preventDefault();
        setState({...state, active: false});
    };

    const handleClearBtnClick = (_e) => {
        _e.stopPropagation();
        _e.preventDefault();
        setState({...state, currentRecord: null, value: ""});
    };

    const renderPageButtons = () => {

        const prevDisabled = state.currentPage <= 1 ? "disabled" : "";
        const nextDisabled = state.currentPage >= state.totalPages ? "disabled" : "";

        return (
            <div className="pharmarack-cms-search-paginator dropdown">

                <button onClick={(_e) => updatePageRecords(state.currentPage - 1)} className={`pharmarack-cms-btn primary ${prevDisabled}`}><i className="far fa-chevron-left"></i></button>
                <button onClick={(_e) => updatePageRecords(state.currentPage + 1)} className={`pharmarack-cms-btn primary ${nextDisabled}`}><i className="far fa-chevron-right"></i></button>

                <div>
                    <button className="pharmarack-cms-btn secondary" onClick={(_e) => handleClearBtnClick(_e)}>Clear</button>
                    <button className="pharmarack-cms-btn primary" onClick={(_e) => handleDoneBtnClick(_e)}>Done</button>
                </div>                

            </div>
        );    

    };

    const handleResultBoxFocus = () => {
        setState((prevState) => ({ ...prevState, active: true }));
    };

    const handleSearchKeyEvent = (_e) => {

        const searchText = _e.target.value;       

        setTimeout(() => {
                
            const filteredRecords = state.allRecords.filter(record => {
                if (record[props.config.label_key]) {
                    return record[props.config.label_key]
                        .toLowerCase()
                        .includes(searchText.toLowerCase())
                    }
                }                
            );

            const totalPages = Math.ceil(filteredRecords.length / state.recordsPerPage);

            setState({
                ...state,
                records: filteredRecords.slice(0, state.recordsPerPage),
                totalPages,
                currentPage: 1,
                isSearching: false,
                isLoading: false
            });

        }, 350);

    };

    const handleRecordClick = (e, record) => {

        e.preventDefault();

        setState({ ...state, active: false, currentRecord: record });
        if (contextObj && contextObj.onDropdownRecordSelected) {
            contextObj.onDropdownRecordSelected(props.config.handle, record);
        }
        if (props.onRecordSelected) {
            props.onRecordSelected(record[props.config.value_key], props.index);
        }

    };

    useEffect(() => {
        fetchRecords();
    }, [props.config.datasource]); 

    useEffect(() => {

        const handleBlur = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.relatedTarget)) {
                setState((prevState) => ({ ...prevState, active: false }));
            }
        };

        resultInputRef.current.addEventListener("focus", handleResultBoxFocus);
        containerRef.current.addEventListener("blur", handleBlur, true);

        return () => {

            if (resultInputRef.current) {
                resultInputRef.current.removeEventListener("focus", handleResultBoxFocus);
            }
            if (containerRef.current) {
                containerRef.current.removeEventListener("blur", handleBlur, true);
            }
            
        };

    }, []);

    const dropdownClass = state.active ? `${props.config.popup_class} visible` : props.config.popup_class;

    return (

        <div ref={containerRef} className={`pharmarack-cms-search-widget ${state.classes}`} tabIndex="-1">

            <div className={`pharmarack-cms-search-widget-header ${props.config.search_class}`}>
                <input
                    ref={resultInputRef}
                    type="text"
                    placeholder={props.config.placeholder}
                    onFocus={handleResultBoxFocus}
                    value={state.currentRecord ? state.currentRecord[props.config.label_key] : ""}
                    readOnly
                />
                <i className="fa fa-angle-down"></i>
            </div>

            {state.active && (
                <div ref={dropdownRef} className={`pharmarack-cms-search-widget-container ${dropdownClass}`}>
                    
                    <div className="pharmarack-cms-search-box-text-container">
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder={props.config.searchprompt}
                            onKeyUp={handleSearchKeyEvent}
                        />                       
                    </div>

                    <div className="pharmarack-cms-search-records">
                        {state.loading ? (
                            <div className="pharmarack-cms-search-box-progress"><i className="fa fa-spinner fa-spin"></i>&nbsp;&nbsp;Loading...</div>
                        ) : (
                            renderSearchRecords()
                        )}
                    </div>

                    {renderPageButtons()}

                </div>
            )}

        </div>

    );

}

export default forwardRef(DropDown);