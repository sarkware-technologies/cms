import mongoose from'mongoose';

const ModuleSchema = new mongoose.Schema({    
    title                    : { type: String, required: true },
    handle                  : { type: String, required: true },
    description             : { type: String, default: "" },  
    offline_message         : { type: String, default: "" }, 
    deprecate_message       : { type: String, default: "" },  
    subscribers             : { type: Number, default: 0 }, 
    price                   : { type: Number, default: 0 },
    package                 : { type: Number, default: 0 },
    deprecated              : { type: Boolean, default: false },
    to_be_deprecated        : { type: Boolean, default: false },    
    service                 : { type: mongoose.Schema.Types.ObjectId, ref: 'cmsSystemService', required: true },
    status                  : { type: Boolean, default: true },
    created_by          : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemUser", default: null },
    updated_by          : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemUser", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

ModuleSchema.index({ handle: 1, service: 1 }, { unique: true });

const ModuleModel = mongoose.model('cmsSystemModule', ModuleSchema);
export default ModuleModel;