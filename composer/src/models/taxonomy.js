import mongoose from'mongoose';

/**
 *
 * @author  : Sark
 * @version : 1.0.0
 * @description : Base schema for Taxonomy
 *
 */

export const TaxonomySchema = new mongoose.Schema({   
    title           : { type: String, required: true },    
    handle          : { type: String, required: true, unique: true },
    description     : { type: String, default: "" },
    type            : { type: String, default: 1 },                     // one-to-one or one-to-many
    status          : { type: Boolean, required: true },
    created_by      : { type: mongoose.Schema.Types.ObjectId, ref: "system_user", default: null },
    updated_by      : { type: mongoose.Schema.Types.ObjectId, ref: "system_user", default: null }
},
{  
    strict          : true,
    timestamps      : true
});

const TaxonomyModel = mongoose.model('system_taxonomy', TaxonomySchema);
export default TaxonomyModel;