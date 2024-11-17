import mongoose from'mongoose';

const PageTypeSchema = new mongoose.Schema({   
    title           : { type: String, required: true },
    handle          : { type: String, required: true, unique: true }, 
    description     : { type: String, default: "" }, 
    created_by      : { type: mongoose.Schema.Types.ObjectId, ref: "system_user", default: null },
    updated_by      : { type: mongoose.Schema.Types.ObjectId, ref: "system_user", default: null }       
},
{  
    strict          : true,
    timestamps      : true
});

const PageTypeModel = mongoose.model('page_type', PageTypeSchema);
export default PageTypeModel;