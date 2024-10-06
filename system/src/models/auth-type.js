import mongoose from'mongoose';
import SecretType from '../enums/secret-type.js';
import PasswordComplex from '../enums/password-complex.js';

const AuthTypeSchema = new mongoose.Schema({ 
    title                   : { type: String, required: true },
    handle                  : { type: String, required: true },
    status                  : { type: Boolean, default: false },
    isActive                : { type: Boolean, default: false },
    secretType              : { type: Number, default: SecretType.PASSWORD },
    length                  : { type: Number, default: 8 },
    complex                 : { type: Number, default: PasswordComplex.SIMPLE },
    expired                 : { type: Number, default: 365 },
    createdBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

const AuthTypeModel = mongoose.model('cms_system_auth_type', AuthTypeSchema);
export default AuthTypeModel;