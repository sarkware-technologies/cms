import UserLoginDetailsModel from "../models/user-login-details";
import UserRoleMappingModel from "../models/user-role-mapping";
import TokenManager from "../utils/token-manager.js";

export default class AuthService {

    constructor () {
        this.TM = new TokenManager();
    }

    signIn = async (_req) => {

        if (!_req.body.user) {
            throw new Error("User name is missing");
        }

        if (!_req.body.password) {
            throw new Error("Password is missing");
        }

        try {

            /* Step 1 - check for mobile */
            let user = await UserModel.findOne({ mobile: _req.body.user }).lean({ virtuals: true });

            if (!user) {
                /* Step 2 - check for email */
                user = await UserModel.findOne({ email: _req.body.user }).lean({ virtuals: true });
            }

            if (user) {

                if (user.status) {

                    let isValid = await bcrypt.compare(_req.body.password, user.password);
                    if (isValid) {

                        const userLoginDetails = await UserLoginDetailsModel.findOne({ userId: user._id });

                        if (userLoginDetails && userLoginDetails.isLocked()) {
                            throw new Error("Account locked. Try again after 15 minutes.");
                        }

                        /* Check roles */
                        const roles = await UserRoleMappingModel.find({user: user._id}).populate("role").lean().exec();

                        if (roles) {

                            if (roles.length === 1) {
                                return await this.prepareUser(user, roles);
                            } else {
                                return {
                                    type: "role",
                                    roles: roles,
                                    tempAccessToken: this.TM.issueTempToken(user._id)
                                };
                            }

                        } else {
                            throw new Error("Your account has no roles assigned, please contact support team");
                        }

                    } else {

                        const loginDetails = await UserLoginDetailsModel.findOne({userId: user._id}).lean();
                        const updatedFailedAttempt = loginDetails ? loginDetails.failedAttempt : 0;

                        await UserLoginDetailsModel.updateOne(
                            { userId: user._id },
                            { $set: { failedAttempt: updatedFailedAttempt++ } },
                            { upsert: true }
                        );

                        throw new Error("Username or password is invalid");

                    }

                } else {
                    throw new Error("Your account is disabled, please contact support team");
                }

            } else {
                throw new Error("Username or password is invalid");
            }

        } catch (e) {
            throw e;
        }

    };

    selectRole = async (_req) => {

        try {



        } catch (e) {
            throw e;
        }

    };

    signOut = async (_req) => {

        try {



        } catch (e) {
            throw e;
        }

    };

    resetPassword = async (_req) => {

        try {



        } catch (e) {
            throw e;
        }

    };

    sendForgotPasswordToken = async (_req) => {

        try {



        } catch (e) {
            throw e;
        }

    };

    submitForgotPassword = async (_req) => {

        try {



        } catch (e) {
            throw e;
        }

    };

    prepareUser = async (_user, _role) => {

        const {
            accessToken,
            refreshToken
        } = this.TM.issueToken(_user._id, _role._id);

        await UserLoginDetailsModel.updateOne(
            { userId: _user._id },
            { $set: { 
                accessToken,
                refreshToken,
                lastLoggedIn: Date.now()
            }},
            { upsert: true }
        );

        return {
            type: "success",
            email: _user.email,
            mobile: _user.mobile,
            fullName: _user.fullName,
            roleName: _role.title,
            accessToken,
            refreshToken
        }

    };

}