import React, {forwardRef, useImperativeHandle, useEffect, useState} from "react";

const SegmentAction = (props, ref) => { 

    const [recordsPerBatch, setRecordsPerBatch] = useState(1000);    
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
          maxThread,
          chunkSize          
        }
      }
  };

  useImperativeHandle(ref, () => self);

    return (
        <div className="pharmarack-cms-batch-config-step-container">

          <form>
            
            <div className="pharmarack-cms-config-step">
              <div className="pharmarack-cms-step-header">
                <h3>Max Threads</h3>
                <span className="pharmarack-cms-step-value">{maxThread}</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="1"
                value={maxThread}
                onChange={(e) => setMaxThreads(e.target.value)}
              />              
            </div>

            <div className="pharmarack-cms-config-step">
              <div className="pharmarack-cms-step-header">
                <h3>Records per Batch</h3>
                <span className="pharmarack-cms-step-value">{recordsPerBatch}</span>
              </div>
              <input
                type="range"
                min="1"
                max="2000"
                step="1"
                value={recordsPerBatch}
                onChange={(e) => setRecordsPerBatch(e.target.value)}
              />              
            </div>    
            
            <div className="pharmarack-cms-config-step">
              <div className="pharmarack-cms-step-header">
                <h3>Chunk Size</h3>
                <span className="pharmarack-cms-step-value">{chunkSize}</span>
              </div>
              <input
                type="range"
                min="1"
                max="500"
                step="100"
                value={chunkSize}
                onChange={(e) => setChunkSize(e.target.value)}
              />              
            </div>
    
          </form>
        </div>
      );

}

export default forwardRef(SegmentAction);