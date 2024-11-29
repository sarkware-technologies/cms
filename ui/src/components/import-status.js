import React, { forwardRef, useEffect, useState } from "react";

const ImportStatus = (props, ref) => {

    let refreshTimer = null;
    const contextObj = window._controller.getCurrentModuleInstance(); 

    const [state, setState] = useState({
        completedBatch: 0,
        totalBatch: 18,
        totalRecords: 17499,
        recordsPerBatch: 1000,
        elapsedTime: "",
        startTime: "",
        endTime: "",
        status: false
    });

    const refreshBuildStatus = () => {

        let type = "";
        if (props.importer == contextObj.ImportType.ORDER_IMPORTER) {
            type = "order";
        } else if (props.importer == contextObj.ImportType.RETAILER_IMPORTER) {
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
                      completedBatch: _res.progressStatus.completedBatch,
                      totalBatch: _res.progressStatus.totalBatch,
                      totalRecord: _res.progressStatus.totalRecord,
                      recordsPerBatch: _res.progressStatus.recordsPerBatch,
                      elapsedTime: _res.progressStatus.elapsedTime,
                      startTime: _res.progressStatus.status ? _res.progressStatus.startTime : "",
                      endTime: _res.progressStatus.endTime ? _res.progressStatus.endTime : (_res.progressStatus.status ? "In Progress" : ""),
                      status: _res.progressStatus.status
                  });

                  /* If the status is completed, then stop the refresh timer too */
                  if (!_res.progressStatus.status && refreshTimer) {
                      clearInterval(refreshTimer);
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

export default forwardRef(ImportStatus);
