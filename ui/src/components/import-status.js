import React, { forwardRef, useEffect, useState } from "react";

const ImportStatus = (props, ref) => {

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

    let type = "";

    if (props.importer == "") {
        type = "order";
    } else if (props.importer == "") {
        type = "retailer";
    } else {
        type = "store";
    }

    const request = {
      method: "GET",
      endpoint: `/segmentation/v1/master_import/${type}/status`,
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
                    startTime: _res.buildStatus.startTime,
                    endTime: _res.buildStatus.endTime ? _res.buildStatus.endTime : "In Progress",
                    status: _res.buildStatus.status
                });
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
      });
  };

  useEffect(() => {
    // Refresh immediately on mount
    refreshBuildStatus();

    // Set up interval to refresh every 10 seconds
    const intervalId = setInterval(() => {
      refreshBuildStatus();
    }, 10000);

    // Cleanup interval on component unmount
    return () => {
      clearInterval(intervalId);
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

export default forwardRef(ImportStatus);