import mongoose from'mongoose';

const EntitySchema = new mongoose.Schema({    
    title           : { type: String, required: true },
    handle          : { type: String, required: true, unique: true },    
    status          : { type: Boolean, required: true },  
    created_by      : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemUser", default: null },
    updated_by      : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemUser", default: null }       
},
{  
    strict          : true,
    timestamps      : true
});

const EntityModel = mongoose.model('cmsSystemEntity', EntitySchema);
export default EntityModel;