import mongoose from'mongoose';

const RoleMenuMappingSchema = new mongoose.Schema({ 
    role                    : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemRole", default: null },
    menu                    : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemMenu", default: null },
    createdBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemUser", default: null },
    updatedBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemUser", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

const RoleMenuMappingModel = mongoose.model('cmsSystemRoleMenu', RoleMenuMappingSchema);
export default RoleMenuMappingModel;