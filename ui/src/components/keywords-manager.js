import React, {useState, forwardRef, useImperativeHandle} from "react";

const KeywordManager = (props, ref) => {

    const [keywords, setKeywords] = useState(props.keywords);
    const [inputValue, setInputValue] = useState("");    

    const handleAddKeyword = (e) => {
        if (e.key === "Enter" && inputValue.trim()) {
            setKeywords((prev) => [...new Set([...prev, inputValue.trim()])]);
            setInputValue("");
        }
    };

    const handleRemoveKeyword = (keyword) => {
        setKeywords((prev) => prev.filter((item) => item !== keyword));
    };

    const handleCSVUpload = (e) => {

        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;
                const newKeywords = text
                .split(",")
                .map((line) => line.trim())
                .filter((line) => line);

                setKeywords((prev) => [...new Set([...prev, ...newKeywords])]);
            };
            reader.readAsText(file);

            e.target.value = "";
        }

    };

    const self = {
        setVal: (_keywords) => setKeywords(_keywords),
        getVal: () => keywords
    };

    /* Expose the component to the consumer */
    useImperativeHandle(ref, () => self);  

    return (

        <div className="pharmarack-cms-keyword-container">

            <label htmlFor="keywords">
                Keywords <span>*</span>
            </label>

            <div style={{  }} className="pharmarack-cms-keyword-header">
                <input
                    type="text"
                    id="keywords"
                    placeholder="Type and enter"
                    value={inputValue}
                    className="pharmarack-cms-keyword-input"
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleAddKeyword}                    
                />
                <label htmlFor="csvUpload">
                    CSV Upload
                </label>
                <input
                    type="file"
                    id="csvUpload"
                    accept=".csv"
                    style={{ display: "none" }}
                    onChange={handleCSVUpload}
                />
            </div>

            <div className="pharmarack-cms-keyword-content">
                {keywords.map((keyword, index) => (
                <div key={index}>
                    <span>{keyword}</span>
                    <button onClick={() => handleRemoveKeyword(keyword)}>&times;</button>
                </div>
            ))}
            </div>
        </div>

    );

}

export default forwardRef(KeywordManager);