import mongoose from 'mongoose';
import SecretType from '../enums/secret-type.js';
import PasswordComplex from '../enums/password-complex.js';

const AbTesingSchema = new mongoose.Schema({
    testName: { type: String, required: true },
    apis: { type: Object, required: true },
    users: { type: Array, default: [] },
    buildversion: { type: Array, default: [] },
    region: { type: Array, default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    lastModified:{ type: Number}
},
    {
        strict: true,
        timestamps: true
    });

const AbTestingModel = mongoose.model('ab_test', AbTesingSchema);
export default AbTestingModel;