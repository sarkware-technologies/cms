import mongoose from 'mongoose';


const AbretailerSchema = new mongoose.Schema({
    retailerId: { type: String, required: true },
    username: { type: String, required: true },
    userId: { type: String, required: true },
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

const AbretailerModel = mongoose.model('ab_retailer', AbretailerSchema);
export default AbretailerModel;