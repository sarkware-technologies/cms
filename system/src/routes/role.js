import { Router } from "express";
import Utils from "../utils/utils.js";
import RoleService from "../services/role.js";

export default class RoleRouter {

    constructor() {

        this.router = new Router();
        this.roleService = new RoleService();
        this.moduleHandle = "role";

        this.router.get(`/${this.moduleHandle}/:id/privileges`, this.loadPrivileges);
        this.router.get(`/${this.moduleHandle}/:id/capabilities`, this.loadCapabilities);
        this.router.get(`/${this.moduleHandle}/:id`, this.get);        
        this.router.get(`/${this.moduleHandle}`, this.list);
        
        this.router.put(`/${this.moduleHandle}/:id/capabilities`, this.updateCapabilities);   
        this.router.put(`/${this.moduleHandle}/:id`, this.update);

        this.router.delete(`/${this.moduleHandle}/:id/privileges`, this.removePrivilege);
        this.router.delete(`/${this.moduleHandle}/:id`, this.delete);
        
        this.router.post(`/${this.moduleHandle}/:id/privileges`, this.addPrivilege);
        this.router.post(`/${this.moduleHandle}`, this.create);

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

    loadPrivileges = async (_req, _res) => {
        try {
          _res.status(200).json(await this.roleService.loadPrivileges(_req));
        } catch (_e) {
          Utils.handleError(_e, _res);
        }
      };
    
      addPrivilege = async (_req, _res) => {
        try {
          _res.status(200).json(await this.roleService.addPrivilege(_req));
        } catch (_e) {
          Utils.handleError(_e, _res);
        }
      };
    
      removePrivilege = async (_req, _res) => {
        try {
          _res.status(200).json(await this.roleService.removePrivilege(_req));
        } catch (_e) {
          Utils.handleError(_e, _res);
        }
      };

}