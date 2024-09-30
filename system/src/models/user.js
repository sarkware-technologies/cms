import mongoose from'mongoose';

const UserSchema = new mongoose.Schema({        
    email                   : { type: String, required: true },
    mobile                  : { type: String, required: true },
    password                : { type: String, required: true },
    fullName                : { type: String, default: null },
    status                  : { type: Boolean, default: false },
    createdBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemUser", default: null },
    updatedBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemUser", default: null },
},
{  
    strict                  : true,
    timestamps              : true
});

const UserModel = mongoose.model('cmsSystemUser', UserSchema);
export default UserModel;