import mongoose from'mongoose';

const ComponentSchema = new mongoose.Schema({   
    title           : { type: String, required: true },
    handle          : { type: String, required: true, unique: true }, 
    type            : { type: mongoose.Schema.Types.ObjectId, ref: "component_type", default: null },
    parent          : { type: mongoose.Schema.Types.ObjectId, ref: "component", default: null },
    page            : { type: mongoose.Schema.Types.ObjectId, ref: "page", default: null },
    configuration   : { type: mongoose.Schema.Types.Mixed, default: null }, 
    status          : { type: Boolean, default: false }, 
    start_date      : { type: Date, default: null }, 
    end_date        : { type: Date, default: null }, 
    created_by      : { type: mongoose.Schema.Types.ObjectId, ref: "system_user", default: null },
    updated_by      : { type: mongoose.Schema.Types.ObjectId, ref: "system_user", default: null }       
},
{  
    strict          : true,
    timestamps      : true
});

const ComponentModel = mongoose.model('component', ComponentSchema);
export default ComponentModel;