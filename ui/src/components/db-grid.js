import React, { useState, useEffect, forwardRef, useImperativeHandle, createRef } from "react";
import { v4 as uuidv4 } from 'uuid';

const DbGrid = (props, ref) => {

    const contextObj = window._controller.getCurrentModuleInstance();

    const [state, setState] = useState({
        records: [],
        headers: [],
        progress: false,
        currentPage: 1,
        totalPages: 0,       
        recordsPerPage: 25
    });

    const lastSearchForRef = createRef(null);
    const [rows, setRows] = useState([]);
    const [columns, setColumns] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [message, setMessage] = useState("No record found.!");

    useImperativeHandle(ref, () => ({
        loadRecords: (_records) => {
            if (Array.isArray(_records) && _records.length > 0) {
                // Set rows
                setRows(_records);
                // Dynamically create columns based on the keys of the first record
                setColumns(Object.keys(_records[0]));
            }
        },
    }));

    const TableHeader = () => {console.log(state.headers);
        return (<thead><tr>{state.headers.map((item) => (<th key={uuidv4()}>{item.column}</th>))}</tr></thead>);
    };

    const TableRecord = (props) => { 

        const rows = [];
        rows.push(<tr key={uuidv4()}>{ state.headers.map((item, index) => <td key={uuidv4()}>{props.record[item.column]}</td>) }</tr>);
        return rows;

    };

    const TableRecords = () => {

        if (state.records && state.records.length > 0) {
            return <tbody key={uuidv4()} id="pharmarack-cms-data-grid-record-body">{state.records.map((item, index) => <TableRecord key={index} serial={((index + 1) + ((state.currentPage - 1) * state.recordsPerPage))} record={item} />)}</tbody>;                
        } else {            
            return <tbody key={uuidv4()} id="pharmarack-cms-data-grid-record-body"><tr><td colSpan={state.headers.length}><h2 className={`pharmarack-cms-data-grid-no-record`}>{message}</h2></td></tr></tbody>;
        }

    }

    const fetchRecords = async () => {  console.log("fetchRecords is called");

        let currentResource = null
        if (contextObj.component.dbExplorerRef.current) {
            currentResource = contextObj.component.dbExplorerRef.current.getCurrentResource();            
        }

        if (currentResource) {

            setMessage("Loading... pls wait.!");

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

            setState((prevState) => ({...prevState, progress: false}));

            try {

                const _res = await window._controller.docker.dock(request);
                let _records = _res.records;

                let _headers = [];
                if (_records.length > 0) {
                    const _columns = _records[0];
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
                    totalPages: _res.totalRecords,       
                    recordsPerPage: _res.pageSize, 
                    headers: _headers,
                    currentRecord: {},                     
                }));

            } catch (e) {
                console.log(e);
            }

        } else {
            setMessage("Select a table from the selector window");
        }

    };

    useEffect(() => {          
        console.log(state);
    }, [state]);

    useEffect(() => {  
        
        if (props.handle == "selectorGrid") {
            /* This is for showing selected table records */
            fetchRecords();
        } else {
            /* This is for showing query result */

        }
        
    }, [state.currentPage]);

    return ( 
        <div className={`pharmarack-cms-data-table-container ${props.handle}`}>
            <table className="pharmarack-cms-data-table">
                <TableHeader headers={state.headers} lastSearch={lastSearchForRef.current} />
                <TableRecords records={state.records} />      
            </table>           
              
        </div>      
    ); 

};

export default forwardRef(DbGrid);