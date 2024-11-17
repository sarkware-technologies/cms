import mongoose from'mongoose';

/**
 *
 * @author  : Sark
 * @version : 1.0.0
 * @description : Base schema for Taxonomy
 *
 */

export const TermMappingSchema = new mongoose.Schema({   
    term                : { type: mongoose.Schema.Types.ObjectId, ref: "system_term", default: null },      
    record              : { type: String, default: "" }, // this would be an object id, from entity record (Dynamic Model)
    taxonomy_mapping    : { type: mongoose.Schema.Types.ObjectId, ref: "system_taxonomy_mapping", default: null },
    status              : { type: Boolean, required: true },
    created_by          : { type: mongoose.Schema.Types.ObjectId, ref: "system_user", default: null },
    updated_by          : { type: mongoose.Schema.Types.ObjectId, ref: "system_user", default: null }
},
{  
    strict          : true,
    timestamps      : true
});

const TermMappingModel = mongoose.model('system_term_mapping', TermMappingSchema);
export default TermMappingModel;