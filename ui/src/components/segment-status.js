import React, { forwardRef, useEffect, useState, useImperativeHandle } from "react";

const SegmentStatus = (props, ref) => {

  let refreshTimer = null;
  const contextObj = window._controller.getCurrentModuleInstance(); 

  const [state, setState] = useState({
    completedBatches: 0,
    totalBatches: 18,
    totalRecords: 17499,
    recordsPerBatch: 1000,
    elapsedTime: "",
    startTime: "",
    endTime: "",
    status: false
  });

  const refreshBuildStatus = () => {

      const request = {
        method: "GET",
        endpoint: `/segmentation/v1/segment/${props.segmentId}/build/status`,
      };

      window._controller.docker
      .dock(request)
      .then((_res) => {

            if (_res.status) {
                setState({
                    completedBatch: _res.buildStatus.completedBatch,
                    totalBatch: _res.buildStatus.totalBatch,
                    totalRecord: _res.buildStatus.totalRecord,
                    recordsPerBatch: _res.buildStatus.recordsPerBatch,
                    elapsedTime: _res.buildStatus.elapsedTime,
                    startTime: _res.buildStatus.startTime ? _res.buildStatus.startTime : "",
                    endTime: _res.buildStatus.endTime ? _res.buildStatus.endTime : (_res.buildStatus.status ? "In Progress" : ""),
                    status: _res.buildStatus.status
                });

                /* If the status is completed, then stop the refresh timer too */                
                if (!_res.buildStatus.status && refreshTimer) {
                    clearInterval(refreshTimer);
                    /* Let the context know that the build is completed */
                    if (contextObj && contextObj.onSegmentBuildCompleted) {
                        contextObj.onSegmentBuildCompleted(props.segmentId);
                    }
                }

                /* Also if the nuild progress is running and timer is not active then start */
                if (_res.buildStatus.status && !refreshTimer) {
                    refreshTimer = setInterval(() => {
                        refreshBuildStatus();
                    }, 10000);
                }

            } else {
                setState({
                    completedBatch: 0,
                    totalBatch: 0,
                    totalRecord: 0,
                    recordsPerBatch: 0,
                    elapsedTime: "",
                    startTime: "",
                    endTime: "",
                    status: false
                });
            }
        
      })
      .catch((e) => {
          window._controller.notify(e.message, "error");
          /* Since some error, remove the timer */
          if (refreshTimer) {
              clearInterval(refreshTimer);
          }
      });

  };

  const self = {        
    startRefreshingTimer: () => {
        if (!refreshTimer) {
          refreshTimer = setInterval(() => {
            refreshBuildStatus();
          }, 10000);
        }
    }
  };

  useImperativeHandle(ref, () => self);

  useEffect(() => {
    // Refresh immediately on mount
    refreshBuildStatus();

    // Set up interval to refresh every 10 seconds
    refreshTimer = setInterval(() => {
      refreshBuildStatus();
    }, 10000);

    // Cleanup interval on component unmount
    return () => {
      clearInterval(refreshTimer);
    };
  }, [props.segmentId]); // Re-run effect if segmentId changes

  const progress = state.totalBatch > 0 ? ((state.completedBatch / state.totalBatch) * 100) : 0;

  return (
    <div className="pharmarack-cms-segment-progress-card">
      <div className="pharmarack-cms-progress-section">
        <div className="pharmarack-cms-progress-bar-container">
          <div
            className="pharmarack-cms-progress-bar"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p>
          <span>{state.completedBatch}</span> /{" "}
          <span>{state.totalBatch}</span> batches completed
        </p>
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
          <span>Elapsed Time:</span>
          <strong>{state.elapsedTime}</strong>
        </div>
        <div className="pharmarack-cms-metric">
          <span>Start Time:</span>
          <strong>{state.startTime}</strong>
        </div>
        <div className="pharmarack-cms-metric">
          <span>End Time:</span>
          <strong>{state.endTime}</strong>
        </div>
      </div>
    </div>
  );
};

export default forwardRef(SegmentStatus);
