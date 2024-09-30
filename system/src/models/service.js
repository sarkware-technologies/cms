import mongoose from'mongoose';

const ServiceSchema = new mongoose.Schema({    
    title                   : { type: String, required: true }, 
    handle                  : { type: String, required: true, unique: true },   
    description             : { type: String, default: "" }, 
    offline_message         : { type: String, default: "" },
    status                  : { type: Boolean, default: false },
    created_by              : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemUser", default: null },
    updated_by              : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemUser", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

const ServiceModel = mongoose.model('cmsSystemService', ServiceSchema);
export default ServiceModel;