import mongoose from 'mongoose';

const reatilerMasterSchema = new mongoose.Schema({
	Address1: { type: String, default: null },
    Address2: { type: String, default: null },
    City: { type: String },
    Email: { type: String },
    IsAuthorized: {},
    MobileNumber: { type: String },
    Pincode: { type: Number },
    RegionId: { type: Number },
    RetailerId: { type: Number },
    RetailerName: { type: String },
    StateId: { type: Number }
},
{
    strict: true,
    timestamps: true
});

const RetailerMaster = mongoose.model('cms_master_retailer', reatilerMasterSchema);
export default RetailerMaster;