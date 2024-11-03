import mongoose from'mongoose';

const OrderItemSchema = new mongoose.Schema({ 
    itemId                  : { type: String, required: true },
    mdmProductCode          : { type: String, default: null },
    productCode          : { type: String, default: null },
    brandId                 : { type: String, default: null },
    brandName               : { type: String, default: null },
    orderedQty              : { type: Number, default: 0 },
    receivedQty             : { type: Number, default: 0 },
    ptr                     : { type: Number, default: 0 },    
    orderId                 : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_order", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

const OrderItemModel = mongoose.model('cms_system_order_item', OrderItemSchema);
export default OrderItemModel;