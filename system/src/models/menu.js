import mongoose from'mongoose';

const MenuSchema = new mongoose.Schema({    
    title           : { type: String, required: true, unique: true },
    handle          : { type: String, default: "" },
    iconType        : { type: Number, default: "" }, 
    icon            : { type: String, default: "" },     
    order           : { type: Number, default: 0 },
    parent          : { type: mongoose.Schema.ObjectId, ref: 'cms_system_menu', default: null },        
    module          : { type: mongoose.Schema.ObjectId, ref: 'cms_system_module', default: null },
    created_by      : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updated_by      : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null }   
},
{  
    strict          : true,
    timestamps      : true
});

const MenuModel = mongoose.model('cms_system_menu', MenuSchema);
export default MenuModel;