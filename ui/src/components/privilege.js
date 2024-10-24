import React, {useState, useEffect, forwardRef, useImperativeHandle, createRef} from "react";

const Privilege = (props, ref) => {

    const [privileges, setPrivileges] = useState([]);
    const [assigned, setAssigned] = useState([]);

    const self = {};

    /* Expose the component to the consumer */
    useImperativeHandle(ref, () => self);

    const fetchPrivileges = () => {

        const request = {
            method: "GET",
            endpoint: "/system/role/"+ props.roleId+"/privileges"
        }

        window._controller.docker.dock({
            method: "GET",
            endpoint: "/system/role/"+ props.roleId+"/privileges"
        }).then((_res) => {
            const _assigned = [];
            for (let i =0 ; i < _res.payload.assigned.length; i++) {
                _assigned.push(_res.payload.assigned[i].privilege);
            }
            setPrivileges(_res.payload.privileges);                
            setAssigned(_assigned); 
        })
        .catch((e) => {
            console.log(e);
        });

    }

    const handlePrivilegeChange = (_e) => {

        const request = {endpoint: "/system/role/"+ props.roleId+"/privileges"}
        request["payload"] = {privilege: _e.target.value}

        if (_e.target.checked) {
            request["method"] = "POST";
        } else {
            request["method"] = "DELETE";
        }   
        
        window._controller.docker.dock(request).then((_res) => {
            const _assigned = [];
            for (let i =0 ; i < _res.assigned.length; i++) {
                _assigned.push(_res.assigned[i].privilege);
            }
            setPrivileges(_res.privileges);                
            setAssigned(_assigned);  
        })
        .catch((e) => {
            console.log(e);
        });

    }

    const renderPrivileges = () => { console.log("render privileges called");

        if (!privileges) {
            return <p>Loading privileges...</p>;
        }
        
        if (privileges.length === 0) {
            return <p>No privileges available.</p>;
        }
        
        return privileges.map((_record, _index) => {
            return (
                <label key={_record._id}>
                <input
                  type="checkbox"
                  onChange={handlePrivilegeChange}
                  value={_record._id}
                  checked={ assigned.includes(_record._id)}
                />{" "}
                {_record.handle}
              </label>
              
            );
        });     
    }

    useEffect(() => {            
        fetchPrivileges();
    }, []);

    return (

        <div className="pharmarack-cms-menu-pool-container privilege">

            <div className="pharmarack-cms-menu-pool-header">

                <div className="pharmarack-cms-menu-config-header">
                    <h1>Privilege Configuration</h1>
                    <p>Define privileges for the role</p>
                </div>

            </div>

            <div className="pharmarack-cms-menu-pool-content">
                <div className="pharmarack-cms-privilege-container" data-length={privileges?privileges.length:0}>{renderPrivileges()}</div>
            </div>
        
        </div>

    );

}

export default forwardRef(Privilege);