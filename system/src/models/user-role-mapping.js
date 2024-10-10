import mongoose from'mongoose';

const UserRoleMappingSchema = new mongoose.Schema({ 
    role                    : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_role", default: null },
    user                    : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    createdBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

const UserRoleMappingModel = mongoose.model('cms_system_user_role', UserRoleMappingSchema);
export default UserRoleMappingModel;