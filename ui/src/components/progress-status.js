import React, { forwardRef, useEffect, useState, useImperativeHandle } from "react";

const SegmentStatus = (props, ref) => {

    let timer = null;
    const contextObj = window._controller.getCurrentModuleInstance();

    const [state, setState] = useState({
        completedBatch: 0,
        totalBatch: 18,
        totalRecord: 17499,
        recordsPerBatch: 1000,
        elapsedTime: "",
        startTime: "",
        endTime: "",
        status: false
    });

    const displayProgressStatus = (_res) => {        

        if (_res.status) {

            if (_res.progressStatus.status) {
                setState({
                    completedBatch: _res.progressStatus.completedBatch,
                    totalBatch: _res.progressStatus.totalBatch,
                    totalRecord: _res.progressStatus.totalRecord,
                    recordsPerBatch: _res.progressStatus.recordsPerBatch,
                    elapsedTime: _res.progressStatus.elapsedTime,
                    startTime: _res.progressStatus.startTime,
                    endTime: _res.progressStatus.endTime ? _res.progressStatus.endTime : "In Progress",
                    status: _res.progressStatus.status
                });
            }

            if (!_res.progressStatus.status && timer) {
                clearTimeout(timer);
            }

        } 
        
        if (!_res.status || (!_res.progressStatus.status && _res.progressStatus.currentBatch == 0)) {
            setState({
                completedBatch: 0,
                totalBatch: 0,
                totalRecord: 0,
                recordsPerBatch: 0,
                elapsedTime: "Not available",
                startTime: "Yet to start",
                endTime: "Yet to start",
                status: false
            });
        }
        
    };

    const fetchProgressStatus = () => {

        const request = {
            method: "GET",
            endpoint: props.endPoint,
        };

        window._controller.docker
        .dock(request)
        .then((_res) => {
            displayProgressStatus(_res);
            if (contextObj && contextObj.onProgressStatus) {
                contextObj.onProgressStatus(props.task, _res);
            }
        })
        .catch((e) => {
            console.log(e);
        });

    };

    useEffect(() => {        

        const request = {
            method: "GET",
            endpoint: props.endPoint,
        };

        window._controller.docker
        .dock(request)
        .then((_res) => {

            if (_res.status) {

                /* We have received a valid status response */
                if (_res.progressStatus.status) {
                    /* This means the task is running
                        hence start the timer for refreshing the status */
                      timer = setInterval(() => {
                          fetchProgressStatus();
                      }, 10000);
                }

            }
            displayProgressStatus(_res);

        })
        .catch((e) => {
            window._controller.notify(e.message, "error");
        });

        // Cleanup interval on component unmount
        return () => {
            if (timer) {
                clearInterval(timer);
            }            
        };

    }, []); 

    const progress = state.totalBatch > 0 ? ((state.completedBatch / state.totalBatch) * 100) : 0;

    const self = {

        startRefresh: () => {
            timer = setInterval(() => {
                fetchProgressStatus();
            }, 10000);
        }

    };
    /* Expose the component to the consumer */
    useImperativeHandle(ref, () => self);

    return (
        <div className="pharmarack-cms-segment-progress-card">

            <div className="pharmarack-cms-progress-section">
                <div className="pharmarack-cms-progress-bar-container">
                    <div className="pharmarack-cms-progress-bar" style={{ width: `${progress}%` }}></div>
                </div>
                <p><span>{state.completedBatch}</span> / <span>{state.totalBatch}</span> batches completed</p>
            </div>

            <div className="pharmarack-cms-metrics-section">

                <div className="pharmarack-cms-metric">
                    <span>Total Records:</span>
                    <strong>{state.totalRecord}</strong>
                </div>
                <div className="pharmarack-cms-metric">
                    <span>Records Per Batch:</span>
                    <strong>{state.recordsPerBatch}</strong>
                </div>
                <div className="pharmarack-cms-metric">
                    <span>Start Time:</span>
                    <strong>{state.startTime}</strong>
                </div>
                <div className="pharmarack-cms-metric">
                    <span>End Time:</span>
                    <strong>{state.endTime}</strong>
                </div>
                <div className="pharmarack-cms-metric">
                    <span>Elapsed Time:</span>
                    <strong>{state.elapsedTime}</strong>
                </div>

            </div>

        </div>
    );
};

export default forwardRef(SegmentStatus);
