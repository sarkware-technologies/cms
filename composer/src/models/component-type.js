import mongoose from'mongoose';

const ComponentTypeSchema = new mongoose.Schema({   
    title           : { type: String, required: true },
    handle          : { type: String, required: true, unique: true }, 
    configuration   : { type: mongoose.Schema.Types.Mixed, default: null }, 
    icon            : { type: String, default: "" }, 
    is_child        : { type: Boolean, default: false }, 
    created_by      : { type: mongoose.Schema.Types.ObjectId, ref: "system_user", default: null },
    updated_by      : { type: mongoose.Schema.Types.ObjectId, ref: "system_user", default: null }       
},
{  
    strict          : true,
    timestamps      : true
});

const ComponentTypeModel = mongoose.model('component_type', ComponentTypeSchema);
export default ComponentTypeModel;