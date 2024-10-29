import mongoose from'mongoose';

const SegmentQueueSchema = new mongoose.Schema({ 
    segment                 : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_segment", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

const SegmentQueueModel = mongoose.model('cms_system_segment_queue', SegmentQueueSchema);
export default SegmentQueueModel;