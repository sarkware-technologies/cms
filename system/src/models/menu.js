import mongoose from'mongoose';

const MenuSchema = new mongoose.Schema({    
    title           : { type: String, required: true, unique: true },
    handle          : { type: String, default: "" },
    iconType        : { type: String, default: "" }, 
    icon            : { type: String, default: "" },     
    order           : { type: Number, default: 0 },
    parent          : { type: mongoose.Schema.ObjectId, ref: 'cmsSystemMenu', default: null },        
    module          : { type: mongoose.Schema.ObjectId, ref: 'cmsSystemModule', default: null }   
},
{  
    strict          : true,
    timestamps      : true
});

const MenuModel = mongoose.model('cmsSystemMenu', MenuSchema);
export default MenuModel;