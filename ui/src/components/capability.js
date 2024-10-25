import React, {useState, useEffect, forwardRef, useImperativeHandle, createRef} from "react";

const Capability = (props, ref) => {
    
    const [state, setState] = useState({
        fullStatus: false,
        readStatus: false,
        writeStatus: false,
        updateStatus: false,
        deleteStatus: false
    });

    const [menu, setMenu] = useState([]);
    const [caps, setCaps] = useState([]);
    const [menuCaps, setMenuCaps] = useState({});


    const self = {        
        notify: (_msg, _type) => { setState({msg: _msg, type: _type, visible: true}); }
    };

    /* Expose the component to the consumer */
    useImperativeHandle(ref, () => self);

    const handleFullChange = (_e) => {
        setState({
            ...state, 
            fullStatus: _e.target.checked, 
            readStatus: _e.target.checked, 
            writeStatus: _e.target.checked, 
            updateStatus: _e.target.checked, 
            deleteStatus: _e.target.checked
        });

        const newMenuCaps = {};
        const mKeys = Object.keys(menuCaps);
        for (let i = 0; i < mKeys.length; i++) {
            newMenuCaps[mKeys[i]] = {
                fullStatus: _e.target.checked,
                readStatus: _e.target.checked,
                writeStatus: _e.target.checked,
                updateStatus: _e.target.checked,
                deleteStatus: _e.target.checked,
            }
        }

        setMenuCaps(newMenuCaps);

    }

    const handleFullReadChange = (_e) => {

        if (_e.target.checked && state.writeStatus && state.updateStatus && state.deleteStatus) {
            setState({...state, readStatus: _e.target.checked, fullStatus: true});
        } else {
            setState({...state, readStatus: _e.target.checked, fullStatus: false});
        }
        
        const newMenuCaps = {};
        const mKeys = Object.keys(menuCaps);
        for (let i = 0; i < mKeys.length; i++) {
            newMenuCaps[mKeys[i]] = {
                ...menuCaps[mKeys[i]],
                readStatus: _e.target.checked,
                fullStatus: (_e.target.checked && menuCaps[mKeys[i]].writeStatus && menuCaps[mKeys[i]].updateStatus && menuCaps[mKeys[i]].deleteStatus)
            }
        }

        setMenuCaps(newMenuCaps);

    }

    const handleFullWriteChange = (_e) => {

        if (_e.target.checked && state.readStatus && state.updateStatus && state.deleteStatus) {
            setState({...state, writeStatus: _e.target.checked, fullStatus: true});
        } else {
            setState({...state, writeStatus: _e.target.checked, fullStatus: false});
        }

        const newMenuCaps = {};
        const mKeys = Object.keys(menuCaps);
        for (let i = 0; i < mKeys.length; i++) {
            newMenuCaps[mKeys[i]] = {
                ...menuCaps[mKeys[i]],
                writeStatus: _e.target.checked,
                fullStatus: (_e.target.checked && menuCaps[mKeys[i]].readStatus && menuCaps[mKeys[i]].updateStatus && menuCaps[mKeys[i]].deleteStatus)
            }
        }

        setMenuCaps(newMenuCaps);

    }

    const handleFullUpdateChange = (_e) => {
        
        if (_e.target.checked && state.writeStatus && state.readStatus && state.deleteStatus) {
            setState({...state, updateStatus: _e.target.checked, fullStatus: true});
        } else {
            setState({...state, updateStatus: _e.target.checked, fullStatus: false});
        }    
        
        const newMenuCaps = {};
        const mKeys = Object.keys(menuCaps);
        for (let i = 0; i < mKeys.length; i++) {
            newMenuCaps[mKeys[i]] = {
                ...menuCaps[mKeys[i]],
                updateStatus: _e.target.checked,
                fullStatus: (_e.target.checked && menuCaps[mKeys[i]].readStatus && menuCaps[mKeys[i]].writeStatus && menuCaps[mKeys[i]].deleteStatus)
            }
        }

        setMenuCaps(newMenuCaps);
        
    }

    const handleFullDeleteChange = (_e) => {
        
        if (_e.target.checked && state.writeStatus && state.readStatus && state.updateStatus) {
            setState({...state, deleteStatus: _e.target.checked, fullStatus: true});
        } else {
            setState({...state, deleteStatus: _e.target.checked, fullStatus: false});
        }

        const newMenuCaps = {};
        const mKeys = Object.keys(menuCaps);
        for (let i = 0; i < mKeys.length; i++) {
            newMenuCaps[mKeys[i]] = {
                ...menuCaps[mKeys[i]],
                deleteStatus: _e.target.checked,
                fullStatus: (_e.target.checked && menuCaps[mKeys[i]].readStatus && menuCaps[mKeys[i]].writeStatus && menuCaps[mKeys[i]].updateStatus)
            }
        }

        setMenuCaps(newMenuCaps);

    }

    const handleSingleCapChange = (_e, _mid) => {
        setMenuCaps((prevCaps) => ({
          ...prevCaps,
          [_mid]: {
            ...prevCaps[_mid],
            fullStatus: _e.target.checked,
            readStatus: _e.target.checked,
            writeStatus: _e.target.checked,
            updateStatus: _e.target.checked,
            deleteStatus: _e.target.checked,
          },
        }));
      };

    const handleSingleReadChange = (_e, _mid) => {        

        setMenuCaps((prevCaps) => ({
            ...prevCaps,
            [_mid]: {
                ...prevCaps[_mid],
                readStatus: _e.target.checked,
                fullStatus: (_e.target.checked && prevCaps[_mid].writeStatus && prevCaps[_mid].updateStatus && prevCaps[_mid].deleteStatus)
            },
        }));       

    }

    const handleSingleWriteChange = (_e, _mid) => {

        setMenuCaps((prevCaps) => ({
            ...prevCaps,
            [_mid]: {
                ...prevCaps[_mid],
                writeStatus: _e.target.checked,
                fullStatus: (_e.target.checked && prevCaps[_mid].readStatus && prevCaps[_mid].updateStatus && prevCaps[_mid].deleteStatus)
            },
        }));

    }

    const handleSingleUpdateChange = (_e, _mid) => {

        setMenuCaps((prevCaps) => ({
            ...prevCaps,
            [_mid]: {
                ...prevCaps[_mid],
                updateStatus: _e.target.checked,
                fullStatus: (_e.target.checked && prevCaps[_mid].readStatus && prevCaps[_mid].writeStatus && prevCaps[_mid].deleteStatus)
            },
        }));

    }

    const handleSingleDeleteChange = (_e, _mid) => {

        setMenuCaps((prevCaps) => ({
            ...prevCaps,
            [_mid]: {
                ...prevCaps[_mid],
                deleteStatus: _e.target.checked,
                fullStatus: (_e.target.checked && prevCaps[_mid].readStatus && prevCaps[_mid].writeStatus && prevCaps[_mid].updateStatus)
            },
        }));

    }

    const updateCapabilities = () => {

        const mKeys = Object.keys(menuCaps);
        let uC = JSON.parse(JSON.stringify(caps));

        for (let i = 0; i < uC.length; i++) {
            for (let j = 0; j < mKeys.length; j++) {
                if (uC[i].module === mKeys[j]) {
                    uC[i].can_read = menuCaps[mKeys[j]].readStatus;
                    uC[i].can_create = menuCaps[mKeys[j]].writeStatus;
                    uC[i].can_update = menuCaps[mKeys[j]].updateStatus;
                    uC[i].can_delete = menuCaps[mKeys[j]].deleteStatus;
                }
            }
        }

        const request = {
            method: "PUT",
            endpoint: "/system/v1/role/"+ props.roleId+"/capabilities"
        }
        request["payload"] = uC;

        window._controller.docker.dock(request)
        .then((_res) => {
            console.log("Updated"); 
        })
        .catch((e) => {
            console.log(e);
        });

    }

    useEffect(() => {

        /* Check for full toggle state */
        let allRead = true;
        let allWrite = true;
        let allUpdate = true;
        let allDelete = true;
        const mKeys = Object.keys(menuCaps);

        if (mKeys.length > 0) {
            /* Update the server */
            updateCapabilities();
            for (let i = 0; i < mKeys.length; i++) {
                if (!menuCaps[mKeys[i]].readStatus) {
                    allRead = false;                
                }
                if (!menuCaps[mKeys[i]].writeStatus) {
                    allWrite = false;                
                }
                if (!menuCaps[mKeys[i]].updateStatus) {
                    allUpdate = false;                
                }
                if (!menuCaps[mKeys[i]].deleteStatus) {
                    allDelete = false;                
                }
            }
        } else {
            allRead = false;
            allWrite = false;
            allUpdate = false;
            allDelete = false;
        }        

        setState((prevState) => ({            
            fullStatus: (allRead && allWrite && allUpdate && allDelete), 
            readStatus: allRead,
            writeStatus: allWrite,
            updateStatus: allUpdate,
            deleteStatus: allDelete
        }));        

    }, [menuCaps]);

    const ToggleBar = (props) => {

        let icon = "";
        if (props.icon) {
            icon = (() => (<i className={props.icon}></i>))();
        }
    

        return (
            <div className="pharmarack-cms-menu-cap-toggle-bar">

                <div className="pharmarack-cms-submenu-title">{icon}{props.label}</div>

                <div className="pharmarack-cms-cap-toggle">
                    <label className="cap-toggle">
                        <input type="checkbox" onChange={(_e) => handleSingleCapChange(_e, props.id)} checked={menuCaps[props.id].fullStatus} />
                        <span className="cap-labels" data-on="F" data-off="F"></span>
                    </label>
                </div>
                <div className="pharmarack-cms-cap-toggle">
                    <label className="cap-toggle">
                        <input type="checkbox" onChange={(_e) => handleSingleReadChange(_e, props.id)} checked={menuCaps[props.id].readStatus} />
                        <span className="cap-labels" data-on="R" data-off="R"></span>
                    </label>
                </div>
                <div className="pharmarack-cms-cap-toggle">
                    <label className="cap-toggle">
                        <input type="checkbox" onChange={(_e) => handleSingleWriteChange(_e, props.id)} checked={menuCaps[props.id].writeStatus} />
                        <span className="cap-labels" data-on="W" data-off="W"></span>
                    </label>
                </div>
                <div className="pharmarack-cms-cap-toggle">
                    <label className="cap-toggle">
                        <input type="checkbox" onChange={(_e) => handleSingleUpdateChange(_e, props.id)} checked={menuCaps[props.id].updateStatus} />
                        <span className="cap-labels" data-on="U" data-off="U"></span>
                    </label>
                </div>
                <div className="pharmarack-cms-cap-toggle">
                    <label className="cap-toggle">
                        <input type="checkbox" onChange={(_e) => handleSingleDeleteChange(_e, props.id)} checked={menuCaps[props.id].deleteStatus} />
                        <span className="cap-labels" data-on="D" data-off="D"></span>
                    </label>
                </div>													
            </div>
        );

    }

    const createCapsStateForMenus = (_caps) => {

        let status = {};        
        let readStatus = true;
        let writeStatus = true;
        let updateStatus = true;
        let deleteStatus = true;

        for (let i = 0; i < _caps.length; i++) {

            if (!_caps[i].can_read) {
                readStatus = false;
            }
            if (!_caps[i].can_create) {
                writeStatus = false;
            }
            if (!_caps[i].can_update) {
                updateStatus = false;
            }
            if (!_caps[i].can_delete) {
                deleteStatus = false;
            }

            status = {
                readStatus: _caps[i].can_read,
                writeStatus: _caps[i].can_create,
                updateStatus: _caps[i].can_update, 
                deleteStatus: _caps[i].can_delete 
            }
            status["fullStatus"] = (_caps[i].can_read && _caps[i].can_create && _caps[i].can_update && _caps[i].can_delete);
            menuCaps[_caps[i].module] = status;
        }

        /* Also update the for header toggle */
        setState({
            ...state, 
            fullStatus: (readStatus && writeStatus && updateStatus && deleteStatus), 
            readStatus: readStatus, 
            writeStatus: writeStatus, 
            updateStatus: updateStatus, 
            deleteStatus: deleteStatus
        });        

    }

    const NestedDataRenderer = ({ data }) => {
        
        const renderNestedData = (nestedData) => {
            if (!nestedData || nestedData.length === 0) {
              return null;
            }        
            return (
              <ul className="pharmarack-cms-cap-menu-ul">
                {nestedData.map((item) => {                     
                    return (
                        <li key={item._id}>                                 
                            <ToggleBar id={item._id} icon={item.icon} label={item.title} /> 
                            {renderNestedData(item.submenu)}
                        </li>
                    )
                })}
              </ul>
            );
        };
      
        return (<div>{renderNestedData(data)}</div>);

      };

    const RenderMenu = (props) => {
        if (!props.menu || props.menu.length === 0) {
            return null;
        }
      
        return (
          <ul>
            {props.menu.map((item) => (
              <li key={item._id}>
                <ToggleBar id={item._id} name={item.name} /> 
                <RenderMenu menu={item.submenu} />                
              </li>
            ))}
          </ul>
        );
    }

    const prepareMenu = (items, parent = null) => {
        const menus = [];
        for (const item of items) {
            if (item.parent === parent) {
                const children = prepareMenu(items, item._id);
                if (children.length) {
                    item.submenu = children;
                }
                menus.push(item);
            }
        }
        return menus;
    };

    const fetchMenu = () => {

        const request = {
            method: "GET",
            endpoint: "/system/v1/role/"+ props.roleId+"/capabilities"
        }

        window._controller.docker.dock(request)
        .then((_res) => {
            setMenu(_res.modules);
            setCaps(_res.capabilities);
            createCapsStateForMenus(_res.capabilities);
        })
        .catch((e) => {
            console.log(e);
        });

    }

    useEffect(() => {            
        fetchMenu();
    }, []);

    return (

        <div className="pharmarack-cms-menu-pool-container">

            <div className="pharmarack-cms-menu-pool-header">

                <div className="pharmarack-cms-menu-config-header">
                    <h1>Menu Configuration</h1>
                    <p>Define menu capabilities for the role</p>
                </div>

                <div className="pharmarack-cms-cap-toggle">
                    <label className="cap-toggle">
                        <input type="checkbox" onChange={(_e) => handleFullChange(_e)} checked={state.fullStatus} />
                        <span className="cap-labels" data-on="Full" data-off="Full"></span>
                    </label>
                </div>
                <div className="pharmarack-cms-cap-toggle">
                    <label className="cap-toggle">
                        <input type="checkbox" onChange={(_e) => handleFullReadChange(_e)} checked={state.readStatus} />
                        <span className="cap-labels" data-on="Read" data-off="Read"></span>
                    </label>
                </div>
                <div className="pharmarack-cms-cap-toggle">
                    <label className="cap-toggle">
                        <input type="checkbox" onChange={(_e) => handleFullWriteChange(_e)} checked={state.writeStatus} />
                        <span className="cap-labels" data-on="Write" data-off="Write"></span>
                    </label>
                </div>
                <div className="pharmarack-cms-cap-toggle">
                    <label className="cap-toggle">
                        <input type="checkbox" onChange={(_e) => handleFullUpdateChange(_e)} checked={state.updateStatus} />
                        <span className="cap-labels" data-on="Update" data-off="Update"></span>
                    </label>
                </div>
                <div className="pharmarack-cms-cap-toggle">
                    <label className="cap-toggle">
                        <input type="checkbox" onChange={(_e) => handleFullDeleteChange(_e)} checked={state.deleteStatus} />
                        <span className="cap-labels" data-on="Delete" data-off="Delete"></span>
                    </label>
                </div>													
            </div>

            <div className="pharmarack-cms-menu-pool-content">
                <div id="pharmarack-cms-role-menu-list">
                
                <NestedDataRenderer data={menu} />

                </div>
            </div>

            <div className="pharmarack-cms-menu-pool-footer">
            
            </div>

        </div>	

    );
}

export default forwardRef(Capability);