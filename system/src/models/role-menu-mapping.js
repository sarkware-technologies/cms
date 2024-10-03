import mongoose from'mongoose';

const RoleMenuMappingSchema = new mongoose.Schema({ 
    role                    : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_role", default: null },
    menu                    : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_menu", default: null },
    createdBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

const RoleMenuMappingModel = mongoose.model('cms_system_role_menu', RoleMenuMappingSchema);
export default RoleMenuMappingModel;