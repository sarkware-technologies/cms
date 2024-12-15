import mongoose from'mongoose';

const SponsoredProductPerformanceSchema = new mongoose.Schema({
    addedToCart             : { type: Number, default: 0 },
    impression              : { type: Number, default: 0 },
    keyword                 : { type: String, default: null },
    ordered                 : { type: Number, default: 0 },
    orderedQty              : { type: Number, default: 0 },
    sponsoredProduct        : { type: mongoose.Schema.Types.ObjectId, ref: "cms_sponsored_product", default: null },
    createdBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null }    
},
{  
    strict                  : true,
    timestamps              : true
});

const SponsoredProductPerformanceModel = mongoose.model('cms_sponsored_product_performance', SponsoredProductPerformanceSchema);
export default SponsoredProductPerformanceModel;