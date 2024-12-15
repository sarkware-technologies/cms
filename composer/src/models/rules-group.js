import mongoose from'mongoose';

const RulesGroupSchema = new mongoose.Schema({      
    component       : { type: mongoose.Schema.Types.ObjectId, ref: "component", default: null },
    rules           : [{ type: mongoose.Schema.Types.ObjectId, ref: "rule" }],
    createdBy       : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy       : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null }      
},
{  
    strict          : true,
    timestamps      : true
});

const RulesGroupModel = mongoose.model('rules_group', RulesGroupSchema);
export default RulesGroupModel;