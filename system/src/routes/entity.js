import { Router } from 'express';
import EntityService from '../services/entity.js';
import Utils from '../utils/utils.js';

export default class EntityRouter {
     
    constructor() {
 
        this.router = new Router();
        this.entityService = new EntityService();         
        
        this.router.get("/entity/count", this.count);          
        this.router.get("/entity/:id/fields", this.listFields);        
        this.router.get("/entity/:id", this.get);
        this.router.get("/entity", this.list);        
        this.router.post("/entity", this.create);      
        this.router.put("/entity/:id", this.update);       
        this.router.delete("/entity/:id", this.delete);
 
    }

    getRoutes = () => { return this.router; };

    get = async (_req, _res) => {
        try {
            _res.status(200).json(await this.entityService.get(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    list = async (_req, _res) => {
        try {
            _res.status(200).json(await this.entityService.list(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    count = async (_req, _res) => {
        try {
            _res.status(200).json(await this.entityService.count(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    create = async (_req, _res) => {
        try {
            _res.status(200).json(await this.entityService.create(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    update = async (_req, _res) => {
        try {
            _res.status(200).json(await this.entityService.update(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    delete = async (_req, _res) => {
        try {
            _res.status(200).json(await this.entityService.delete(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    listFields = async (_req, _res) => {
        try {
            _res.status(200).json(await this.entityService.listFields(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

}