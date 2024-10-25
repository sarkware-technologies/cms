import React, {forwardRef, useImperativeHandle, useEffect, useState} from "react";
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

var designerIsDragging = null;

const Sequencer = (props, ref) => { 

    const designerCanvas = React.createRef(null);
    
    const [componentTypes, setComponentTypes] = useState([]);

    const [sequence, setSequence] = useState([]);

    const [deleteMode, setDeleteMode] = useState({position: "", message: ""});

    const [editMode, setEditMode] = useState({position: "", components: []});

    /* For sortable */  
    let selected = null;

    const self = {
        
    };
    useImperativeHandle(ref, () => self);

    useEffect(() => {
        
        const request = {
            method: "GET",
            endpoint: "/system/v1/api/component/component_type/designer_data?page="+ props.record._id
        };        
        
        window._controller.dock(request, 
            (_req, _res) => {       
                setSequence(_res.page.sequence);                                     
                setComponentTypes(_res.type_list);
            }, 
            (_req, _res) => {
                console.error(_res);
            }
        );
    
        document.addEventListener('dragend', handleDragEndOutsideCanvas);
        return () => {
            document.removeEventListener('dragend', handleDragEndOutsideCanvas);
        };

    }, []);

    const getComponentSequence = () => {

        const idArray = [];
        const bannerItems = document.querySelectorAll('.pharmarack-cms-sequence-item');                

        bannerItems.forEach(item => {    
            /* Better to clear the classes */    
            item.classList.remove("sorted");

            if (item.getAttribute('data-id')) {
                idArray.push(item.getAttribute('data-id'));                        
            }

        });

        if (idArray && Array.isArray(idArray)) {                   
            return {sequence: idArray}
        }

        return null;

    };

    const updateSequence = () => {

        const request = {};
        request["method"] = "PUT";
        request["endpoint"] = "/system/v1/api/page/page/update?id="+ props.record._id;
        request["payload"] = getComponentSequence();                    

        if (request["payload"]) {
            window._controller.dock(request, 
                (_req, _res) => {     console
                    window._controller.notify("Component sequence updated", "info"); 
                    if (_res && _res.sequence) {
                        setSequence(_res.sequence);     
                    }
                }, 
                (_req, _res) => {
                    window._controller.notify(_res, "error");
                }
            );
        }

    };

    const handleItemEdit = (_e, _id) => {

        _e.preventDefault();

        let target = _e.target;
        if (target.tagName.toLowerCase() === 'i') {
            target = target.closest('a.sequence-item-field-edit-btn');
        }

        let pos = target.getAttribute('data-position');

        const request = {
            method: "GET",
            endpoint: "/system/v1/api/component/component/get_page_component?page="+ props.record._id +"&position="+ (_id +"_"+ pos)
        };        
        
        window._controller.dock(request, 
            (_req, _res) => {                       
                if (Array.isArray(_res)) {
                    setEditMode({position: (_id +"_"+ pos), components: _res});
                    return;
                }                
            }, 
            (_req, _res) => {
                console.error(_res);
            }
        );

    };

    const deleteSequenceItem = (_id, _position) => {

        const _sequence = [...sequence];
        let _index = -1;
        const typeIndex = {};

        for (let i = 0; i < _sequence.length; i++) {
            
            if (!typeIndex[_sequence[i]]) {
                typeIndex[_sequence[i]] = 1;
            } else {
                typeIndex[_sequence[i]]++;
            }

            /* Check the position */
            if ((_sequence[i] == _id) && typeIndex[_sequence[i]] == _position) {
                _index = i;
                break;
            }

        }

        if (_index !== -1) {
            _sequence.splice(_index, 1);
        }

        setSequence(_sequence);
        setDeleteMode({position: "", message: ""});

        setTimeout(() => {
            updateSequence();
        }, 750);        

    };

    const handleItemDelete = (_e, _id) => {

        _e.preventDefault();

        let target = _e.target;
        if (target.tagName.toLowerCase() === 'i') {
            target = target.closest('a.sequence-item-delete-btn');
        }

        let pos = target.getAttribute('data-position');
        
        if ((_id +"_"+ pos) != deleteMode.position) {

            const request = {
                method: "GET",
                endpoint: "/system/v1/api/component/component/get_page_component?page="+ props.record._id +"&position="+ (_id +"_"+ pos)
            };        
            
            window._controller.dock(request, 
                (_req, _res) => {                       
                    if (Array.isArray(_res) && _res.length > 0) {
                        setDeleteMode({position: (_id +"_"+ pos), message: (_res.length +" component(s) has been tagged to this position<br/>To continue, click remove button again!")});
                        return;
                    }
                    deleteSequenceItem(_id, pos);
                }, 
                (_req, _res) => {
                    console.error(_res);
                }
            );

        } else {            
            deleteSequenceItem(_id, pos);
        }

    };

    const handleItemDeleteCancel = (_e) => {
        setDeleteMode({position: "", message: ""});
    };

    const handleItemEditCancel = (_e) => {
        setEditMode({position: "", components: []});
    };

    const handleDragEnd = () => {
        
        selected = null;   

        setTimeout(() => {
            updateSequence();
        }, 750);

    };

    const handleDragOver = (_e) => {

        let targetElement = _e.target;
        if (_e.target.className !== "pharmarack-cms-sequence-item") {
            targetElement = _e.target.closest(".pharmarack-cms-sequence-item");
        }

        if (selected) {
            
            if (!selected.classList.contains('sorted')) {
                selected.classList.add('sorted');
            }

            if (isBefore(selected, targetElement)) {
                selected.className 
                targetElement.parentNode.insertBefore(selected, targetElement);
            } else {
                targetElement.parentNode.insertBefore(selected, targetElement.nextSibling);
            }
        }

    };

    const handleDragStart = (_e) => {

        _e.dataTransfer.effectAllowed = 'move';
        _e.dataTransfer.setData('text/plain', null);

        if (_e.target.className !== "pharmarack-cms-sequence-item") {            
            selected = _e.target.closest(".pharmarack-cms-sequence-item");
        } else {
            selected = _e.target;
        }  

    };

    const isBefore = (el1, el2) => {

        let cur

        if (el2.parentNode === el1.parentNode) {
            for (cur = el1.previousSibling; cur; cur = cur.previousSibling) {
                if (cur === el2) return true
            } 
        }

        return false;

    }

    const handleComponentTypeDrop = (_e) => {

        _e.preventDefault();

        /* To avoid the confusion between dragging and sorting */
       
        designerIsDragging = false;
        const dragData = _e.dataTransfer.getData("application/json");
        
        if (dragData) {
            const componentType = JSON.parse(dragData);
            sequence.push(componentType._id);
            const _sequence = [...sequence];
            setSequence(_sequence);           

            setTimeout(() => {
                updateSequence();
            }, 750);

        }

    };

    const handleComponentTypeDragOver = (_e) => {
        _e.preventDefault();
    };

    const handleComponentTypeDragStart = (_e, component) => {

        const newPlaceholder = document.createElement("div");
        newPlaceholder.innerHTML = "Drop Here";
        newPlaceholder.className = "pharmarack-cms-sequence-item placeholder";
        newPlaceholder.id = "type-placeholder";
        designerCanvas.current.appendChild(newPlaceholder);

        _e.dataTransfer.setData("application/json", JSON.stringify(component));

    };

    const handleDragEndOutsideCanvas = () => { 
       
        const placeholder = document.getElementById("type-placeholder");
        if (placeholder) {
            placeholder.remove();            
        }   
      
    };

    const renderSequenceType = (_id, _index) => {

        for (let i = 0; i < componentTypes.length; i++) {
            if (_id == componentTypes[i]._id) {

                if (deleteMode.position == (_id +"_"+ _index)) {
                    return <div className="sequence-remove-alert" dangerouslySetInnerHTML={{ __html: deleteMode.message }}></div>;
                } else if (editMode.position == (_id +"_"+ _index)) {

                    if (editMode.components.length > 0) {
                        const _components = [];
                        for (let i = 0; i < editMode.components.length; i++) {
                            //_components.push(<a href={`/component?id=${editMode.components[i]._id}`} className="sequence-edit-link-btn">{editMode.components[i].title}</a>);
                            _components.push(<Link
                                key={editMode.components[i]._id}
                                to={`/component?id=${editMode.components[i]._id}`}
                                className="sequence-edit-link-btn"
                              >
                                {editMode.components[i].title}
                              </Link>);
                        }
                        return <div className="sequence-edit-link-container">{_components}</div>;
                    } else {
                        return <div className="sequence-edit-empty-alert">No component tagged on this position yet</div>
                    }                    

                } else {
                    return <div><i className={`fa fa-${componentTypes[i].icon}`}></i><span>{componentTypes[i].title}</span></div>;
                }
                
            }
        }

    };

    const renderSequence = () => {
        
        let _temp = 1;
        let editBtn = "";
        let deleteBtn = "";
        let _position = "";
        const items = [];
        const typeIndex = {};

        for (let i = 0; i < sequence.length; i++) {

            if (!typeIndex[sequence[i]]) {
                typeIndex[sequence[i]] = 1;
            } else {
                typeIndex[sequence[i]]++;
            }

            _temp = typeIndex[sequence[i]];
            _position = (sequence[i] +"_"+ _temp);

            editBtn = <a href="#" className="sequence-item-field-edit-btn" data-position={_temp} onClick={(_e) => handleItemEdit(_e, sequence[i])} ><i className="fa fa-edit"></i></a>;
            deleteBtn = <a href="#" className="sequence-item-delete-btn" data-position={_temp} onClick={(_e) => handleItemDelete(_e, sequence[i])} ><i className="fa fa-times"></i></a>;

            if (_position == deleteMode.position) {
                /* This means we should not show edit button */
                editBtn = null;
                deleteBtn = <>
                    <a href="#" className="sequence-item-delete-cancel-btn" onClick={(_e) => handleItemDeleteCancel(_e)} ><i className="fa fa-times"></i></a>
                    <a href="#" className="sequence-item-delete-btn" data-position={_temp} onClick={(_e) => handleItemDelete(_e, sequence[i])} ><i className="fa fa-check"></i></a>
                </>;
            } else if (_position == editMode.position) {
                deleteBtn = null;
                editBtn = <a href="#" className="sequence-item-edit-cancel-btn" data-position={_temp} onClick={(_e) => handleItemEditCancel(_e, sequence[i], _temp)} ><i className="fa fa-check"></i></a>;
            }

            items.push(<div key={uuidv4()} className="pharmarack-cms-sequence-item" data-id={sequence[i]} draggable="true" onDragStart={(_e) => handleDragStart(_e)} onDragEnd={handleDragEnd} onDragOver={(_e) => handleDragOver(_e)}>{renderSequenceType(sequence[i], typeIndex[sequence[i]])}{editBtn}{deleteBtn}</div>);
        }       

        return items;
        
    };

    const renderComponentList = () => {

        const items = [];
        for (let i = 0; i < componentTypes.length; i++) {
            if (!componentTypes[i].is_child) {                
                items.push(<a key={uuidv4()} href="#" className="pharmarack-cms-component-type-btn" draggable={true} onDragStart={(e) => handleComponentTypeDragStart(e, componentTypes[i])}><i className={`fa fa-${componentTypes[i].icon}`}></i><span>{componentTypes[i].title}</span></a>);
            }               
        }

        return items;

    };

    return (
        <div className="pharmarack-cms-designer-container">           

            <div key={uuidv4()} className="pharmarack-cms-designer-view">
                <div key={uuidv4()} className="pharmarack-cms-designer-mobile-view">
                    <div key={uuidv4()} ref={designerCanvas} id="pharmarack-cms-designer-canvas" onDrop={handleComponentTypeDrop} onDragOver={handleComponentTypeDragOver}>{renderSequence()}</div>
                </div>
            </div>

            <div key={uuidv4()} className="pharmarack-cms-designer-sidebar">{renderComponentList()}</div>

        </div>
    );

};

export default forwardRef(Sequencer);