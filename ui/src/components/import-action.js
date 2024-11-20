import React, {forwardRef, useImperativeHandle, useEffect, useState} from "react";

const ImportAction = (props, ref) => { 

    const [recordsPerBatch, setRecordsPerBatch] = useState(1000);
    const [recordIdsPerBatch, setRecordIdsPerBatch] = useState(25000);    
    const [maxThreads, setMaxThreads] = useState(10);
    const [chunkSize, setChunkSize] = useState(100);

    const startProcess = () => {
        console.log("Starting process with configuration:");
        console.log(`Records per Batch: ${recordsPerBatch}`);
        console.log(`Record IDs per Batch: ${recordIdsPerBatch}`);
        console.log(`Max Threads: ${maxThreads}`);
        console.log(`Chunk Size: ${chunkSize}`);
        alert("Process started!");
    };
    
    const resetDefaults = () => {
        setRecordsPerBatch(500);
        setRecordIdsPerBatch(12500);
        setMaxThreads(10);
        setChunkSize(2500);
    };

    return (
        <div className="pharmarack-cms-batch-config-step-container">

          <form>
            
            <div className="pharmarack-cms-config-step">
              <div className="pharmarack-cms-step-header">
                <h3>Max Threads</h3>
                <span className="pharmarack-cms-step-value">{maxThreads}</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                value={maxThreads}
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
                value={chunkSize}
                onChange={(e) => setChunkSize(e.target.value)}
              />              
            </div>
    
          </form>
        </div>
      );

}

export default forwardRef(ImportAction);