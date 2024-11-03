import mongoose from'mongoose';

const OrderBatchSchema = new mongoose.Schema({     
    totalBatch              : { type: Number, default: 0 },
    currentBatch            : { type: Number, default: 0 },
    recordPerBatch          : { type: Number, default: 0 },
    totalRecord             : { type: Number, default: 0 },
    completedBatch          : { type: Number, default: 0 },
    pendingBatch            : { type: Number, default: 0 },
    startTime               : { type: Date, default: null },
    endTime                 : { type: Date, default: null },
    status                  : { type: String, default: false },
    task                    : { type: String, default: false }    
},
{  
    strict          : true,
    timestamps      : true
});

const OrderBatchModel = mongoose.model('cms_scheduler_order_batch', OrderBatchSchema);
export default OrderBatchModel;