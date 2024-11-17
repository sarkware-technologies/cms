import mongoose from'mongoose';

const RuleSchema = new mongoose.Schema({       
    component       : { type: mongoose.Schema.Types.ObjectId, ref: "component", default: null },
    condition       : { type: Number, default: 1 },
    type            : { type: Number, default: 1 },
    match           : { type: mongoose.Schema.Types.Mixed, default: null },
    segments        : { type: mongoose.Schema.Types.Mixed, default: null },    
    created_by      : { type: mongoose.Schema.Types.ObjectId, ref: "system_user", default: null },
    updated_by      : { type: mongoose.Schema.Types.ObjectId, ref: "system_user", default: null }       
},
{  
    strict          : true,
    timestamps      : true
});

const RuleModel = mongoose.model('rule', RuleSchema);
export default RuleModel;