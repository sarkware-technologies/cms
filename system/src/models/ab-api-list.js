import mongoose from 'mongoose';
import SecretType from '../enums/secret-type.js';
import PasswordComplex from '../enums/password-complex.js';

const ABAPILISTSchema = new mongoose.Schema({
    title: { type: String, required: true },
    route: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: false },
    secretType: { type: Number, default: SecretType.PASSWORD },
    service: { type: String, default: SecretType.PASSWORD },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null }
},
    {
        strict: true,
        timestamps: true
    });

const AbAbiListModel = mongoose.model('ab_api_list', ABAPILISTSchema);
export default AbAbiListModel;