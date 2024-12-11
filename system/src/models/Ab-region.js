import mongoose from 'mongoose';

const AbregionSchema = new mongoose.Schema({
    regionId: { type: String, required: true },
    regionName: { type: String, required: true },
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
const AbregionModel = mongoose.model('ab_region', AbregionSchema);
export default AbregionModel;