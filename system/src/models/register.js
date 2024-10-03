import mongoose from'mongoose';

const RegisterSchema = new mongoose.Schema({        
    email                   : { type: String, required: true, unique: true },
    mobile                  : { type: String, required: true, unique: true },
    password                : { type: String, required: true },
    fullName                : { type: String, required: null },
    isApproved              : { type: String, default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

const RegisterModel = mongoose.model('cms_system_register', RegisterSchema);
export default RegisterModel;