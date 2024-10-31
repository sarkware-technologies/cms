import mongoose from'mongoose';

const SegmentDistributorExclusionSchema = new mongoose.Schema({ 
    segment                 : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_segment", default: null },
    distributor             : { type: String, default: null },
    createdBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

const SegmentDistributorExclusionModel = mongoose.model('cms_system_segment_distributor_exclusion', SegmentDistributorExclusionSchema);
export default SegmentDistributorExclusionModel;