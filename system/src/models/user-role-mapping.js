import mongoose from'mongoose';

const UserRoleMappingSchema = new mongoose.Schema({ 
    role                  : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemRole", default: null },
    user                  : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemUser", default: null },
    createdBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemUser", default: null },
    updatedBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemUser", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

const UserRoleMappingModel = mongoose.model('cmsSystemRole', UserRoleMappingSchema);
export default UserRoleMappingModel;