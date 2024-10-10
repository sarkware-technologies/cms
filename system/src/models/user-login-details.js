import mongoose from'mongoose';

const UserLoginDetailsSchema = new mongoose.Schema({
    userId                  : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    accessToken             : { type: String, default: null },
    refreshToken            : { type: String, default: null },
    tempToken               : { type: String, default: null },
    isRevoked               : { type: Boolean, default: false },
    lastLoggedIn            : { type: Date, default: null },
    lastRefreshedIn         : { type: Date, default: null },
    lastPasswordUpdated     : { type: Date, default: null },
    failedAttempt           : { type: Number, default: 0 },
    lockUntil               : { type: Date, default: null },
    createdBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
    updatedBy               : { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null }
},
{  
    strict                  : true,
    timestamps              : true
});

UserLoginDetailsSchema.pre('updateOne', function (next) {

    const update = this.getUpdate();
    const failedAttempt = update.$set?.failedAttempt;

    if (failedAttempt >= 3 && (!this.lockUntil || this.lockUntil < Date.now())) {
        const lockUntil = Date.now() + 3 * 60 * 1000;  // 15 minutes lock period

        this.setUpdate({
            ...update,
            $set: {
                ...update.$set,
                lockUntil: lockUntil  // Set lockUntil field
            }
        });
    }

    next();

});

UserLoginDetailsSchema.methods.resetLockIfExpired = async function () {
    // If the lock has expired, reset failedAttempt and lockUntil
    if (this.lockUntil && this.lockUntil <= Date.now()) {
        this.failedAttempt = 0;
        this.lockUntil = null;
        await this.save();  // Save changes
    }
};

UserLoginDetailsSchema.methods.isLocked = function () {
    return this.lockUntil && this.lockUntil > Date.now();
};

const UserLoginDetailsModel = mongoose.model('cms_system_user_login_details', UserLoginDetailsSchema);
export default UserLoginDetailsModel;