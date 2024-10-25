import { Router } from 'express';
import PrivilegeService from '../services/privilege.js';
import Utils from '../utils/utils.js';

export default class PrivilegeRouter {
     
    constructor() {
 
        this.router = new Router();
        this.privilegeService = new PrivilegeService(); 
        this.moduleHandle = "privilege";

        this.router.get(`/${this.moduleHandle}/count`, this.count);                
        this.router.get(`/${this.moduleHandle}/all`, this.listAll);                
        this.router.get(`/${this.moduleHandle}/:id`, this.get);
        this.router.get(`/${this.moduleHandle}`, this.list);
        
        this.router.post(`/${this.moduleHandle}`, this.create);                                
        this.router.put(`/${this.moduleHandle}/:id`, this.update);       
        this.router.delete(`/${this.moduleHandle}/:id`, this.delete);       
 
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