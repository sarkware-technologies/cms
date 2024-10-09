import mongoose from'mongoose';

const ServiceVersionSchema = new mongoose.Schema({        
    route                   : { type: String, required: true },
    version                 : { type: String, required: true },        
    offline_message         : { type: String, default: "" },   
    deprecate_message       : { type: String, default: "" },
    status                  : { type: Boolean, required: true },
    deprecated              : { type: Boolean, default: false },
    to_be_deprecated        : { type: Boolean, default: false },    
    host                    : { type: mongoose.Schema.Types.ObjectId, ref: 'cms_system_host', required: true },
    service                 : { type: mongoose.Schema.Types.ObjectId, ref: 'cms_system_service', required: true },
},
{  
    strict              : true,
    timestamps          : true
});

ServiceVersionSchema.index({ route: 1, service: 1 }, { unique: true });

const ServiceVersionModel = mongoose.model('cms_system_service_version', ServiceVersionSchema);
export default ServiceVersionModel;