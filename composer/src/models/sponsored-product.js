import mongoose from'mongoose';

const SponsoredProductSchema = new mongoose.Schema({
    title                   : { type: String, required: true },
    productName             : { type: String, default: "" },
    ptr                     : { type: Number, default: 0 },
    mrp                     : { type: Number, default: 0 },
    status                  : { type: Boolean, default: false },
    keywords                : { type: [{type: String}], default: [] },
    mdmProductCode          : { type: String, required: true },
    segments                : { type: mongoose.Schema.Types.Mixed, default: "none" },
	validFrom               : { type: Date, default: null },
    validUpto               : { type: Date, default: null },
    createdBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

const SponsoredProductModel = mongoose.model('cms_sponsored_product', SponsoredProductSchema);
export default SponsoredProductModel;