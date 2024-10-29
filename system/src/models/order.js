import mongoose from'mongoose';

const OrderSchema = new mongoose.Schema({ 
    orderId                 : { type: String, required: true },
    userId                  : { type: String, required: true },
    retailerId              : { type: String, required: true },
    storeId                 : { type: String, required: true },
    orderDate               : { type: Date, default: null },
    grandTotal              : { type: Number, default: null },
    subTotal                : { type: Number, default: null },
    orderStatus             : { type: String, default: null },
    orderSource             : { type: String, default: null },
    isProcessed             : { type: Number, default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

const OrderModel = mongoose.model('cms_system_order', OrderSchema);
export default OrderModel;