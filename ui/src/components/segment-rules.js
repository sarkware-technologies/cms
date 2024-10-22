import React, {forwardRef, useImperativeHandle, useState, useRef, useEffect} from "react";
import { v4 as uuidv4 } from 'uuid';

const SegmentRule = (props, ref) => {

    const [rules, setRules] = useState([{
        mdmCode: "",
        
    }]);

    const renderRules = () => {
        if (rules.length > 0) {

        } else {
            return (
                <div className="">
                    <table>
                        <tbody>
                            <tr>
                                <td>
                                    <label>Product MDM Code</label>
                                    <input type="text" value={} onChange={} />
                                </td>
                                <td>
                                    <div>
                                        <label><input type="radio" name="pharmarack-cms-segment-rule-type" /> Quantity</label>
                                        <label><input type="radio" name="pharmarack-cms-segment-rule-type" /> Amount</label>
                                    </div>
                                    <div>
                                        <input type="number" value={} onChange={} />
                                        <input type="number" value={} onChange={} />
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            );
        }
    };

    return (
        <div>
            {renderRules()}
            <a href="#"><i className="fa fa-plus"></i> Add more</a>
        </div>
    );

}

export default forwardRef(SegmentRule);