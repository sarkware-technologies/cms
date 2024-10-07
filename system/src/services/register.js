import bcrypt from "bcrypt";
import RoleModel from "../models/role.js";
import RegisterModel from "../models/register.js"
import UserService from "./user.js";
import Utils from "../utils/utils.js";

export default class RegisterService {

    constructor () {
        this.userService = new UserService();
    }

    list = async (_req) => {

        try {

            let _registers = [];

            const page = parseInt(_req.query.page) || 1;
            const skip = (page - 1) * parseInt(process.env.PAGE_SIZE);
            const limit = parseInt(process.env.PAGE_SIZE);

            const searchFor = _req.query.search ? _req.query.search : "";
            const searchFrom = _req.query.field ? _req.query.field : "";

            const filter = _req.query.filter ? _req.query.filter : "";
            const filterBy = _req.query.filter_by ? _req.query.filter_by : "";
            const filterType = _req.query.filter_type ? _req.query.filter_type : "";

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

            const _count = await RegisterModel.countDocuments({});
            _registers = await RegisterModel.find({}).sort({ title: 1 }).skip(skip).limit(limit).lean();
            
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

    approve = async (_req) => {

        try {

            const register = await RegisterModel.findOneById(_req.param.id).lean();
            if (register) {

                if (!register.isApproved) {

                    await RegisterModel.findByIdAndUpdate(_req.param.id, { $set: { isApproved: true } }, { runValidators: true, new: false });   
                    await this.userService.createFromRegister(register);

                    return { status: true, message: "Approved successfully" }

                } else {
                    throw new Error("Already approved");
                }

            }

        } catch (e) {
            throw e;
        }

    };

    reject = async (_req) => {

    };

    getRoles = async (_req) => {

        try {
            return await RoleModel.find({}).sort({ title: 1 }).lean();
        } catch (e) {
            throw e;
        }

    };

}