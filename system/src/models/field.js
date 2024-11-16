import mongoose from'mongoose';
import FieldUsage from '../enums/field-usage.js'

const FieldSchema = new mongoose.Schema({  
    title           : { type: String, required: true },  
    handle          : { type: String, required: true },
    type            : { type: Number, required: true },             
    required        : { type: Boolean, default: false },
    unique          : { type: Boolean, default: false },
    index           : { type: Boolean, default: false },
    compound        : { type: Boolean, default: false },
    options         : { type: Object, default: {} },
    usage           : { type: Number, default: FieldUsage.BOTH },         
    entity          : { type: mongoose.Schema.Types.ObjectId, ref: 'cms_system_entity', required: true },
    status          : { type: Boolean, default: false },
    createdBy       : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy       : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null }
},
{  
    strict          : true,
    timestamps      : true
});

FieldSchema.index({ handle: 1, entity: 1 }, { unique: true });

FieldSchema.pre('save', async function (next) {
    try {
        const existingField = await this.constructor.findOne({ handle: this.handle, entity: this.entity });
        if (existingField) {
            const err = new Error(`Field with handle '${this.handle}' already exists for this entity.`);
            return next(err);
        }
        next();
    } catch (err) {
        return next(err);
    }
});

const FieldModel = mongoose.model('cms_system_field', FieldSchema);
export default FieldModel;