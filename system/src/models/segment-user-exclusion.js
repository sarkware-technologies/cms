import mongoose from'mongoose';

const SegmentUserExclusionSchema = new mongoose.Schema({ 
    segment                 : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_segment", default: null },
    user                    : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    createdBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

const SegmentUserExclusionModel = mongoose.model('cms_system_segment_user_exclusion', SegmentUserExclusionSchema);
export default SegmentUserExclusionModel;