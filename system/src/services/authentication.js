import RoleModel from "../models/role.js";
import UserLoginDetailsModel from "../models/user-login-details.js";
import UserRoleMappingModel from "../models/user-role-mapping.js";
import UserModel from "../models/user.js";
import TokenManager from "../utils/token-manager.js";

import bcrypt from "bcrypt";

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
                        if (userLoginDetails && userLoginDetails.isLocked && userLoginDetails.isLocked()) {
                            const remainingTimeMs = userLoginDetails.lockUntil - Date.now();
                            const remainingMinutes = Math.ceil(remainingTimeMs / (1000 * 60));
                            return {
                                type: "locked",
                                remaining: userLoginDetails.lockUntil,
                                message: `Account locked. Try again after ${remainingMinutes} minutes.`
                            };
                        }  

                        /* Check roles */
                        const _roles = await UserRoleMappingModel.find({user: user._id}).populate("role").lean().exec();
                        const roles = _roles.map(mapping => {
                            return {
                                _id: mapping.role._id,
                                title: mapping.role.title
                            };
                        });

                        if (roles && roles.length > 0) {

                            if (roles.length === 1) {
                                return await this.prepareUser(user, _roles[0]);
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
                            { $set: { failedAttempt: (updatedFailedAttempt + 1) } },
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

        if (!_req.body.user) {
            throw new Error("User name is missing");
        }

        if (!_req.body.password) {
            throw new Error("Password is missing");
        }

        if (!_req.body.role) {
            throw new Error("Role is missing");
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

                        const userLoginDetails = await UserLoginDetailsModel.findOne({ userId: user._id }).lean();
                        if (userLoginDetails && userLoginDetails.isLocked) {
                            return {
                                type: "locked",
                                remaining: userLoginDetails.updatedAt,
                                message: "Account locked. Try again after 15 minutes."
                            };
                        }  

                        /* Check one more time the the selected role is indeed maapped for the user */
                        const _roles = await UserRoleMappingModel.find({user: user._id, role: _req.body.role}).populate("role").lean().exec();

                        if (_roles && _roles.length == 1) {
                            return await this.prepareUser(user, _roles[0]);
                        }

                        throw new Error("An error occurred while setup user session");

                    }

                } else {
                    throw new Error("Your account is disabled, please contact support team");
                }

            } else {
                throw new Error("Username or password is invalid");
            }

            if (_req.user && _req.user._id) {
                return await UserRoleMappingModel.find({user: user._id}).populate("role").lean().exec();
            } else {
                throw new Error("An error occurred while retrieving the user roles");
            }

        } catch (e) { console.log(e);
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

    prepareUser = async (_user, _mapping) => {

        const {
            accessToken,
            refreshToken
        } = this.TM.issueToken(_user._id, _mapping.role._id);

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
            roleName: _mapping.role.title,
            accessToken,
            refreshToken
        }

    };

}