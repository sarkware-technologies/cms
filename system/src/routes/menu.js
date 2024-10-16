import { Router } from "express";
import Utils from "../utils/utils.js";
import MenuService from "../services/menu.js";

export default class MenuRouter {

    constructor() {

        this.router = new Router();
        this.menuService = new MenuService();

        this.router.get("/menu/all", this.listAll);
        this.router.get("/menu/:id", this.get);             
        this.router.get("/menus", this.list);
        this.router.put("/menu/:id", this.update);
        this.router.delete("/menu/:id", this.delete);
        this.router.post("/menu", this.create);

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