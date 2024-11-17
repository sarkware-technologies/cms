import mongoose, { mongo } from'mongoose';

export const UserSegmentSchema = new mongoose.Schema({   
    userId              : { type: Number, required: true },    
    segment             : [
        {
            source: String,
            condition: String,
            segmentKey: String,
            _id: mongoose.Schema.Types.ObjectId,
            createdDate: Date,
            updatedDate: Date
        }
    ],
    __v: Number
},
{  
    strict          : true 
});

const UserSegmentModel = mongoose.model('usersegments', UserSegmentSchema);
export default UserSegmentModel;