import UserRoleMappingModel from "../models/user-role-mapping.js";
import UserModel from "../models/user.js";
import Utils from "../utils/utils.js";

export default class UserService {

    constructor () {}

    list = async (_req) => {

        try {

            let _users = [];

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

            const _count = await UserModel.countDocuments({});
            _users = await UserModel.find({}).sort({ title: 1 }).skip(skip).limit(limit).lean();
            
            return Utils.response(_count, page, _users);

        } catch (e) {
            throw _e;
        }

    };

    search = async (_req, _page, _skip, _limit, _field, _search) => {

        try {

            const _count = await UserModel.countDocuments({ [_field]: { $regex: new RegExp(_search, 'i') } });
            const _users = await UserModel.find({ [_field]: { $regex: new RegExp(_search, 'i') } }).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();

            return Utils.response(_count, _page, _users);

        } catch (_e) {
            throw _e;
        }

    };

    groupSeed = async(_req, _field) => { 

        try {
            return await UserModel.distinct(_field).exec();
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

            const _count = await UserModel.countDocuments(query);
            const _users = await UserModel.find(query).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();

            return Utils.response(_count, _page, _users);

        } catch (_e) {
            throw _e;
        }

    };

    count = async (_req) => {

        try {
            return await UserModel.countDocuments({});
        } catch (_e) {
            throw _e;
        }

    };

    get = async (_req) => {

        if (!_req.params.id) {
            throw new Error("User id is missing");
        }

        try {
            return await UserModel.findOne({ _id: _req.params.id }).lean();
        } catch (_e) {
            throw _e;
        }

    };

    update = async (_req) => {

        if (!_req.params.id) {
            throw new Error("User id is missing");
        }

        try {
            return await UserModel.findByIdAndUpdate(_req.params.id, { $set: { ..._req.body, updatedBy: _req.user._id } }, { runValidators: true, new: true });
        } catch (_e) {
            throw _e;
        }

    };

    delete = async (_req) => {
        
        if (!_req.params.id) {
            throw new Error("User id is missing");
        }

        try {
            return await UserModel.deleteOne({ _id: _req.params.id });            
        } catch (_e) {
            throw _e;
        }

    };

    createFromRegister = async (_payload, _createdBy) => {

        try {

            const model = new UserModel({
                email: _payload.email,
                mobile: _payload.mobile,
                password: _payload.password,
                fullName: _payload.fullName,
                status: true,
                createdBy: _createdBy
            });

            const user = await model.save();

            const mapping = new UserRoleMappingModel({
                user: user._id,
                role: _payload.userType,
                createdBy: _createdBy
            });

            await mapping.save();
            
            return {
                status: true,
                message: "User "+ user.fullName +" is created successfully",
                payload: user
            };

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

            body["createdBy"] = _req.user._id;
            const model = new UserModel(body);
            const user = await model.save();     

            return {
                status: true,
                message: "User "+ user.fullName +" is created successfully",
                payload: user
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

}