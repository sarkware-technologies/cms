import mongoose from'mongoose';

const SegmentRetailerExclusionSchema = new mongoose.Schema({ 
    segment                 : { type: String, default: null },
    retailer                : { type: mongoose.Schema.Types.ObjectId, ref: "cms_segment_retailer", default: null },
    createdBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

SegmentRetailerExclusionSchema.index({ segment: 1, retailer: 1 }, { unique: true });

const SegmentRetailerExclusionModel = mongoose.model('cms_segment_retailer_exclusion', SegmentRetailerExclusionSchema);
export default SegmentRetailerExclusionModel;