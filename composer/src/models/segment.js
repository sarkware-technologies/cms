import mongoose, { mongo } from'mongoose';

export const SegmentSchema = new mongoose.Schema({   
    source              : { type: String, default: "" },
    condition           : { type: String, default: "" },
    segmentKey          : { type: String, required: true },
    isActive            : { type: Boolean, default: false },
    isArchived          : { type: Boolean, default: false }
},
{  
    strict          : true,
    timestamps      : true
});

const SegmentModel = mongoose.model('segments', SegmentSchema);
export default SegmentModel;