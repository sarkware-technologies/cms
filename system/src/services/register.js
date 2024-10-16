import bcrypt from "bcrypt";
import RoleModel from "../models/role.js";
import RegisterModel from "../models/register.js"
import UserService from "./user.js";
import Utils from "../utils/utils.js";
import PasswordComplex from "../enums/password-complex.js";
import NotificationService from "../utils/notifier.js";
import UserModel from "../models/user.js";

export default class RegisterService {

    constructor () {

        this.emailRegx = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        this.mobileRegx = /^[6-9]\d{9}$/;
        this.alphaRegx = /^(?=.*[a-z])(?=.*[A-Z]).+$/;
        this.numberRegx = /^(?=.*\d).+$/;
        this.specialRegx = /^(?=.*[!@#$%^&*(),.?":{}|<>]).+$/;

        this.userService = new UserService();
        this.notifier = new NotificationService();

    }

    list = async (_req) => {

        try {

            let _registers = [];

            const page = parseInt(_req.query.page) || 1;
            const skip = (page - 1) * parseInt(process.env.PAGE_SIZE);
            const limit = parseInt(process.env.PAGE_SIZE);

            const searchFor = _req.query.search ? _req.query.search : "";
            const searchFrom = _req.query.field ? _req.query.field : "";
            const populate = _req.query.populate ? _req.query.populate : false;

            const filter = _req.query.filter ? _req.query.filter : "";
            const filterBy = _req.query.filter_by ? _req.query.filter_by : "";
            const filterType = _req.query.filter_type ? _req.query.filter_type : "";

            let _isApproved = _req.query.isApproved ? _req.query.isApproved : null;

            if (_isApproved === 'null') {
                _isApproved = null;
            } else if (_isApproved === 'true') {
                _isApproved = true;
            } else if (_isApproved === 'false') {
                _isApproved = false;
            }

            if (searchFrom !== "") {
                return await this.search(_req, page, skip, limit, searchFrom, searchFor);
            }

            if (filter !== "") {
                if (filterType === "seeds") {
                    return await this.groupSeed(_req, filter);
                } else {
                    return await this.groupBy(_req, page, skip, limit, filter, filterBy);
                }
            }

            const _count = await RegisterModel.countDocuments({isApproved: _isApproved});

            if (populate) {                
                _registers = await RegisterModel.find({isApproved: _isApproved}).populate('userType').sort({ title: 1 }).skip(skip).limit(limit).lean().exec();                
            } else {
                _registers = await RegisterModel.find({isApproved: _isApproved}).sort({ title: 1 }).skip(skip).limit(limit).lean();
            }

            return Utils.response(_count, page, _registers);

        } catch (e) {
            throw e;
        }

    };

    search = async (_req, _page, _skip, _limit, _field, _search) => {

        try {

            const _count = await RegisterModel.countDocuments({ [_field]: { $regex: new RegExp(_search, 'i') } });
            const _roles = await RegisterModel.find({ [_field]: { $regex: new RegExp(_search, 'i') } }).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();

            return Utils.response(_count, _page, _roles);

        } catch (_e) {
            throw _e;
        }

    };

    groupSeed = async(_req, _field) => { 

        try {
            return await RegisterModel.distinct(_field).exec();
        } catch (_e) {
            throw _e;
        }

    };

    groupBy = async(_req, _page, _skip, _limit, _field, _match) => { 

        try {

            let query = {};
            if (_match) {
                query[_field] = { $in: _match.split('|') };
            }

            const _count = await RegisterModel.countDocuments(query);
            const _roles = await RegisterModel.find(query).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();

            return Utils.response(_count, _page, _roles);

        } catch (_e) {
            throw _e;
        }

    };

    count = async (_req) => {

        try {
            return await RegisterModel.countDocuments({});
        } catch (_e) {
            throw _e;
        }

    };

    get = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Register id is missing");
        }

        try {
            return await RegisterModel.findOne({ _id: _req.params.id }).lean();
        } catch (_e) {
            throw _e;
        }

    };

