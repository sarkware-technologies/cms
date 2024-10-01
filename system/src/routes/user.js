import { Router } from "express";
import Utils from "../utils/utils.js";
import UserService from "../services/user.js";

export default class UserRouter {

    constructor() {

        this.router = new Router();
        this.userService = new UserService();

        this.router.post("/user/register", this.register);

    }

    getRoutes = () => {
        return this.router;
    };

    register = async (_req, _res) => {
        try {
            _res.status(200).json(await this.userService.insertRegister(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

}