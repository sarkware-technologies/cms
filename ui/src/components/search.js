import React, { forwardRef, useImperativeHandle, useState, useRef, useEffect } from "react";

const Search = (props, ref) => {

    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);
    const resultInputRef = useRef(null);
    const containerRef = useRef(null);

    const contextObj = window._controller.getCurrentModuleInstance();

    const [state, setState] = useState({
        active: false,
        records: [],
        allRecords: [],
        totalPages: 0,
        recordsPerPage: props.config.datasource.recordsPerPage || 10,
        isSearching: false,
        currentPage: 1,
        searchText: "",
        resultText: "",
        currentRecord: {},
        isLoading: false,
        classes: ""
    });

    const fetchRecords = (page = 1, searchText = "") => {

        setState({ ...state, active: true, isLoading: true });

        let endPoint = props.config.datasource.endpoint;
        if (!props.config.datasource.cached) {
            endPoint += endPoint.includes("?") ? `&` : `?`;
            endPoint += `field=${props.config.label_key}&search=${searchText}&page=${page}`;
        }

        if (contextObj && contextObj.onSearchBoxRequest) {
            endPoint = contextObj.onSearchBoxRequest(props.config.handle, endPoint);
        }

        window._controller.docker.dock({
            method: "GET",
            endpoint: endPoint
        })
        .then((_res) => {
            if (props.config.datasource.cached) {
                const allRecords = _res;
                const totalPages = Math.ceil(allRecords.length / state.recordsPerPage);

                setState({
                    ...state,
                    active: true,
                    allRecords,
                    records: allRecords.slice(0, state.recordsPerPage),
                    totalPages,
                    currentPage: 1,
                    isSearching: false,
                    isLoading: false
                });
            } else {
                setState({
                    ...state,
                    active: true,
                    records: _res.payload,
                    totalPages: _res.totalPages,
                    currentPage: page,
                    isSearching: false,
                    isLoading: false
                });
            }
        })
        .catch((e) => {
            console.log(e);
            setState({ ...state, isSearching: false, isLoading: false });
        });
    };

    const handleResultBoxFocus = () => {
        // Ensure dropdown only activates when it's not already active
        if (!state.active) {
            setState({ ...state, active: true });

            // Fetch records only when necessary
            if (props.config.datasource.cached && state.allRecords.length === 0) {
                fetchRecords();
            } else if (!props.config.datasource.cached) {
                fetchRecords(state.currentPage, state.searchText);
            }
        }
    };

    const handleSearchKeyEvent = (_e) => {

        const searchText = _e.target.value;
        setState({ ...state, searchText, isLoading: true });

        if (state.isSearching) return;

        setTimeout(() => {

            setState({ ...state, isSearching: true });
            if (props.config.datasource.cached) {

                const filteredRecords = state.allRecords.filter(record =>
                    record[props.config.label_key]
                        .toLowerCase()
                        .includes(searchText.toLowerCase())
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

            } else {
                fetchRecords(1, searchText);
            }

        }, 350);
    };

    const updatePageRecords = (newPage) => {
        if (props.config.datasource.cached) {
            const startIdx = (newPage - 1) * state.recordsPerPage;
            const endIdx = startIdx + state.recordsPerPage;
            setState({
                ...state,
                records: state.allRecords.slice(startIdx, endIdx),
                currentPage: newPage
            });
        } else {
            fetchRecords(newPage, state.searchText);
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
        setState({...state, currentRecord: {}});
    };

    const renderSearchRecords = () => {


        if (searchInputRef && searchInputRef.current) {
            searchInputRef.current.focus();
        }        

        if (Array.isArray(state.records) && state.records.length > 0) {    
            if (props.config.labels && Array.isArray(props.config.labels) && props.config.labels.length > 0) {

                let title = "";
                let recordsElement = [];

                for (let i = 0; i < state.records.length; i++) {

                    title = props.config.labels.map((label) => {
                        if (label.includes(".")) {
                            const nestedProps = label.split(".");
                            let nestedValue = state.records[i];
                            for (const prop of nestedProps) {
                              if (nestedValue && nestedValue[prop] !== undefined) {
                                nestedValue = nestedValue[prop];
                              } else {
                                nestedValue = ""; // Handle undefined or null values
                                break;
                              }
                            }
                            return nestedValue;
                          } else {
                            return state.records[i][label]?.toString();
                          }
                    }).join(" - ");
                    recordsElement.push(<a href="#" key={i} className={ (state.currentRecord[props.config.value_key] && state.currentRecord[props.config.value_key] === state.records[i][props.config.value_key]) ? "selected" : "" } onClick={(e) => {handleRecordClick(e, state.records[i])}}>{title}</a>);

                }

                return recordsElement;

            } else {
                return state.records.map((_record, _index) => <a href="#" key={_index} className={ (state.currentRecord[props.config.value_key] && state.currentRecord[props.config.value_key] === _record[props.config.value_key]) ? "selected" : "" } onClick={(e) => {handleRecordClick(e, _record)}}>{_record[props.config.label_key]}</a>);
            }
        } else { 
            return <div className="pharmarack-cms-search-box-empty-records">No matching records found.!</div>
        }      

    };

    const renderPageButtons = () => {

        const prevDisabled = state.currentPage <= 1 ? "disabled" : "";
        const nextDisabled = state.currentPage >= state.totalPages ? "disabled" : "";

        return (
            <div className="pharmarack-cms-search-paginator search">

                <button onClick={(_e) => updatePageRecords(state.currentPage - 1)} className={`pharmarack-cms-btn primary ${prevDisabled}`}><i className="far fa-chevron-left"></i></button>
                <button onClick={(_e) => updatePageRecords(state.currentPage + 1)} className={`pharmarack-cms-btn primary ${nextDisabled}`}><i className="far fa-chevron-right"></i></button>

                <div>
                    <button className="pharmarack-cms-btn secondary" onClick={(_e) => handleClearBtnClick(_e)}>Clear</button>
                    <button className="pharmarack-cms-btn primary" onClick={(_e) => handleDoneBtnClick(_e)}>Done</button>
                </div>                

            </div>
        );    

    };

    const handleRecordClick = (e, record) => {

        e.preventDefault();

        setState({ ...state, active: false, resultText: record[props.config.label_key], currentRecord: record });
        if (contextObj && contextObj.onSearchRecordSelected) {
            contextObj.onSearchRecordSelected(props.config.handle, record);
        }
    };

    const dropdownClass = state.active ? `${props.config.popup_class} visible` : props.config.popup_class;

    useEffect(() => {

        const handleBlur = (event) => { console.log("handleBlur is called");
            if (containerRef.current && !containerRef.current.contains(event.relatedTarget)) {
                setState((prevState) => ({ ...prevState, active: false }));
            }
        };
        
        containerRef.current.addEventListener("blur", handleBlur, true);

        return () => {
            if (containerRef.current) {
                containerRef.current.removeEventListener("blur", handleBlur, true);
            }            
        };

    }, []);

    const self = {
        getRecords: () => state.records,
        getCurrentRecord: () => state.currentRecord[props.config.value_key] || null,
        setCurrentRecord: (_record) => {
            setState({ ...state, currentRecord: _record || {} });
            if (contextObj && contextObj.onSearchRecordSelected) {
                contextObj.onSearchRecordSelected(props.config.handle, _record);
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
                        {state.isLoading && <i className="fa fa-spinner fa-spin"></i>}
                    </div>

                    <div className="pharmarack-cms-search-records">
                        {state.isLoading ? (
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
};

export default forwardRef(Search);
