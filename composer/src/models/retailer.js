import mongoose from 'mongoose';

const reatilerSchema = new mongoose.Schema({
    id: { type: String },
    RetailerId: { type: String },
    RetailerName: { type: String },
    RegionName: { type: String },
    StateId: { type: String },
    RegionId: { type: String },
    userId: { type: String },
},
    {
        strict: true,
        timestamps: true
    });

const Retailer = mongoose.model('retailerbasic', reatilerSchema);
export default Retailer;