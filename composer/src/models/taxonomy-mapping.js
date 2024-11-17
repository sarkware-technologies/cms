import mongoose from'mongoose';

/**
 *
 * @author  : Sark
 * @version : 1.0.0
 * @description : Base schema for Taxonomy
 *
 */

export const TaxonomyMappingSchema = new mongoose.Schema({   
    taxonomy            : { type: mongoose.Schema.Types.ObjectId, ref: "system_taxonomy", default: null },          
    entity              : { type: mongoose.Schema.Types.ObjectId, ref: "system_entity", default: null },   
    status              : { type: Boolean, required: true },
    created_by          : { type: mongoose.Schema.Types.ObjectId, ref: "system_user", default: null },
    updated_by          : { type: mongoose.Schema.Types.ObjectId, ref: "system_user", default: null }
},
{  
    strict              : true,
    timestamps          : true
});

const TaxonomyMappingModel = mongoose.model('system_taxonomy_mapping', TaxonomyMappingSchema);
export default TaxonomyMappingModel;