import mongoose from'mongoose';

const RoleSchema = new mongoose.Schema({ 
    title                   : { type: String, required: true },
    handle                  : { type: String, required: true },
    authType                : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_auth_type", default: null },
    authPolicy              : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_auth_policy", default: null },
    status                  : { type: Boolean, default: false },
    createdBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

const RoleModel = mongoose.model('cms_system_role', RoleSchema);
export default RoleModel;