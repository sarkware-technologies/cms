import mongoose from'mongoose';

const RuleSchema = new mongoose.Schema({       
    component       : { type: mongoose.Schema.Types.ObjectId, ref: "component", default: null },
    condition       : { type: Number, default: 1 },
    type            : { type: Number, default: 1 },    
    segments        : { type: mongoose.Schema.Types.Mixed, default: null },    
    createdBy       : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy       : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null } 
},
{  
    strict          : true,
    timestamps      : true
});

const RuleModel = mongoose.model('rule', RuleSchema);
export default RuleModel;