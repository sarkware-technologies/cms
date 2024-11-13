import mongoose from'mongoose';
import SegmentRuleType from '../enums/segment-rule-type.js';
import SegmentRuleQtyType from '../enums/segment-rule-qty-type.js';

const SegmentRuleSchema = new mongoose.Schema({ 
    segment                 : { type: mongoose.Schema.Types.ObjectId, ref: "cms_segment", default: null },
    ruleType                : { type: Number, default: SegmentRuleType.PRODUCT },
    target                  : { type: String, default: null },    
    qtyType                 : { type: Number, default: SegmentRuleQtyType.PRICE },
    from                    : { type: Number, default: -1 },
    to                      : { type: Number, default: -1 },
    createdBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

const SegmentRuleModel = mongoose.model('cms_segment_rule', SegmentRuleSchema);
export default SegmentRuleModel;