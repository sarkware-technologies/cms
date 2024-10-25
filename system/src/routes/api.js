import { Router } from 'express';
import Utils from '../utils/utils.js';
import AP from '../services/api.js';

export default class ApiRouter {

    constructor() {

        AP.init();
        this.router = new Router();  
        this.moduleHandle = "api";      

        this.router.get(`/${this.moduleHandle}/*`, this.handleGet);
        this.router.post(`/${this.moduleHandle}/*`, this.handlePost);
        this.router.put(`/${this.moduleHandle}/*`, this.handlePut);
        this.router.delete(`/${this.moduleHandle}/*`, this.handleDelete);

    }

    getRoutes = () => { return this.router; }

    handleGet = async (_req, _res) => {
        await this.processRequest(_req, _res, "GET");
    };

    handlePost = async (_req, _res) => {
        await this.processRequest(_req, _res, "POST");
    };

    handlePut = async (_req, _res) => {
        await this.processRequest(_req, _res, "PUT");
    };

    handleDelete = async (_req, _res) => {
        await this.processRequest(_req, _res, "DELETE");
    };

    processRequest = async (_req, _res, _method) => {

        try {           
            const result = await AP.handle(_req, _res, _method);
            _res.status(200).json(result);
        } catch (_e) {
            Utils.handleError(_e, _res);
        }

    };

}