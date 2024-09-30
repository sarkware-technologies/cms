import mongoose from'mongoose';

const AuthPolicySchema = new mongoose.Schema({ 
    title                   : { type: String, required: true },
    handle                  : { type: String, required: true },
    authType                : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemAuthType", default: null },
    config                  : { type: Mixed, default: null },
    createdBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemUser", default: null },
    updatedBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemUser", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

const AuthPolicyModel = mongoose.model('cmsSystemAuthPolicy', AuthPolicySchema);
export default AuthPolicyModel;