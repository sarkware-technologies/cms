import mongoose from'mongoose';

const ModuleSchema = new mongoose.Schema({    
    title                   : { type: String, required: true },
    handle                  : { type: String, required: true },
    description             : { type: String, default: "" },  
    offline_message         : { type: String, default: "" },   
    service                 : { type: mongoose.Schema.Types.ObjectId, ref: 'cms_system_service', required: true },
    status                  : { type: Boolean, default: true },
    createdBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

ModuleSchema.index({ handle: 1, service: 1 }, { unique: true });

const ModuleModel = mongoose.model('cms_system_module', ModuleSchema);
export default ModuleModel;