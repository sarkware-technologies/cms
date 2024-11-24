import React, { useState, useEffect, forwardRef, useImperativeHandle, createRef, memo } from "react";
import { v4 as uuidv4 } from 'uuid';

const DbGrid = (props, ref) => {

    const contextObj = window._controller.getCurrentModuleInstance();

    const [state, setState] = useState({
        records: [],
        headers: [],
        progress: false,
        currentPage: 1,
        totalPages: 0,     
        totalRecords: 0,  
        recordsPerPage: 25,
        elapsed: 0,
        message: (props.handle == "selectorGrid") ? "Select a table from the selector window" : "Enter your query and click on the Execute button"
    });

    const lastSearchForRef = createRef(null);
    const [rows, setRows] = useState([]);
    const [columns, setColumns] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);    

    useImperativeHandle(ref, () => ({
        executeQuery: executeQuery,
        loadRecords: (_records) => {
            if (Array.isArray(_records) && _records.length > 0) {
                // Set rows
                setRows(_records);
                // Dynamically create columns based on the keys of the first record
                setColumns(Object.keys(_records[0]));
            }
        },
    }));

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

    const TableHeader = () => {
        return (<thead><tr>{state.headers.map((item) => (<th key={uuidv4()}>{item.column}</th>))}</tr></thead>);
    };

    const TableRecord = (props) => { 

        const rows = [];
        rows.push(<tr key={uuidv4()}>{ state.headers.map((item, index) => <td key={uuidv4()}>{ (item.column != "#") ? props.record[item.column] : props.serial }</td>) }</tr>);
        return rows;

    };

    const TableRecords = () => {

        if (!state.message && state.records && state.records.length > 0) {
            return <tbody key={uuidv4()} id="pharmarack-cms-data-grid-record-body">{state.records.map((item, index) => <TableRecord key={index} serial={((index + 1) + ((state.currentPage - 1) * state.recordsPerPage))} record={item} />)}</tbody>;                
        } else {            
            return <tbody key={uuidv4()} id="pharmarack-cms-data-grid-record-body"><tr><td colSpan={state.headers.length}><h2 className={`pharmarack-cms-data-grid-no-record`}>{state.message}</h2></td></tr></tbody>;
        }

    };

    const Paginator = memo(() => {
        
        const pages = []; 
        let disableClass, currentPageClass; 
        
        const maxPagesToShow = 9;
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

            return <div className={`pharmarack-cms-data-table-paginator db-explorer-grid ${state.progress ? "disabled" : ""}`}>{pages}</div>;

        }

        return null;

    });

    const executeQuery = async () => {

        const queryText = contextObj.getField("db_query_view_query");
        if (queryText) {

            setState((prevState) => ({
                ...prevState,
                message: "Executing... pls wait.!"
            }));            

            const request = {
                method: "POST",
                endpoint: "/system/v1/query_browser/executeSnippet",
                payload: { query: queryText.getVal()}
            };

            await dock(request);

        }

    };

    const fetchRecords = async () => {

        let currentResource = null
        if (contextObj.component.dbExplorerRef.current) {
            currentResource = contextObj.component.dbExplorerRef.current.getCurrentResource();            
        }

        if (currentResource) {

            setState((prevState) => ({
                ...prevState,
                progress: true,
                message: "Loading... pls wait.!"
            }));            

            let endPoint = "/system/v1/query_browser/selectResource?tableName="+ currentResource;
            const request = {
                method: "GET"
            };

            if (endPoint.indexOf("?") !== -1) {
                endPoint = endPoint +"&page="+ state.currentPage;        
            } else {
                endPoint = endPoint +"?page="+ state.currentPage;        
            }

            request["endpoint"] = endPoint;

            let lastSearchFrom = null;
            for (let i = 0; i < state.headers.length; i++) {
                if (state.headers[i].search) {
                    lastSearchFrom = state.headers[i].field.handle;
                }
            }        

            if (lastSearchFrom) {
                endPoint += "&field="+ lastSearchFrom +"&search="+ lastSearchForRef.current;
            } 

            await dock(request, currentResource);

        } else {
            setState((prevState) => ({
                ...prevState,
                message: "Select a table from the selector window"
            }));            
        }

    };

    const fetchSchema = async () => {

        let currentResource = null
        if (contextObj.component.dbExplorerRef.current) {
            currentResource = contextObj.component.dbExplorerRef.current.getCurrentResource();            
        }

        if (currentResource) {

            setState((prevState) => ({
                ...prevState,
                progress: true,
                message: "Loading... pls wait.!"
            }));            

            const request = {
                method: "GET",
                endpoint: "/system/v1/query_browser/resourceStructure?tableName="+ currentResource
            };

            await dock(request, currentResource);

        } else {
            setState((prevState) => ({
                ...prevState,
                message: "Select a table from the selector window"
            }));            
        }

    };

    const dock = async (_request, currentResource) => {

        try {

            const _res = await window._controller.docker.dock(_request);
            let _records = _res.records;

            let _headers = [];
            if (_records.length > 0) {
                const _columns = _records[0];
                _headers = [{column: "#", searchable: false}];
                Object.keys(_records[0]).forEach((item) => {
                    _headers.push({
                        column: item,
                        searchable: false
                    })
                });
            }
            
            setState((prevState) => ({
                ...prevState, 
                progress: false,
                records: _records,
                totalPages: Math.ceil(_res.totalRecords / _res.pageSize),       
                recordsPerPage: _res.pageSize, 
                headers: _headers,
                currentRecord: {},
                totalRecords: _res.totalRecords,
                elapsed: _res.elapsed,
                message: _records.length > 0 ? "" : ("No records found for "+ (currentResource ? currentResource : " the query"))                  
            }));

        } catch (e) {            
            window._controller.notify(e.message, "error");
            setState((prevState) => ({
                ...prevState, 
                progress: false,  
                currentPage: 1,
                totalPages: 0,     
                totalRecords: 0,  
                recordsPerPage: 25,
                elapsed: 0,              
                message: e.message                  
            }));
        }

    };

    useEffect(() => {
        if (props.handle == "selectorGrid") {
            /* This is for showing selected table records */
            fetchRecords();
        } else if (props.handle == "schemaGrid") {
            fetchSchema();
        }
    }, [state.currentPage]);

    return ( 
        <div className={`pharmarack-cms-data-table-container ${props.handle}`}>
            <div className="table-wrapper">
                <table className={`pharmarack-cms-data-table ${state.records.length > 0 ? "loaded" : "empty"}`}>
                    <TableHeader headers={state.headers} lastSearch={lastSearchForRef.current} />
                    <TableRecords records={state.records} />      
                </table>           
            </div>
            <Paginator />
            <div className="pharmarack-cms-db-explorer-result">
                <p>{`Total record : ${state.totalRecords}`}</p>
                <p>{`It took : ${state.elapsed}`}</p>
            </div>
        </div>      
    ); 

};

export default forwardRef(DbGrid);