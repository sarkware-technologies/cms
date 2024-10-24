import mongoose from'mongoose';

const PrivilegeSchema = new mongoose.Schema({ 
    title                   : { type: String, required: true },     
    handle                  : { type: String, required: true, unique: true },
    createdBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

const PrivilegeModel = mongoose.model('cms_system_privilege', PrivilegeSchema);
export default PrivilegeModel;