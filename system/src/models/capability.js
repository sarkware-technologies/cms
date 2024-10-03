import mongoose from'mongoose';

const CapabilitySchema = new mongoose.Schema({    
    role                : { type: mongoose.Schema.Types.ObjectId, ref: 'cms_system_role', required: true },    
    module              : { type: mongoose.Schema.Types.ObjectId, ref: 'cms_system_module', required: true },
    can_read            : { type: Boolean, default: false },    
    can_create          : { type: Boolean, default: false },    
    can_update          : { type: Boolean, default: false },    
    can_delete          : { type: Boolean, default: false },   
    created_by          : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updated_by          : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null } 
},
{  
    strict      : true,
    timestamps  : true
});

const CapabilityModel = mongoose.model('cms_system_capability', CapabilitySchema);
export default CapabilityModel;