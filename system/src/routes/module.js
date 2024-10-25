import { Router } from "express";
import Utils from "../utils/utils.js";
import ModuleService from "../services/module.js";

export default class ModuleRouter {

    constructor() {

        this.router = new Router();
        this.moduleService = new ModuleService();
        this.moduleHandle = "module";

        this.router.get(`/${this.moduleHandle}/all`, this.listAll);
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
            _res.status(200).json(await this.moduleService.list(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    listAll = async (_req, _res) => {
        try {
            _res.status(200).json(await this.moduleService.listAll(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    get = async (_req, _res) => {
        try {
            _res.status(200).json(await this.moduleService.get(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    update = async (_req, _res) => {
        try {
            _res.status(200).json(await this.moduleService.update(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    delete = async (_req, _res) => {
        try {
            _res.status(200).json(await this.moduleService.delete(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    create = async (_req, _res) => {
        try {
            _res.status(200).json(await this.moduleService.create(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

}