import mongoose from'mongoose';

const SegmentRetailerSchema = new mongoose.Schema({ 
    segment                 : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_segment", default: null },
    retailer                : { type: Number, default: null },
    createdBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

SegmentRetailerSchema.index({ segment: 1, retailer: 1 }, { unique: true });

const SegmentRetailerModel = mongoose.model('cms_system_segment_retailer', SegmentRetailerSchema);
export default SegmentRetailerModel;