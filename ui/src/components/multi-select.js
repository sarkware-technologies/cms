import React, {forwardRef, useImperativeHandle, useState, useRef, useEffect, useLayoutEffect, memo} from "react";
import { v4 as uuidv4 } from 'uuid';

const MultiSelect = (props, ref) => {

    const searchInputRef = useRef(null);
    const multiSelectBoxRef = useRef(null);

    const contextObj = window._controller.getCurrentModuleInstance();

    /**
     * 
     * all
     * none
     * selected
     * 
     */
    const [mode, setMode] = useState( ('selected' in props) ? ( Array.isArray(props.selected) ? "selected" : props.selected ) : "none" );

    /**
     * 
     * dropDown
     * flatlist
     * popup
     * 
     */
    const [behave, setBehaviour] = useState(('behaviour' in props.config) ? props.config.behaviour : "dropdown");

    /**
     * 
     * Used to hold the original records
     * 
     */
    const [original, setOriginal] = useState(props.original);

    /**
     * 
     * Used to holds the placeholder message
     * 
     */
    const [userMessage, setUserMessage] = useState(props.config.placeholder);

    /**
     * 
     * Used to holds lifecycle properties
     * 
     */
    const [state, setState] = useState({  
        classes: "",      
        active: false,        
        records: [],
        source: [],        
        totalPages: 0,              
        isLoading: false,
        currentPage: 0,
        selectedRecords: ('selected' in props) ? ( Array.isArray(props.selected) ? props.selected : []) : [],
        searchText: "",
        resultText: ""
    });        

    const self = { 

        getSelectedRecords: () => {

            let selected = "none";

            if (mode === "all") {
                selected = mode;
            } else if(Array.isArray(state.selectedRecords)) {
                if (state.records.length > 0 && state.selectedRecords.length == state.records.length) {
                    selected = "all";
                } else if (state.selectedRecords.length > 0) {
                    selected = state.selectedRecords;
                }
            } else if (state.selectedRecords && state.selectedRecords == "all") {
                selected = "all";
            }            

            return selected;

        },
        getSelectedRecordsLabel: () => {

            let selected = "none";

            if (mode === "all") {
                selected = mode;
            } else if(Array.isArray(state.selectedRecords)) {
                
                selected = [];

                for (let i = 0; i < state.selectedRecords.length; i++) {
                    for (let j = 0; j < state.records.length; j++) {                        
                        if (state.selectedRecords[i] == state.records[j][props.config.value_key]) {
                            selected.push(state.records[j][props.config.label_key]);
                            break;
                        }
                    }
                }

                selected = selected.length == 0 ? "none" : selected;

            } else if (state.selectedRecords && state.selectedRecords == "all") {
                selected = "all";
            }            

            return selected;

        },
        getOriginalRecords: () => original,
        getRecords: () => state.source,
        getMode: () => mode,    
        getParent: () => props.parent,
        getHandle: () => props.config.handle,
        reset: () => {        
            
            setMode("none");
            setUserMessage(props.config.placeholder);

            setState((prevState) => ({
                ...prevState,   
                source: [],                           
                records: [],                
                selectedRecords: [],
                currentPage: 0,           
                totalPages: 0,
                active: false                    
            }));                    

            /* Propagate to  */
            if (props.child && props.child.current) {
                props.child.current.reset();
            }

        },
        setSelectedRecords: (_records) => {
            setState((prevState) => ({
                ...prevState,                           
                selectedRecords: _records ? _records : []                                   
            }));        
            setUserMessage(props.config.placeholder);
            if (_records.length > 0) {                
                if (props.child && props.child.current) {
                    props.child.current.reset();
                }
            }
            if (contextObj && contextObj.onMultiSelectRecordDone) {
                setTimeout(() => contextObj.onMultiSelectRecordDone(props.config.handle), 1000);                
            }
        },
        showPopup: () => {
            if (behave == "popup") {
                setState({...state, active: true});
            }
        },
        hidePopup: () => {
            if (behave == "popup") {
                setState({...state, active: false});
            }
        }   

    };

    /* Expose the component to the consumer */
    useImperativeHandle(ref, () => self);

    const handleResultBoxClick = () => {

        //let userMessage = _msg;
        const _originalRecords = JSON.parse(JSON.stringify(original));

        //setUserMessage(userMessage);
        setState((prevState) => ({
            ...prevState,                              
            active: true,
            source: _originalRecords,
            records: _originalRecords,
            currentPage: 0,           
            totalPages: Math.floor(_originalRecords.length / props.config.recordsPerPage)                    
        })); 

    };

    const handleRecordCheckChange = (_e, _record) => { 

        const _index = state.selectedRecords.indexOf(_record[props.config.value_key]);

        if (_e.target.checked) {
            if (_index === -1) {
                state.selectedRecords.push(_record[props.config.value_key]);
            }
        } else {
            if (_index !== -1) {
                state.selectedRecords.splice(_index, 1);                
            }
        }        

        if (state.selectedRecords.length > 0) {
            if (state.selectedRecords.length === state.source.length) {
                setMode("all");
            } else {
                setMode("selected");
            }            
        } else {
            setMode("none");
        }
        setState({...state, selectedRecords: state.selectedRecords});

        if (props.child && props.child.current) {
            props.child.current.reset();
        }

    };

    const renderRecords = () => {

        const items = [];
        searchInputRef.current.focus();
        
        if (Array.isArray(state.records) && state.records.length > 0) {

            let _checked = ''
            let startIndex = state.currentPage * props.config.recordsPerPage;
            let endIndex = startIndex + props.config.recordsPerPage;

            if (endIndex > state.records.length) {
                endIndex = state.records.length;
            }

            for (let i = startIndex; i < endIndex; i++) {

                _checked = false;
                if (mode === "all" || state.selectedRecords.indexOf(state.records[i][props.config.value_key]) !== -1) {
                    _checked = true;
                }

                items.push(<label key={uuidv4()}><input type="checkbox" onChange={(_e) => handleRecordCheckChange(_e, state.records[i])} checked={_checked} /> <span>{state.records[i][props.config.label_key]}</span></label>);
            }

        } else {
            items.push(<label key={uuidv4()}>{userMessage}</label>);
        }

        return items;

    };

    const handleCheckAllBtn = (_e) => {

        _e.stopPropagation();   
        
        if (props.config.child && props.config.child.current) {
            props.config.child.current.reset();
        }

        if (_e.target.checked) {

            if (state.selectedRecords.length === state.records.length) {                  
                setState({...state, selectedRecords: []}) ;
                setMode("none");
            } else {                 
                const checkedRecords = [];
                for (let i = 0; i < state.source.length; i++) {
                    checkedRecords.push(state.source[i][props.config.value_key]);
                }
                setState({...state, selectedRecords: checkedRecords}) ;
                setMode("all"); 
            }    
        } else {
            setMode("none");
            setState({...state, selectedRecords: []}) ;
        }

        if (props.child && props.child.current) {
            props.child.current.reset();
        }

    };

    const handleDoneBtnClick = (_e) => {
        _e.preventDefault();
        _e.stopPropagation();
        setState({...state, active: false});
        if (contextObj && contextObj.onMultiSelectRecordDone) {
            contextObj.onMultiSelectRecordDone(props.config.handle);
        } 
    }

    const handleCancelBtnClick = (_e) => {
        _e.preventDefault();
        _e.stopPropagation();
        setState({...state, active: false});        
    }

    const handlePrevPageBtnClick = (_e) => {
        
        _e.stopPropagation();
        _e.preventDefault();
        
        if (state.currentPage > 0) {
            state.currentPage--;
            setState({...state, currentPage: state.currentPage});
        }

    };

    const handleNextPageBtnClick = (_e) => {
        
        _e.stopPropagation();
        _e.preventDefault();
        
        if (state.currentPage < state.totalPages) {
            state.currentPage++;
            setState({...state, currentPage: state.currentPage});
        }

    };

    const handleSearchInputChange = (_e) => {
        
        _e.stopPropagation();

        const result = [];
        const searchTxt = _e.target.value.toLowerCase();

        for (let i = 0; i < state.source.length; i++) {
            if (state.source[i][props.config.label_key].toLowerCase().startsWith(searchTxt.toLowerCase())) {
                result.push(JSON.parse(JSON.stringify(state.source[i])));
            }
        }

        setState({...state, records: result});

    };

    const renderDoneBtn = () => {

        if (behave == "popup" && props.config.handle == "add_retailers") {            
            return <a href="#" className="pharmarack-cms-btn primary done-btn" onClick={(_e) => handleDoneBtnClick(_e)}>Add {state.selectedRecords.length} Retailer(s)</a>;
        } 

        return <a href="#" className="pharmarack-cms-btn primary done-btn" onClick={(_e) => handleDoneBtnClick(_e)}>Done</a>

    };

    const renderPageButtons = () => {

        let pageBtns = null;
        if (state.records.length > props.config.recordsPerPage) {

            const prevBtnClass = (state.currentPage <= 0) ? "disabled" : "";
            const nextBtnClass = (state.currentPage >= state.totalPages) ? "disabled" : ""; 

            pageBtns =(
                <div className="page-btns-wrapper">
                    <a href="#" onClick={(_e) => handlePrevPageBtnClick(_e)} className={`pharmarack-cms-btn primary ${prevBtnClass}`}><i className="far fa-chevron-left"></i></a>
                    <a href="#" onClick={(_e) => handleNextPageBtnClick(_e)} className={`pharmarack-cms-btn primary ${nextBtnClass}`}><i className="far fa-chevron-right"></i></a>
                </div>
            );
        }

        let selectedAll = false;  
        
        if (mode === "all") {
            selectedAll = true;
        } else {
            selectedAll = state.source.length ? (state.selectedRecords.length === state.source.length) : false; 
        }

        return(
            <div className="pharmarack-cms-search-paginator">                      

                <div>
                    <a href="#"><input type="checkbox" onChange={(_e) => handleCheckAllBtn(_e)} checked={selectedAll} /></a>
                </div>                

                {pageBtns} 

                {behave == "popup" ? <a href="#" className="pharmarack-cms-btn secondary done-btn" onClick={(_e) => handleCancelBtnClick(_e)}>Cancel</a> : null}

                {renderDoneBtn()}                         

            </div>
        );

    };

    const renderWidget = () => {

        return (
            <div ref={multiSelectBoxRef} className={`pharmarack-cms-multi-select-widget ${state.classes} ${behave}`}>

                <div className="pharmarack-cms-multi-select-widget-header" onClick={handleResultBoxClick} >
                    <span>{_placeholder}</span>
                    <i className="fa-regular fa-angle-down"></i>
                </div>

                <div className={`pharmarack-cms-multi-select-widget-popup-container ${dropdownClass}`}>

                    {behave == "popup" ? <div className="pharmarack-cms-multi-select-popup-title">Add Retailers</div> : null}

                    <div className="pharmarack-cms-multi-select-search-container">
                        <input ref={searchInputRef} type="text" onKeyUp = {(_e) => handleSearchInputChange(_e)} placeholder={props.config.searchprompt} />
                        <i className="far fa-search"></i>
                    </div>
                    
                    <div className="pharmarack-cms-multi-select-records">{ state.active ? renderRecords() : null }</div>
                    { state.active ? renderPageButtons() : "" } 
                
                </div>

            </div>
        );

    }

    useEffect(() => {

        if (props.config.source === "remote") {

            const request = {
                method: "GET",
                endpoint: props.config.endpoint
            };        

            window._controller.docker.dock(request).then((_res) => {
                if (Array.isArray(_res)) {

                    setOriginal(_res);
                    
                    setState({
                        ...state,
                        currentPage: 0,  
                        records: _res,
                        source: _res,                                    
                        isLoading: false,                            
                        totalPages: Math.floor(_res.length / props.config.recordsPerPage) 
                    });  
                    
                }
                
                if (contextObj && contextObj.onMultiSelectRecordLoaded) {
                    contextObj.onMultiSelectRecordLoaded(props.config.handle);
                } 
            })
            .catch((e) => {
                window._controller.notify(e.message, "error");
            });            

        } else {
            setState({
                ...state,
                currentPage: 0,                    
                totalPages: Math.floor(original.length / props.config.recordsPerPage) 
            });            
        }

        const handleDocumentClick = (event) => {
        
            setState((prevState) => {
                if (multiSelectBoxRef.current && !multiSelectBoxRef.current.contains(event.target) && behave == "dropdown") {
                    return { ...prevState, active: false };
                }
                return prevState;
            });
        
        };

        /* Notify the parent, that you are mounted */
        if (props.groupKey) {
            props.registerInstance(props.groupKey, props.ruleIndex, props.config.handle, self);           
        }

        document.addEventListener('mousedown', handleDocumentClick);  

        return () => { 
            document.removeEventListener('mousedown', handleDocumentClick);
        };        

    }, []);  
    
    useEffect(() => {

        if (behave == "flatlist") {
            setState((prevState) => {
                return { ...prevState, active: true };
            });
        } 

    }, [state.records]);

    let _placeholder = props.config.placeholder; 
    
    if ((state.source.length > 0 && state.selectedRecords.length === state.source.length) || mode == "all") {
        _placeholder = "All "+ _placeholder;
    } else if (state.selectedRecords.length > 0) {
        _placeholder = (state.selectedRecords.length +" "+ props.config.placeholder +" selected");
    }

    const dropdownClass = state.active ? props.config.popup_class + " visible" : props.config.popup_class;

    return (
        <>
            {(behave == "popup" && state.active) ? <div className="pharmarack-cms-multi-select-backdrop">{renderWidget()}</div> : renderWidget()}
        </>
    );

};

export default forwardRef(MultiSelect);