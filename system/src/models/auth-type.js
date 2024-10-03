import mongoose from'mongoose';

const AuthTypeSchema = new mongoose.Schema({ 
    title                   : { type: String, required: true },
    handle                  : { type: String, required: true },
    status                  : { type: Boolean, default: false },
    isActive                : { type: Boolean, default: false },
    createdBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

const AuthTypeModel = mongoose.model('cms_system_auth_type', AuthTypeSchema);
export default AuthTypeModel;