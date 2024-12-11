import mongoose from 'mongoose';

const AbBuildVersionSchema = new mongoose.Schema({
    releaseDetails: { type: String, required: true },
    releas_date: { type: String, required: true },
    version: { type: String, required: true, unique: true },
    description: { type: String },
    os: { type: String, },
    updated:{type:Date},
    mappedId: { type: String},
    mappedAB: { type: Object, default: {}},
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    lastModified:{ type: Number}
},
    {
        strict: true,
        timestamps: true
    });

const AbBuildVersionModel = mongoose.model('ab_build_version', AbBuildVersionSchema);
export default AbBuildVersionModel;