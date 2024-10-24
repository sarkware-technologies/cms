import mongoose from'mongoose';

const RolePrivilegeMappingSchema = new mongoose.Schema({ 
    role                    : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_role", default: null },
    privilege               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_privilege", default: null },
    createdBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

RolePrivilegeMappingSchema.index({ role: 1, privilege: 1 }, { unique: true });

const RolePrivilegeMappingModel = mongoose.model('cms_system_role_privilege', RolePrivilegeMappingSchema);
export default RolePrivilegeMappingModel;