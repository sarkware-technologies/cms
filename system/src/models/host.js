import mongoose from'mongoose';

const HostSchema = new mongoose.Schema({    
    name            : { type: String, required: true, unique: true },    
    host            : { type: String, required: true },         
    port            : { type: Number, require: true },
    https           : { type: Boolean, required: true },
    endpoint        : { type: String, default: "" },
    status          : { type: Boolean, required: true },
    createdBy       : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy       : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null } 
},
{  
    strict          : true,
    timestamps      : true
});

const HostModel = mongoose.model('cms_system_host', HostSchema);
export default HostModel;