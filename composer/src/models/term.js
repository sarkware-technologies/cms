import mongoose from'mongoose';

/**
 *
 * @author  : Sark
 * @version : 1.0.0
 * @description : Base schema for Taxonomy
 *
 */

export const TermSchema = new mongoose.Schema({   
    title           : { type: String, required: true },    
    handle          : { type: String, required: true, unique: true },    
    taxonomy        : { type: mongoose.Schema.Types.ObjectId, ref: "system_taxonomy", required: true },
    parent          : { type: mongoose.Schema.Types.ObjectId, ref: "system_term", default: null },
    mapping_count   : { type: Number, default: 0 },
    status          : { type: Boolean, required: true },
    created_by      : { type: mongoose.Schema.Types.ObjectId, ref: "system_user", default: null },
    updated_by      : { type: mongoose.Schema.Types.ObjectId, ref: "system_user", default: null }
},
{  
    strict          : true,
    timestamps      : true
});

const TermModel = mongoose.model('system_term', TermSchema);
export default TermModel;