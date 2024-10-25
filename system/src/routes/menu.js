import { Router } from "express";
import Utils from "../utils/utils.js";
import MenuService from "../services/menu.js";

export default class MenuRouter {

    constructor() {

        this.router = new Router();
        this.menuService = new MenuService();
        this.moduleHandle = "menu";

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
            _res.status(200).json(await this.menuService.list(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    listAll = async (_req, _res) => {
        try {
            _res.status(200).json(await this.menuService.listAll(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    get = async (_req, _res) => {
        try {
            _res.status(200).json(await this.menuService.get(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    update = async (_req, _res) => {
        try {
            _res.status(200).json(await this.menuService.update(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    delete = async (_req, _res) => {
        try {
            _res.status(200).json(await this.menuService.delete(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    create = async (_req, _res) => {
        try {
            _res.status(200).json(await this.menuService.create(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

}