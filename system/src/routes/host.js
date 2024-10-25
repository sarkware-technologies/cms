import { Router } from "express";
import Utils from "../utils/utils.js";
import HostService from "../services/host.js";

export default class HostRouter {

    constructor() {

        this.router = new Router();
        this.hostService = new HostService();
        this.moduleHandle = "host";
        
        this.router.get(`/${this.moduleHandle}/:id`, this.get);             
        this.router.get(`/${this.moduleHandle}`, this.list);
        this.router.put(`/${this.moduleHandle}/:id`, this.update);
        this.router.delete(`/${this.moduleHandle}/:id`, this.delete);
        this.router.post(`/${this.moduleHandle}`, this.create);

    }

    getRoutes = () => {
        return this.router;
    };

    list = async (_req, _res) => {
        try {
            _res.status(200).json(await this.hostService.list(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    get = async (_req, _res) => {
        try {
            _res.status(200).json(await this.hostService.get(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    update = async (_req, _res) => {
        try {
            _res.status(200).json(await this.hostService.update(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    delete = async (_req, _res) => {
        try {
            _res.status(200).json(await this.hostService.delete(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    create = async (_req, _res) => {
        try {
            _res.status(200).json(await this.hostService.create(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

}