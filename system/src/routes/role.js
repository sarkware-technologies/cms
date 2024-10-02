import { Router } from "express";
import Utils from "../utils/utils.js";
import RoleService from "../services/role.js";

export default class RoleRouter {

    constructor() {

        this.router = new Router();
        this.roleService = new RoleService();

        this.router.get("/role/:id", this.get);
        this.router.get("/roles", this.list);        
        this.router.put("/role/:id", this.update);
        this.router.delete("/role/:id", this.delete);
        this.router.post("/role/create", this.create);

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

}