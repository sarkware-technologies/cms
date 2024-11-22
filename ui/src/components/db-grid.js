import React, { useState, useEffect, forwardRef, useImperativeHandle, createRef } from "react";

const DbGrid = (props, ref) => {

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

    TableHeader = () => {
        return (<thead><tr>{columns.map((col) => (<th key={col}>{col}</th>))}</tr></thead>);
    };

    TableRecord = () => {
        rows.push(
            <tr key={uuidv4()}>
            { 
                state.columns.map((item, index) => { 

                })
            }
            </tr>
        );
    };

    TableRecords = () => {
        if (state.records && state.records.length > 0) {
            widget = <tbody key={uuidv4()} id="pharmarack-cms-data-grid-record-body">{records.map((item, index) => <TableRecord key={index} serial={((index + 1) + ((state.currentPage - 1) * state.recordsPerPage))} record={item} />)}</tbody>;                
        } else {
            let msg = "No record found.!";
            if (props.config.empty_message) {
                msg = props.config.empty_message;
            }     
            msg = access ? msg : "Read access forbidden.!";  
            widget = <tbody key={uuidv4()} id="pharmarack-cms-data-grid-record-body"><tr><td colSpan={state.headers.length}><h2 className={`pharmarack-cms-data-grid-no-record ${ access ? "" : "access-restricted" }`}>{msg}</h2></td></tr></tbody>;
        }

        return widget;
    }

    fetchRecords = async () => {

        let endPoint = props.endPoint;
        const request = {
            method: "GET"
        };

        if (endPoint.indexOf("?") !== -1) {
            endPoint = endPoint +"&page="+ state.currentPage;        
        } else {
            endPoint = endPoint +"?page="+ state.currentPage;        
        }

        request["endpoint"] = props.endPoint;

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
            let _records = _res.payload;

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
                totalPages: _res.totalPages,       
                recordsPerPage: _res.recordPerPage, 
                headers: _headers,
                currentRecord: {},                     
            }));

        } catch (e) {
            console.log(e);
        }

    };

    useEffect(() => {            
        fetchRecords();
    }, [state.currentPage]);

    return ( 
        <div className={`pharmarack-cms-data-table-container ${props.config.handle}`}>
            <table style={cssProps} className="pharmarack-cms-data-table">
                <TableHeader headers={state.headers} lastSearch={lastSearchForRef.current} />
                <TableRecords records={state.records} access={props.access} />      
            </table>           
            <Paginator />     
        </div>      
    ); 

    return (
        <div>
        <table border="1" width="100%" style={{ borderCollapse: "collapse" }}>
            <thead>
            <tr>
                {columns.map((col) => (
                <th key={col}>{col}</th>
                ))}
            </tr>
            </thead>
            <tbody>
            {paginatedRows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                {columns.map((col) => (
                    <td key={col}>{row[col]}</td>
                ))}
                </tr>
            ))}
            </tbody>
        </table>

        {/* Pagination Controls */}
        <div style={{ marginTop: "10px", textAlign: "center" }}>
            <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            >
            Previous
            </button>
            <span style={{ margin: "0 10px" }}>
            Page {currentPage} of {totalPages}
            </span>
            <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            >
            Next
            </button>
            <select
            value={pageSize}
            onChange={(e) => {
                setPageSize(parseInt(e.target.value, 10));
                setCurrentPage(1); // Reset to first page
            }}
            >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            </select>
        </div>
        </div>
    );

};

export default forwardRef(DbGrid);