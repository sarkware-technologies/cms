import React, {useState, forwardRef, useImperativeHandle, useEffect} from "react";

const Media = (props, ref) => { //console.log(props.config);

    const [value, setValue] = useState((('value' in props) ? props.value : null));
    const [mediaType, setMediaType] = useState((('type' in props) ? props.type : null));
    const [dimension, setDimension] = useState((('dimension' in props) ? props.dimension : {width: 0, height: 0}));


    const self = {
        getVal: () => value,
        getDimension: () => dimension,
        setVal: (_url) => setValue(_url),
        setType: (_type) => setMediaType(_type),
        getType: () => mediaType
    };
    /* Expose the component to the consumer */
    useImperativeHandle(ref, () => self);

    const handleOnChange = (_e) => {

        if (props.handleMediaChange) {
            props.handleMediaChange(_e.target, props.config.handle);
        } else {
            window._controller.handleMediaChange(_e.target, props.config.handle);
        }

        const file = _e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {

            const fileType = file.type.split('/')[0];
            const fileSizeMB = file.size / (1024 * 1024);

            if (fileType === 'image') {

                const img = new Image();
                img.src = reader.result;

                img.onload = () => {
                    setDimension({width: img.width, height: img.height});
                };

            } else if (fileType === 'video') {
                setMediaType(fileType);
            }

        };

        reader.readAsDataURL(file);

    };

    const handleImageLoad = (e) => {

        const { naturalWidth, naturalHeight } = e.target;
        setDimension({width: naturalWidth, height: naturalHeight});

    };

    const handleDeleteBtnClick = () => {
        if (props.handleMediaDelete) {
            props.handleMediaDelete(props.config.handle);
        } else {
            window._controller.handleMediaDelete(props.config.handle);
        }
    }

    const renderField = () => {

        if (!value) {
            return <input type="file" accept={ (('accept' in props.config) ? props.config.accept : "image/*,video/*") } onChange={(e) => handleOnChange(e)} />;
        } else {
            if (mediaType && mediaType === "video") {
                return <div className="pharmarack-cms-cms-preview-video"><video muted><source src={value} type="video/mp4" /></video><a href="#" onClick={handleDeleteBtnClick}><i className="fa fa-times"></i></a></div>;
            } else {
                return <div className="pharmarack-cms-cms-preview-image"><img src={value} onLoad={handleImageLoad} /><a href="#" onClick={handleDeleteBtnClick}><i className="fa fa-times"></i></a></div>;
            }
        }

    };

    return (
        <div className="pharmarack-cms-component-media">{renderField()}</div>
    );

}

export default forwardRef(Media);
