import RoleService from "./role.js";
import UserLoginDetailsModel from "../models/user-login-details.js";
import UserRoleMappingModel from "../models/user-role-mapping.js";
import UserModel from "../models/user.js";
import TokenManager from "../utils/token-manager.js";

import bcrypt from "bcrypt";

export default class AuthService {

    constructor () {
        this.TM = new TokenManager();
        this.roleService = new RoleService();
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

                    const userLoginDetails = await UserLoginDetailsModel.findOne({ userId: user._id });

                    if (userLoginDetails) {

                        await userLoginDetails.resetLockIfExpired();

                        if (userLoginDetails.isLocked && userLoginDetails.isLocked()) {
                            const remainingTimeMs = userLoginDetails.lockUntil - Date.now();
                            const remainingMinutes = Math.ceil(remainingTimeMs / (1000 * 60));
                            return {
                                type: "locked",
                                remaining: userLoginDetails.lockUntil,
                                message: `Account locked. Try again after ${remainingMinutes} minutes.`
                            };
                        }

                    }

                    let isValid = await bcrypt.compare(_req.body.password, user.password);
                    if (isValid) {

                        /* Check roles */
                        let _roles = await UserRoleMappingModel.find({user: user._id}).populate({
                            path: 'role',
                            match: { status: true }
                        }).lean().exec();

                        _roles = _roles.filter(mapping => {
                            return mapping.role;
                        });
                        
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

                                roles.unshift({_id: "", title: "Select Your Role"});

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

        } catch (e) { console.log(e);
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

        } catch (e) {
            throw e;
        }

    };

    refreshAccessToken = async (_req) => {

        try {

            const refreshTokenRes = this.TM.verifyRefreshToken();
            if (refreshTokenRes.status) {



            } else {

            }

        } catch (e) {
            throw e;
        }

    };

    signOut = async (_req) => {

        try {

            if (_req.user && _req.user._id) {

                await UserLoginDetailsModel.updateOne(
                    { userId: _req.user._id },
                    { $set: { 
                        accessToken: null,
                        refreshToken: null,
                        isRevoked: true,
                        failedAttempt: 0,
                        lockUntil: null
                    }},
                    { upsert: true }
                );

                return {status: true, message: "Logged out Successfully"};

            }

        } catch (e) {
            return {status: false, message: "Logged out Failed"};
        }

    };

    resetPassword = async (_req) => {

        try {

            const user = await UserModel.findOne({ _id: _req.user._id }).lean({ virtuals: true });

            if (user) {

                if (user.status) {

                    let isValid = await bcrypt.compare(_req.body.password, user.password);

                    if (isValid) {

                        const passwordHash = await bcrypt.hash(body.newPassword, 12);

                        await UserModel.findByIdAndUpdate(user._id, { $set: { password: passwordHash } }, { runValidators: true, new: true });                        
                        await UserLoginDetailsModel.updateOne(
                            { userId: user._id },
                            { $set: { 
                                accessToken: null,
                                refreshToken: null,
                                isRevoked: true,
                                failedAttempt: 0,
                                lockUntil: null,
                                lastPasswordUpdated: Date.now() 
                            }
                            },
                            { upsert: true }
                        );

                        return {status: true, message: "Logged out Successfully"};

                    } else {
                        return {status: false, message: "Invalid password, please enter the current password"};
                    }

                } else {
                    return {status: false, message: "Something not right, your account is already disabled"};
                }

            } else {
                return {status: false, message: "An error occurred while retrieving the user record"};
            }

        } catch (e) {
            throw e;
        }

    };

    sendForgotPasswordToken = async (_req) => {

        try {
            
            let channelType = "mobile";

            /* Step 1 - check for mobile */
            let user = await UserModel.findOne({ mobile: _req.body.user }).lean({ virtuals: true });

            if (!user) {
                channelType = "email";
                /* Step 2 - check for email */
                user = await UserModel.findOne({ email: _req.body.user }).lean({ virtuals: true });
            }

            if (user) {

                if (user.status) {

                    const _token = ""

                }

            }

            if (roles.length === 1) {
                return await this.prepareUser(user, _roles[0]);
            } else {
                return {
                    type: "role",
                    roles: roles,
                    tempAccessToken: this.TM.issueTempToken(user._id)
                };
            }


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

        try {

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
                modules: await this.roleService.prepareModulesAndCapabilities(_mapping.role._id),
                accessToken,
                refreshToken
            }

        } catch (e) {
            throw e;
        }

    };

}