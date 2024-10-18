import mongoose from'mongoose';

const SegmentUserInclusionSchema = new mongoose.Schema({ 
    segment                 : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_segment", default: null },
    user                    : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    createdBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

const SegmentUserInclusionModel = mongoose.model('cms_system_segment_user_inclusion', SegmentUserInclusionSchema);
export default SegmentUserInclusionModel;