    update = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Register id is missing");
        }

        try {
            return await RegisterModel.findByIdAndUpdate(_req.params.id, { $set: { ..._req.body } }, { runValidators: true, new: true });
        } catch (_e) {
            throw _e;
        }

    };

    delete = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Register id is missing");
        }

        try {
            return await RegisterModel.deleteOne({ _id: _req.params.id });            
        } catch (_e) {
            throw _e;
        }

    };

    create = async (_req) => {

        try {

            const { body } = _req;

            if (!body) {
                throw new Error('Request body is required');
            }

            if (!this.emailRegx.test(body.email)) {
                throw new Error('Invalid email address');
            }

            const isEmailUsed = await UserModel.findOne({email: body.email}).lean();
            if (isEmailUsed) {
                throw new Error('Email address is already used');
            }

            if (!this.mobileRegx.test(body.mobile)) {
                throw new Error('Invalid mobile number');
            }

            const isMobileUsed = await UserModel.findOne({mobile: body.mobile}).lean();
            if (isMobileUsed) {
                throw new Error('Mobile number is already used');
            }

            if (!body.userType) {
                throw new Error('userType is required');
            }

            const role = await RoleModel.findById(body.userType).populate("authType").lean().exec();
            if (!role) {
                throw new Error('Invalid role selected');
            }

            if (role.authType.complex == PasswordComplex.SIMPLE) {
                if(body.password.length < role.authType.minLength || body.password.length > role.authType.maxLength) {
                    throw new Error('Password is strength is weak');
                }
            } else {
                if(body.password.length < role.authType.minLength || body.password.length > role.authType.maxLength || !this.alphaRegx.test(body.password) || !this.numberRegx.test(body.password) || !this.specialRegx.test(body.password)) {
                    throw new Error('Password is strength is weak');
                }
            }

            body.password = await bcrypt.hash(body.password, 12);
            const model = new RegisterModel(body);
            const registered = await model.save();           

            return {
                status: true,
                message: 'You request submitted, please wait until the administrator approve your reguest',
                payload: registered
            };

        } catch (e) {

            if (e.name === 'ValidationError') {
                return {
                    status: false,
                    message: e.errors
                };
            }
    
            return {
                status: false,
                message: e.message || 'An error occurred while registering the user'
            };

        }

    };

    approve = async (_req) => { console.log("approve hass been reached");

        try {  console.log(_req.params.id);

            const register = await RegisterModel.findById(_req.params.id).lean();  console.log(register);
            if (register) {

                if (register.isApproved === null) {

                    await RegisterModel.findByIdAndUpdate(_req.params.id, { $set: { isApproved: true, updatedBy: _req.user._id } }, { runValidators: true, new: false });
                    
                    /**
                     * 
                     * Create the User
                     * 
                     */
                    await this.userService.createFromRegister(register, _req.user._id);

                    const eBody = {
                        toEmailId: register.email,
                        data: "Hi, your registration is approved, You may start using the CMS portal"
                    }

                    this.notifier.sendEmail(eBody);

                    return { status: true, message: "Approved successfully" }

                } else {
                    if (register.isApproved) {
                        throw new Error("Already approved");
                    } else {
                        throw new Error("Already rejected");
                    }
                }

            }

        } catch (e) { console.log(e);
            throw e;
        }

    };

    reject = async (_req) => {

        try {

            const register = await RegisterModel.findById(_req.params.id).lean();
            if (register) {

                if (register.isApproved === null) {

                    await RegisterModel.findByIdAndUpdate(_req.params.id, { $set: { isApproved: false, updatedBy: _req.user._id } }, { runValidators: true, new: false });   
                    await this.userService.createFromRegister(register, _req.user._id);

                    return { status: true, message: "Rejected successfully" }

                } else {
                    if (!register.isApproved) {
                        throw new Error("Already rejected");
                    } else {
                        throw new Error("Cannot reject once it is approved");
                    }                    
                }

            }

        } catch (e) {
            throw e;
        }

    };

    getRoles = async (_req) => {

        try {
            return await RoleModel.find().populate("authType").sort({ title: 1 }).lean();
        } catch (e) {
            throw e;
        }

    };

}