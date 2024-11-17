import mongoose from'mongoose';

const PageSchema = new mongoose.Schema({       
    title           : { type: String, required: true },
    handle          : { type: String, required: true, unique: true },
    type            : { type: mongoose.Schema.Types.ObjectId, ref: "page_type", default: null },
    description     : { type: String, default: "" }, 
    sequence        : { type: Array, default: [] }, 
    status          : { type: Boolean, default: false }, 
    created_by      : { type: mongoose.Schema.Types.ObjectId, ref: "system_user", default: null },
    updated_by      : { type: mongoose.Schema.Types.ObjectId, ref: "system_user", default: null }       
},
{  
    strict          : true,
    timestamps      : true
});

const PageModel = mongoose.model('page', PageSchema);
export default PageModel;