import mongoose from'mongoose';

const SegmentRetailerSchema = new mongoose.Schema({ 
    segment                 : { type: mongoose.Schema.Types.ObjectId, ref: "cms_segment", default: null },
    retailer                : { type: mongoose.Schema.Types.ObjectId, ref: "cms_master_retailer", default: null },
    createdBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

SegmentRetailerSchema.index({ segment: 1, retailer: 1 }, { unique: true });

const SegmentRetailerModel = mongoose.model('cms_segment_retailer', SegmentRetailerSchema);
export default SegmentRetailerModel;