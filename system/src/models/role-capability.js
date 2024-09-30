import mongoose from'mongoose';

const RoleCapabilitySchema = new mongoose.Schema({    
    role                : { type: mongoose.Schema.Types.ObjectId, ref: 'cmsSystemRole', required: true },    
    module              : { type: mongoose.Schema.Types.ObjectId, ref: 'cmsSystemModule', required: true },
    can_read            : { type: Boolean, default: false },    
    can_create          : { type: Boolean, default: false },    
    can_update          : { type: Boolean, default: false },    
    can_delete          : { type: Boolean, default: false },   
    created_by          : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemUser", default: null },
    updated_by          : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemUser", default: null } 
},
{  
    strict      : true,
    timestamps  : true
});

const RoleCapabilityModel = mongoose.model('cmsSystemRoleCapability', RoleCapabilitySchema);
export default RoleCapabilityModel;