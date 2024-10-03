import mongoose from'mongoose';

const ServiceSchema = new mongoose.Schema({    
    title                   : { type: String, required: true }, 
    handle                  : { type: String, required: true, unique: true },   
    description             : { type: String, default: "" }, 
    offline_message         : { type: String, default: "" },
    status                  : { type: Boolean, default: false },
    created_by              : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updated_by              : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

const ServiceModel = mongoose.model('cms_system_service', ServiceSchema);
export default ServiceModel;