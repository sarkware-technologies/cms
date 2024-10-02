import bcrypt from "bcrypt";
import RegisterModel from "../models/register.js"

export default class RegisterService {

    constructor () {}

    listRegisters = async (_req) => {

    };

    getRegister = async (_req) => {

    };

    updateRegister = async (_req) => {

    };

    deleteRegister = async (_req) => {

    };

    createRegister = async (_req) => {

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

    approveRegister = async (_req) => {

    };

    rejectRegister = async (_req) => {

    };

}