import { Router } from 'express';
import Utils from '../utils/utils.js';
import ServiceVersionService from '../services/service-version.js';

export default class VersionRouter {
     
    constructor() {
 
        this.router = new Router();
        this.versionService = new ServiceVersionService(); 

        this.router.get("/versions", this.list);        
        this.router.post("/version", this.create);        
        this.router.get("/version/count", this.count);                
        this.router.get("/version/:id", this.get);                             
        this.router.put("/version/:id", this.update);       
        this.router.delete("/version/:id", this.delete);       
 
    }

    getRoutes = () => { return this.router; }

    get = async (_req, _res) => {
        try {
            _res.status(200).json(await this.versionService.get(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    }

    list = async (_req, _res) => {
        try {
            _res.status(200).json(await this.versionService.list(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    }

    count = async (_req, _res) => {
        try {
            _res.status(200).json(await this.versionService.count(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    }

    create = async (_req, _res) => {
        try {
            _res.status(200).json(await this.versionService.create(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    }

    update = async (_req, _res) => {
        try {
            _res.status(200).json(await this.versionService.update(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    }

    delete = async (_req, _res) => {
        try {
            _res.status(200).json(await this.versionService.delete(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    }

}