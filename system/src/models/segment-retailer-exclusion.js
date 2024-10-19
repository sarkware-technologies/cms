import mongoose from'mongoose';

const SegmentRetailerExclusionSchema = new mongoose.Schema({ 
    segment                 : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_segment", default: null },
    retailer                : { type: String, default: null },
    createdBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

const SegmentRetailerExclusionModel = mongoose.model('cms_system_segment_retailer_exclusion', SegmentRetailerExclusionSchema);
export default SegmentRetailerExclusionModel;