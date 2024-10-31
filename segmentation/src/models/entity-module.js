import mongoose from'mongoose';

/**
 *
 * @author  : Sark
 * @version : 1.0.0
 * @description : Entity to Module mapping
 *
 */

export const EntityModuleMappingSchema = new mongoose.Schema({   
    entity              : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_entity", default: null },          
    module              : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_module", default: null },  
    exposed             : { type: Boolean, default: true }, 
    has_form            : { type: Boolean, default: false },
    status              : { type: Boolean, default: true },
    createdBy          : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy          : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null }
},
{  
    strict              : true,
    timestamps          : true
});

const EntityModuleMappingModel = mongoose.model('cms_entity_module_mapping', EntityModuleMappingSchema);
export default EntityModuleMappingModel;