import { Router } from "express";
import Utils from "../utils/utils.js";
import RegisterService from "../services/register.js";

export default class RegisterRouter {

    constructor() {

        this.router = new Router();
        this.registerService = new RegisterService();

        this.router.get("/register/user-types", this.getRoles);
        this.router.get("/register/:id", this.get);
        this.router.get("/registers", this.list);        
        this.router.put("/register/:id", this.update);
        this.router.delete("/register/:id", this.delete);
        this.router.post("/register", this.create);
        
        this.router.put("/register/:id/update-approve", this.approveAndUpdate);
        this.router.put("/register/:id/approve", this.approve);
        this.router.put("/register/:id/reject", this.reject);

    }

    getRoutes = () => {
        return this.router;
    };

    list = async (_req, _res) => {
        try {
            _res.status(200).json(await this.registerService.list(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    get = async (_req, _res) => {
        try {
            _res.status(200).json(await this.registerService.get(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    update = async (_req, _res) => {
        try {
            _res.status(200).json(await this.registerService.update(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    delete = async (_req, _res) => {
        try {
            _res.status(200).json(await this.registerService.delete(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    create = async (_req, _res) => {
        try {
            _res.status(200).json(await this.registerService.create(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    approveAndUpdate = async (_req, _res) => {
        try {
            _res.status(200).json(await this.registerService.approveAndUpdate(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    approve = async (_req, _res) => {
        try {
            _res.status(200).json(await this.registerService.approve(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    reject = async (_req, _res) => {
        try {
            _res.status(200).json(await this.registerService.reject(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    getRoles = async (_req, _res) => {
        try {
            _res.status(200).json(await this.registerService.getRoles(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

}