import React, {useState, forwardRef, useImperativeHandle} from "react";
import { v4 as uuidv4 } from 'uuid';

const VersionResult = (props) => {

    const [results, setResults] = useState(props.results);

    return (
        <div className="pharmarack-cms-version-result-container">
            {results.map((result) => {
                return (<p key={uuidv4()} className={`${result.status ? "success" : "error"}`}>{result.message}</p>)
            })}
        </div>
    );

};

export default VersionResult;