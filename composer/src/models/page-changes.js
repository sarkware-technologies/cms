import mongoose from 'mongoose';

const SchedulerSchema = new mongoose.Schema({
    id: { type: String },
    pageType: { type: String, required: true },
    active: { type: Boolean, default: false, required: true },
},
    {
        strict: true,
        timestamps: true
    });

const SchedulerModel = mongoose.model('pagechanges', SchedulerSchema);
export default SchedulerModel;

