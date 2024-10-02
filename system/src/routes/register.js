import { Router } from "express";
import Utils from "../utils/utils.js";
import RegisterService from "../services/register.js";

export default class RegisterRouter {

    constructor() {

        this.router = new Router();
        this.registerService = new RegisterService();

        this.router.get("/register/:id", this.get);
        this.router.get("/registers", this.list);        
        this.router.put("/register/:id", this.update);
        this.router.delete("/register/:id", this.delete);
        this.router.post("/register/create", this.create);

        this.router.put("/register/:id/approve", this.approve);
        this.router.put("/register/:id/reject", this.reject);

    }

    getRoutes = () => {
        return this.router;
    };

    list = async (_req, _res) => {
        try {
            _res.status(200).json(await this.registerService.listRegisters(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    get = async (_req, _res) => {
        try {
            _res.status(200).json(await this.registerService.getRegister(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    update = async (_req, _res) => {
        try {
            _res.status(200).json(await this.registerService.updateRegister(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    delete = async (_req, _res) => {
        try {
            _res.status(200).json(await this.registerService.deleteRegister(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    create = async (_req, _res) => {
        try {
            _res.status(200).json(await this.registerService.createRegister(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    approve = async (_req, _res) => {
        try {
            _res.status(200).json(await this.registerService.approveRegister(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    reject = async (_req, _res) => {
        try {
            _res.status(200).json(await this.registerService.rejectRegister(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

}