import mongoose from'mongoose';
import SegmentType from '../enums/segment-type.js';
import SegmentOrder from '../enums/segment-order.js';
import SegmentRetailer from '../enums/segment-retailer.js';
import SegmentDistributor from '../enums/segment-distributor.js';

const RoleSchema = new mongoose.Schema({ 
    title                   : { type: String, required: true },
    description             : { type: String, default: null },
    type                    : { type: Number, default: SegmentType.DYNAMIC },
    fromDate                : { type: Date, default: null },
    toDate                  : { type: Date, default: null },
    geography               : { type: String, default: null },
    states                  : { type: Array, default: null },
    regions                 : { type: Array, default: null },
    orderStatus             : { type: Number, default: SegmentOrder.PROCESSED },
    retailerStatus          : { type: Number, default: SegmentRetailer.ALL },
    distributorStatus       : { type: Number, default: SegmentDistributor.ALL },    
    status                  : { type: Boolean, default: false },
    createdBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

const RoleModel = mongoose.model('cms_system_segment', RoleSchema);
export default RoleModel;