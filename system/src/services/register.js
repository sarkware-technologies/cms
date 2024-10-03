import bcrypt from "bcrypt";
import RoleModel from "../models/role.js";
import RegisterModel from "../models/register.js"

export default class RegisterService {

    constructor () {}

    list = async (_req) => {

    };

    get = async (_req) => {

    };

    update = async (_req) => {

    };

    delete = async (_req) => {

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