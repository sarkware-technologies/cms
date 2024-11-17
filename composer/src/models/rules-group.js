import mongoose from'mongoose';

const RulesGroupSchema = new mongoose.Schema({      
    component       : { type: mongoose.Schema.Types.ObjectId, ref: "component", default: null },
    rules           : [{ type: mongoose.Schema.Types.ObjectId, ref: "rule" }],
    created_by      : { type: mongoose.Schema.Types.ObjectId, ref: "system_user", default: null },
    updated_by      : { type: mongoose.Schema.Types.ObjectId, ref: "system_user", default: null }       
},
{  
    strict          : true,
    timestamps      : true
});

const RulesGroupModel = mongoose.model('rules_group', RulesGroupSchema);
export default RulesGroupModel;