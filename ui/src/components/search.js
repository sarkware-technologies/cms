import React, {forwardRef, useImperativeHandle, useState, useRef, useEffect} from "react";

const Search = (props, ref) => {
    
    let delayTimer = null;

    let currentRecordLink = null;
    const resultInputRef = useRef(null);
    const searchInputRef = useRef(null);

    const contextObj = window._controller.getCurrentModuleInstance();

    const [state, setState] = useState({
        classes: "",
        active: false,        
        records: [],
        totalPages: 0,       
        recordsPerPage: 25,
        isSearching: false,
        currentPage: 1,
        currentRecord: {},
        searchText: "",
        resultText: ""
    });

    /* We maintain the height for using with loading progress widget */
    const [bodyHeight, setBodyHeight] = useState(200);

    const performSearch = () => { 

        setState({
             ...state,         
             isSearching: true
        });

        let endPoint = props.config.datasource.endpoint;
        if (props.config.datasource.endpoint.indexOf("?") !== -1) {
            endPoint = endPoint + "&field="+ props.config.label_key +"&search="+ state.searchText +"&page=1";
        } else {
            endPoint = endPoint + "?field="+ props.config.label_key +"&search="+ state.searchText +"&page=1";
        }

        if (contextObj && contextObj.onSearchBoxRequest) {
            endPoint = contextObj.onSearchBoxRequest(props.config.handle, endPoint);
        }

        window._controller.docker.dock({
            method: "GET",
            endpoint: endPoint
        })
        .then((_res) => {
            
            state.records = _res.payload;
            state.totalPages = _res.totalPages;
            state.recordsPerPage = _res.recordPerPage;
            state.currentPage = 1;

            setState({
                ...state,                              
                isSearching: false                    
            });  

        })
        .catch((e) => {
            console.log(e);
        }); 

    };

    const handleSearchKeyEvent = (_e) => { 

        if (_e.key === "ArrowUp") {
            /* Up */
        } else if (_e.key === "ArrowDown") {
            /* Down */
        } else if (_e.key === "ArrowLeft") {
            /* Left */
        } else if (_e.key === "ArrowRight") {
            /* Right */
        } else if (_e.key === "Escape") {
            /* Escape */
            setState({...state, active: false});
            return;
        } else if (_e.key === "Enter") {
            /*  Enter key */
            if (state.currentRecord && Object.keys(state.currentRecord).length > 0) {
                setState({...state, active: false});
            }
        } else {
            state.searchText = _e.target.value;        
            if (delayTimer) {
                clearTimeout(delayTimer);
            }
            delayTimer = setTimeout(performSearch, 350);        
        }

    };

    const handleRecordClick = (_e, _record) => {

        _e.preventDefault();
        setState({...state, currentRecord: _record, active: false});
        currentRecordLink = _e.target;

        if (contextObj && contextObj.onSearchRecordSelected) {
            contextObj.onSearchRecordSelected(props.config.handle, _record);
        }

    };

    const handlePrevPageBtnClick = (_e) => {
        _e.stopPropagation();
        _e.preventDefault();
        if (state.currentPage > 1) {
            state.currentPage--;
            performSearch();
        }
    };

    const handleNextPageBtnClick = (_e) => {
        _e.stopPropagation();
        _e.preventDefault();
        if (state.currentPage < state.totalPages) {
            state.currentPage++;
            performSearch();
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

    const renderPageButtons = () => {

        const prevBtnClass = (state.currentPage <= 1) ? "disabled" : "";
        const nextBtnClass = (state.currentPage >= state.totalPages) ? "disabled" : "";

        return (
            <div className="pharmarack-cms-search-paginator">

                <a href="#" onClick={(_e) => handlePrevPageBtnClick(_e)} className={`pharmarack-cms-btn primary ${prevBtnClass}`}><i className="far fa-chevron-left"></i></a>
                <a href="#" onClick={(_e) => handleNextPageBtnClick(_e)} className={`pharmarack-cms-btn primary ${nextBtnClass}`}><i className="far fa-chevron-right"></i></a>

                <div>
                    <a href="#" className="pharmarack-cms-btn secondary" onClick={(_e) => handleClearBtnClick(_e)}>Clear</a>
                    <a href="#" className="pharmarack-cms-btn primary" onClick={(_e) => handleDoneBtnClick(_e)}>Done</a>
                </div>                

            </div>
        );        

    };

    const renderSearchRecords = () => {
        
        searchInputRef.current.focus();

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

    const showDropDown = () => {
 
        if (state.isSearching) {
            return <div className="pharmarack-cms-search-box-progress"><i className="fa fa-spin fa-loader"></i></div>
        } else {
            return renderSearchRecords();
        }       

    };

    const handleResultBoxInputClick = (_e) => {
        state.active = true;
        performSearch();                
    };

    const handleSearchBoxInputClick = (_e) => { 
        _e.stopPropagation();
        performSearch();
    };

    const handleResultInputChange = (_e) => {        
        setState({...state, resultText: _e.target.value});
    };   

    const handleResultInputKeyup = (_e) => {
        if (_e.key === "Enter") {
            state.active = true;
            performSearch();
        }
    };

    const self = { 
        getRecords: () => state.records,
        getCurrentRecord: () => {
            let record = null;
            if (Object.keys(state.currentRecord).length > 0) {
                record = state.currentRecord[props.config.value_key];
            }                
            return record;
        },   
        setCurrentRecord: (_record) => {

            if (!_record) _record = {};
            setState({
                ...state, 
                currentRecord: _record                    
            });
            
            if (contextObj && contextObj.onSearchRecordSelected) {
                contextObj.onSearchRecordSelected(props.config.handle, _record);
            }
            
        },   
        loadRecords: (_records, _totalRecords, _recordsPerPage) => {
            setState({
                ...state, 
                records: _records, 
                totalPages: Math.floor(_totalRecords / _recordsPerPage), 
                recordsPerPage: _recordsPerPage
            });
        },
        setError: () => {
            if (!state.classes.includes('invalid')) {
                setState({ ...state, classes: state.classes + " invalid" });
            }
        },
        clearError: () => {
            let _classes = state.classes;               
            setState({...state, classes: _classes.replace('invalid','')});
        }          
    };
    
    /* Expose the component to the consumer */
    useImperativeHandle(ref, () => self);

    useEffect(() => {

        const handleGlobalClick = (_e) => {
            // Check if the click event occurred outside the popup component
            if (!_e.target.closest('.fields-factorysystem-search-widget') && state.active) {
                _e.stopPropagation();                
                setState((prevState) => ({ ...prevState, active: false }));
            }
        };
      
        const handleEscapeKey = (_e) => {
            if (_e.key === 'Escape' && state.active) {
                _e.stopPropagation();
                setState((prevState) => ({ ...prevState, active: false }));
            }
        };

        document.removeEventListener('click', handleGlobalClick);
        document.removeEventListener('keyup', handleEscapeKey);
      
        // Add event listeners when the component mounts
        document.addEventListener('click', handleGlobalClick);
        document.addEventListener('keyup', handleEscapeKey);

        const tbodyElement = document.getElementById("pharmarack-cms-search-records");
        if (tbodyElement) {
            //setBodyHeight(tbodyElement.clientHeight);
        }
      
        // Remove event listeners when the component unmounts
        return () => {
            document.removeEventListener('click', handleGlobalClick);
            document.removeEventListener('keyup', handleEscapeKey);
        };

    }, [state]);

    useEffect(() => { 
        if (state.currentRecord && Object.keys(state.currentRecord).length > 0) {
            if (contextObj && contextObj.onSearchRecordSelected) {
                contextObj.onSearchRecordSelected(props.config.handle, state.currentRecord);
            }
        }        
    }, []);

    const dropdownClass = state.active ? props.config.popup_class + " visible" : props.config.popup_class;
    const searchBoxClass = props.config.disabled ? props.config.search_class + " disabled" : props.config.search_class;    

    return (
        <div className={`pharmarack-cms-search-widget ${state.classes}`}>

            <div className={`pharmarack-cms-search-widget-header ${searchBoxClass}`}>
                <input ref={resultInputRef} type="text" onClick={handleResultBoxInputClick} placeholder={props.config.placeholder} onChange={handleResultInputChange} onKeyUp={handleResultInputKeyup} value={((Object.keys(state.currentRecord).length > 0) ? state.currentRecord[props.config.label_key] : "")} />
                <i className="fa-regular fa-angle-down"></i>
            </div>

            <div className={`pharmarack-cms-search-widget-container ${dropdownClass}`}>

                <div className="pharmarack-cms-search-box-text-container">
                    <input ref={searchInputRef} onClick={handleSearchBoxInputClick} onKeyUp={handleSearchKeyEvent} onChange={() => {}} type="text" placeholder={props.config.searchprompt} />
                    <i className="far fa-search"></i>
                </div>
                
                <div className="pharmarack-cms-search-records" id="pharmarack-cms-search-records" >{ state.active ? showDropDown() : "" }</div>
                { state.active ? renderPageButtons() : "" } 
               
            </div>

        </div>        
    );

}

export default forwardRef(Search);