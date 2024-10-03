import { Router } from "express";
import Utils from "../utils/utils.js";
import ServiceService from "../services/service.js";

export default class ServiceRouter {

    constructor() {

        this.router = new Router();
        this.roleService = new RoleService();

        this.router.get("/service/:id", this.get);
        this.router.get("/services", this.list);     
        this.router.put("/service/:id", this.update);
        this.router.delete("/service/:id", this.delete);
        this.router.post("/service", this.create);

    }

    getRoutes = () => {
        return this.router;
    };

    list = async (_req, _res) => {
        try {
            _res.status(200).json(await this.roleService.listRoles(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    get = async (_req, _res) => {
        try {
            _res.status(200).json(await this.roleService.getRole(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    update = async (_req, _res) => {
        try {
            _res.status(200).json(await this.roleService.updateRole(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    delete = async (_req, _res) => {
        try {
            _res.status(200).json(await this.roleService.deleteRole(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    create = async (_req, _res) => {
        try {
            _res.status(200).json(await this.roleService.createRole(_req));
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