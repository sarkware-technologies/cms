import mongoose from'mongoose';

const UserSchema = new mongoose.Schema({        
    email                   : { type: String, required: true },
    mobile                  : { type: String, required: true },
    password                : { type: String, required: true },
    otp                     : { type: String, default: null },
    fullName                : { type: String, default: null },
    status                  : { type: Boolean, default: false },
    createdBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
},
{  
    strict                  : true,
    timestamps              : true
});

const UserModel = mongoose.model('cms_system_user', UserSchema);
export default UserModel;