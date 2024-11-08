import mongoose from'mongoose';

const SegmentStoreExclusionSchema = new mongoose.Schema({ 
    segment                 : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_segment", default: null },
    store                   : { type: mongoose.Schema.Types.ObjectId, ref: "cms_master_store", default: null },
    createdBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

const SegmentStoreExclusionModel = mongoose.model('cms_system_segment_distributor_exclusion', SegmentStoreExclusionSchema);
export default SegmentStoreExclusionModel;