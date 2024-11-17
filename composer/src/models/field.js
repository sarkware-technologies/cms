import mongoose from'mongoose';
import FieldUsage from '../enums/field-usage.js'

const FieldSchema = new mongoose.Schema({  
    title           : { type: String, required: true },  
    handle          : { type: String, required: true },
    type            : { type: Number, required: true },             
    required        : { type: Boolean, default: false },
    unique          : { type: Boolean, default: false },
    options         : { type: Object, default: {} },
    usage           : { type: Number, default: FieldUsage.BOTH },         
    entity          : { type: mongoose.Schema.Types.ObjectId, ref: 'system_entity', required: true },
    status          : { type: Boolean, default: false },
    created_by      : { type: mongoose.Schema.Types.ObjectId, ref: "system_user", default: null },
    updated_by      : { type: mongoose.Schema.Types.ObjectId, ref: "system_user", default: null }
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

const FieldModel = mongoose.model('system_field', FieldSchema);
export default FieldModel;