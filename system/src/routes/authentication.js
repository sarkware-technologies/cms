import { Router } from "express";
import AuthService from "../services/authentication.js";
import Utils from "../utils/utils.js";

export default class AuthRouter {

    constructor() {

        this.router = new Router();
        this.authService = new AuthService();

        this.router.post("/user/sign-in", this.signin);
        this.router.post("/user/sign-out", this.signout);
        this.router.get("/user/reset", this.resetPassword);
        this.router.get("/user/forgot-password", this.forgotPassword);

    }

    getRoutes = () => {
        return this.router;
    };

    signin = async (_req, _res) => {
        try {
            _res.status(200).json(await this.authService.signin(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    signout = async (_req, _res) => { };

    resetPassword = async (_req, _res) => { };

    forgotPassword = async (_req, _res) => { };

}