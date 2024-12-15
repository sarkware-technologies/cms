import mongoose from'mongoose';
import SegmentType from '../enums/segment-type.js';
import RetailerStatus from '../enums/segment-retailer-status.js';
import StoreStatus from '../enums/segment-store-status.js';
import SegmentStatus from '../enums/segment-status.js';

const SegmentSchema = new mongoose.Schema({ 
    title                   : { type: String, required: true },
    handle                  : { type: String, required: true },
    description             : { type: String, default: null },
    segmentType             : { type: Number, default: SegmentType.DYNAMIC },
    fromDate                : { type: Date, default: null },
    toDate                  : { type: Date, default: null },
    geography               : { type: String, default: null },
    states                  : { type: Array, default: null },
    regions                 : { type: Array, default: null },    
    orderStatus             : { type: Array, default: null },
    retailerStatus          : { type: Number, default: RetailerStatus.ALL },
    companies               : { type: Array, default: null },
    storeStatus             : { type: Number, default: StoreStatus.ALL },    
    excludedStores          : { type: [{type: mongoose.Schema.Types.ObjectId, ref: "cms_master_store"}], default: null },
    status                  : { type: Boolean, default: false },
    segmentStatus           : { type: Number, default: SegmentStatus.SCHEDULED },
    createdBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

const SegmentModel = mongoose.model('cms_segment', SegmentSchema);
export default SegmentModel;