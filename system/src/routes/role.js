import { Router } from "express";
import Utils from "../utils/utils.js";
import RoleService from "../services/role.js";

export default class RoleRouter {

    constructor() {

        this.router = new Router();
        this.roleService = new RoleService();

        this.router.get("/role/:id/capabilities", this.loadCapabilities);
        this.router.get("/role/:id", this.get);
        this.router.get("/roles", this.list);     
        this.router.put("/role/:id/capabilities", this.updateCapabilities);   
        this.router.put("/role/:id", this.update);
        this.router.delete("/role/:id", this.delete);
        this.router.post("/role", this.create);

    }

    getRoutes = () => {
        return this.router;
    };

    list = async (_req, _res) => {
        try {
            _res.status(200).json(await this.roleService.list(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    get = async (_req, _res) => {
        try {
            _res.status(200).json(await this.roleService.get(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    update = async (_req, _res) => {
        try {
            _res.status(200).json(await this.roleService.update(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    delete = async (_req, _res) => {
        try {
            _res.status(200).json(await this.roleService.delete(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    create = async (_req, _res) => {
        try {
            _res.status(200).json(await this.roleService.create(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    loadCapabilities = async (_req, _res) => {
        try {
            _res.status(200).json(await this.roleService.loadCapabilities(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    updateCapabilities = async (_req, _res) => {
        try {
            _res.status(200).json(await this.roleService.updateCapabilities(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

}