import mongoose from'mongoose';

const RolePrivilegeMappingSchema = new mongoose.Schema({ 
    role                    : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemRole", default: null },
    privilege               : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemPrivilege", default: null },
    createdBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemUser", default: null },
    updatedBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemUser", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

const RolePrivilegeMappingModel = mongoose.model('cmsSystemRolePrivilege', RolePrivilegeMappingSchema);
export default RolePrivilegeMappingModel;