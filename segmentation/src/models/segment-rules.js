import mongoose from'mongoose';
import SegmentRuleType from '../enums/segment-rule-type.js';

const SegmentRuleSchema = new mongoose.Schema({ 
    segment                 : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_segment", default: null },
    mdmProductCode          : { type: String, default: null },
    ruleType                : { type: Number, default: SegmentRuleType.QUANTITY },
    from                    : { type: Number, default: -1 },
    to                      : { type: Number, default: -1 },
    createdBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

const SegmentRuleModel = mongoose.model('cms_system_segment_rule', SegmentRuleSchema);
export default SegmentRuleModel;