import mongoose from'mongoose';

const OfferSchema = new mongoose.Schema({        
    ProductName: { type: String },
    ProductCode: { type: String },
    ProductId: { type: String },
    MDMProductCode: { type: String },
    CompanyId: { type: String },
    CompanyName: { type: String },
    MRP: { type: Number },
    MaxCashback: { type: Number },
    MaxQty: { type: Number },
    MaxValue: { type: Number },
    MinQty: { type: Number },
    MinValue: { type: Number },
    PTR: { type: Number },
    CashbackMessage: { type: String },
    CashbackTermsAndConditions: { type: String },
    SegmentId: { type: String },
    SegmentName: { type: String },
    Audience: { type: String },
    FirstUsers: { type: String },
    FlatCashback: { type: Number },
    PercentageCashback: { type: Number },
    Remarks: { type: String }
},
{  
    strict          : true,
    timestamps      : true
});

const OfferModel = mongoose.model('cash_back', OfferSchema);
export default OfferModel;