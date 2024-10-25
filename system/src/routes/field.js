import { Router } from 'express';
import FieldService from '../services/field.js';
import Utils from '../utils/utils.js';

export default class FieldRouter {
     
    constructor() {
 
        this.router = new Router();
        this.fieldService = new FieldService();  
        this.moduleHandle = "field";       

        this.router.get(`/${this.moduleHandle}/count`, this.count);                
        this.router.get(`/${this.moduleHandle}/:id`, this.get);                             
        this.router.get(`/${this.moduleHandle}`, this.list);        

        this.router.post(`/${this.moduleHandle}`, this.create);
        this.router.put(`/${this.moduleHandle}/:id`, this.update);       
        this.router.delete(`/${this.moduleHandle}/:id`, this.delete);        
 
    }

    getRoutes = () => { return this.router; };

    get = async (_req, _res) => {
        try {
            _res.status(200).json(await this.fieldService.get(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    list = async (_req, _res) => {
        try {
            _res.status(200).json(await this.fieldService.list(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    count = async (_req, _res) => {
        try {
            _res.status(200).json(await this.fieldService.count(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    create = async (_req, _res) => {
        try {
            _res.status(200).json(await this.fieldService.create(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    update = async (_req, _res) => {
        try {
            _res.status(200).json(await this.fieldService.update(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);

        }
    };

    delete = async (_req, _res) => {
        try {
            _res.status(200).json(await this.fieldService.delete(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);

        }
    };  

}