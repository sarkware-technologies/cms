import RegisterModel from "../models/register"

export default class UserService {

    constructor () {}

    listRegister = (_req) => {

    }

    approveRegister = (_req) => {

    }

    rejectRegister = (_req) => {

    }

    insertRegister = async (_req) => {

        try {

            const { body } = _req;

            if (!body) {
                throw new Error('Request body is required');
            }

            const model = new RegisterModel(body);
            const registered = await model.save();

            return {
                status: true,
                message: 'You request submitted, please wait untill the adminitrator approve your ',
                payload: registered
            };

        } catch (e) {

            if (error.name === 'ValidationError') {
                return {
                    status: false,
                    message: error.errors
                };
            }
    
            return {
                status: false,
                message: error.message || 'An error occurred while registering the user'
            };

        }

    }

}