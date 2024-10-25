import { Router } from "express";
import Utils from "../utils/utils.js";
import AuthTypeService from "../services/auth-type.js";

export default class AuthTypeRouter {

    constructor() {

        this.router = new Router();
        this.authTypeService = new AuthTypeService();
        this.moduleHandle = "auth_type";

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
            _res.status(200).json(await this.authTypeService.list(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    listAll = async (_req, _res) => {
        try {
            _res.status(200).json(await this.authTypeService.listAll(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    get = async (_req, _res) => {
        try {
            _res.status(200).json(await this.authTypeService.get(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    update = async (_req, _res) => {
        try {
            _res.status(200).json(await this.authTypeService.update(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    delete = async (_req, _res) => {
        try {
            _res.status(200).json(await this.authTypeService.delete(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    create = async (_req, _res) => {
        try {
            _res.status(200).json(await this.authTypeService.create(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

}