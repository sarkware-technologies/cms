import { Router } from "express";
import AuthService from "../services/authentication.js";
import Utils from "../utils/utils.js";

export default class AuthRouter {

    constructor() {

        this.router = new Router();
        this.authService = new AuthService();

        this.router.post("/auth/sign-in", this.signIn);
        this.router.post("/auth/sign-out", this.signOut);
        this.router.post("/auth/refresh-access-token", this.refreshAccessToken);
        this.router.post("/auth/reset-password", this.resetPassword);        
        this.router.post("/auth/select-role", this.selectRole);
        this.router.post("/auth/send-forgot-password-token", this.sendForgotPasswordToken);
        this.router.post("/auth/submit-forgot-password", this.submitForgotPassword);
    
    }

    getRoutes = () => {
        return this.router;
    };

    signIn = async (_req, _res) => {
        try {
            _res.status(200).json(await this.authService.signIn(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    selectRole = async (_req, _res) => {
        try {
            _res.status(200).json(await this.authService.selectRole(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    signOut = async (_req, _res) => { 
        try {
            _res.status(200).json(await this.authService.signOut(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    resetPassword = async (_req, _res) => {
        try {
            _res.status(200).json(await this.authService.resetPassword(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    sendForgotPasswordToken = async (_req, _res) => {
        try {
            _res.status(200).json(await this.authService.sendForgotPasswordToken(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    submitForgotPassword = async () => {
        try {
            _res.status(200).json(await this.authService.submitForgotPassword(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    refreshAccessToken = async () => {
        try {
            _res.status(200).json(await this.authService.submitForgotPassword(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

}