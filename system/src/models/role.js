import mongoose from'mongoose';

const RoleSchema = new mongoose.Schema({ 
    title                   : { type: String, required: true },
    handle                  : { type: String, required: true },
    authType                : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemAuthType", default: null },
    authPolicy              : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemAuthPolicy", default: null },
    status                  : { type: Boolean, default: false },
    createdBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemUser", default: null },
    updatedBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemUser", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

const RoleModel = mongoose.model('cmsSystemRole', RoleSchema);
export default RoleModel;