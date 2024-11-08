import mongoose from'mongoose';
import FieldConfigType from '../enums/field-config-type';

const EntityConfigSchema = new mongoose.Schema({    
    title           : { type: String, required: true },
    configType      : { type: Number, default: FieldConfigType.UNIQUE },    
    fields          : [{ type: Schema.Types.ObjectId, ref: 'cms_system_field' }],
    values          : [{ type: Number, default: 1 }],
    createdBy       : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy       : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null }       
},
{  
    strict          : true,
    timestamps      : true
});

const EntityConfigModel = mongoose.model('cms_system_entity_config', EntityConfigSchema);
export default EntityConfigModel;