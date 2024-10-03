import mongoose from'mongoose';

const EntitySchema = new mongoose.Schema({    
    title           : { type: String, required: true },
    handle          : { type: String, required: true, unique: true },    
    status          : { type: Boolean, required: true },  
    created_by      : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updated_by      : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null }       
},
{  
    strict          : true,
    timestamps      : true
});

const EntityModel = mongoose.model('cms_system_entity', EntitySchema);
export default EntityModel;