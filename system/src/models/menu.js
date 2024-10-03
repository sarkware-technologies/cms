import mongoose from'mongoose';

const MenuSchema = new mongoose.Schema({    
    title           : { type: String, required: true, unique: true },
    handle          : { type: String, default: "" },
    iconType        : { type: String, default: "" }, 
    icon            : { type: String, default: "" },     
    order           : { type: Number, default: 0 },
    parent          : { type: mongoose.Schema.ObjectId, ref: 'cms_system_menu', default: null },        
    module          : { type: mongoose.Schema.ObjectId, ref: 'cms_system_module', default: null }   
},
{  
    strict          : true,
    timestamps      : true
});

const MenuModel = mongoose.model('cms_system_menu', MenuSchema);
export default MenuModel;