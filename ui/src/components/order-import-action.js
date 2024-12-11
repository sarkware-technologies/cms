import React, {forwardRef, useImperativeHandle, useEffect, useState} from "react";

const ImportAction = (props, ref) => { 

    const [recordsPerBatch, setRecordsPerBatch] = useState(1000);
    const [recordIdsPerBatch, setRecordIdsPerBatch] = useState(25000);    
    const [maxThread, setMaxThreads] = useState(10);
    const [chunkSize, setChunkSize] = useState(100);

    const resetDefaults = () => {
        setRecordsPerBatch(500);
        setRecordIdsPerBatch(12500);
        setMaxThreads(10);
        setChunkSize(2500);
    };

    const self = {        
        getOptions: () => {
          return {
            recordsPerBatch,
            recordIdsPerBatch,
            maxThread,
            chunkSize          
          }
        }
    };

    useImperativeHandle(ref, () => self);

    return (
        <div className="pharmarack-cms-batch-config-step-container">

          <form>

            <div className="pharmarack-cms-importer-action-row one-col">

              <div className="pharmarack-cms-config-step">
                <div className="pharmarack-cms-step-header">
                  <label>Records per Batch</label>
                  <span className="pharmarack-cms-step-value">{recordsPerBatch}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="2000"
                  value={recordsPerBatch}
                  onChange={(e) => setRecordsPerBatch(e.target.value)}
                />              
              </div> 

            </div>

            <div className="pharmarack-cms-importer-action-row two-col">

              <div className="pharmarack-cms-config-step">
                <div className="pharmarack-cms-step-header">
                  <label>Max Threads</label>
                  <span className="pharmarack-cms-step-value">{maxThread}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={maxThread}
                  onChange={(e) => setMaxThreads(e.target.value)}
                />              
              </div>

              <div className="pharmarack-cms-config-step">
                <div className="pharmarack-cms-step-header">
                  <label>Chunk Size</label>
                  <span className="pharmarack-cms-step-value">{chunkSize}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="200"
                  value={chunkSize}
                  onChange={(e) => setChunkSize(e.target.value)}
                />              
              </div>

            </div>
            
            <div className="pharmarack-cms-importer-action-row two-col date-range">
              <div>
                <label>From</label>
                <input type="date" onChange="" />
              </div>     
              <div>
                <label>To</label>
                <input type="date" onChange="" />
              </div>              
            </div>
    
          </form>
        </div>
      );

}

export default forwardRef(ImportAction);