import mongoose from'mongoose';

const UserLoginDetailsSchema = new mongoose.Schema({
    userId                  : { type: mongoose.Schema.Types.ObjectId, ref: "cmsSystemUser", default: null },
    accessToken             : { type: String, default: null },
    refreshToken            : { type: String, default: null },
    tempToken               : { type: String, default: null },
    isRevoked               : { type: Boolean, default: false },
    lastLoggedIn            : { type: Date, default: null },
    lastRefreshedIn         : { type: Date, default: null },
    lastPasswordUpdated     : { type: Date, default: null },
    failedAttempt           : { type: Number, default: 0 },
    lockUntil               : { type: Date, default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

UserLoginDetailsSchema.pre('save', function (next) {
    if (this.isModified('failedAttempt') && this.failedAttempt === 3) {
        
        this.lockUntil = Date.now() + 15 * 60 * 1000;
        
        setTimeout(() => {
            this.failedAttempt = 0;
            this.lockUntil = null;
            this.save();
        }, 15 * 60 * 1000);
        
    }
    next();
});

UserLoginDetailsSchema.methods.isLocked = function () {
    return this.lockUntil && this.lockUntil > Date.now();
};

const UserLoginDetailsModel = mongoose.model('cmsSystemUserLoginDetails', UserLoginDetailsSchema);
export default UserLoginDetailsModel;