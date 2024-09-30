import mongoose from'mongoose';

const AuthTypeSchema = new mongoose.Schema({ 
    title                   : { type: String, required: true },
    handle                  : { type: String, required: true },
    status                  : { type: Boolean, default: false },
    isActive                : { type: Boolean, default: false },
    createdBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemUser", default: null },
    updatedBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemUser", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

const AuthTypeModel = mongoose.model('cmsSystemAuthType', AuthTypeSchema);
export default AuthTypeModel;