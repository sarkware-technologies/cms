import { Router } from "express";
import Utils from "../utils/utils.js";
import RegisterService from "../services/register.js";

export default class RegisterRouter {

    constructor() {

        this.router = new Router();
        this.registerService = new RegisterService();
        this.moduleHandle = "register";

        this.router.get(`/${this.moduleHandle}/user-types`, this.getRoles);
        this.router.get(`/${this.moduleHandle}/:id`, this.get);
        this.router.get(`/${this.moduleHandle}`, this.list);        

        this.router.put(`/${this.moduleHandle}/:id/update-approve`, this.approveAndUpdate);
        this.router.put(`/${this.moduleHandle}/:id/approve`, this.approve);
        this.router.put(`/${this.moduleHandle}/:id/reject`, this.reject);
        this.router.put(`/${this.moduleHandle}/:id`, this.update);

        this.router.post(`/${this.moduleHandle}`, this.create);
        this.router.delete(`/${this.moduleHandle}/:id`, this.delete);

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