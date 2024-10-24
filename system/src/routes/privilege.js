import { Router } from 'express';
import PrivilegeService from '../services/privilege.js';
import Utils from '../utils/utils.js';

export default class PrivilegeRouter {
     
    constructor() {
 
        this.router = new Router();
        this.privilegeService = new PrivilegeService(); 

        this.router.get("/privileges-all", this.listAll);                
        this.router.get("/privileges", this.list);                
        this.router.get("/privilege/count", this.count);                
        this.router.get("/privilege/:id", this.get);     
        this.router.post("/privilege", this.create);                                
        this.router.put("/privilege/:id", this.update);       
        this.router.delete("/privilege/:id", this.delete);       
 
    }

    getRoutes = () => { return this.router; }

    get = async (_req, _res) => {
        try {
            _res.status(200).json(await this.privilegeService.get(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    }

    listAll = async (_req, _res) => {
        try {
            _res.status(200).json(await this.privilegeService.listAll(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    }

    list = async (_req, _res) => {
        try {
            _res.status(200).json(await this.privilegeService.list(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    }

    count = async (_req, _res) => {
        try {
            _res.status(200).json(await this.privilegeService.count(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    }

    create = async (_req, _res) => {
        try {
            _res.status(200).json(await this.privilegeService.create(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    }

    update = async (_req, _res) => {
        try {
            _res.status(200).json(await this.privilegeService.update(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    }

    delete = async (_req, _res) => {
        try {
            _res.status(200).json(await this.privilegeService.delete(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    }

}