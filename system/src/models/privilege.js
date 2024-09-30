import mongoose from'mongoose';

const PrivilegeSchema = new mongoose.Schema({ 
    handle                  : { type: String, required: true },
    createdBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemUser", default: null },
    updatedBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemUser", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

const PrivilegeModel = mongoose.model('cmsSystemPrivilege', PrivilegeSchema);
export default PrivilegeModel;