import mongoose from'mongoose';

const AuthPolicySchema = new mongoose.Schema({ 
    title                   : { type: String, required: true },
    handle                  : { type: String, required: true },
    authType                : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_auth_type", default: null },
    config                  : { type: Mixed, default: null },
    createdBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

const AuthPolicyModel = mongoose.model('cms_system_auth_policy', AuthPolicySchema);
export default AuthPolicyModel;