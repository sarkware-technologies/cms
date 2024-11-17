import mongoose from'mongoose';

const PageComponentMappingSchema = new mongoose.Schema({        
    page            : { type: mongoose.Schema.Types.ObjectId, ref: 'pages', required: true },
    component       : { type: mongoose.Schema.Types.ObjectId, ref: 'components', required: true },
    position        : { type: String, required: true },
    created_by      : { type: mongoose.Schema.Types.ObjectId, ref: "system_user", default: null },
    updated_by      : { type: mongoose.Schema.Types.ObjectId, ref: "system_user", default: null }       
},
{  
    strict          : true,
    timestamps      : true
});

const PageComponentMappingModel = mongoose.model('page_component_mappings', PageComponentMappingSchema);
export default PageComponentMappingModel;