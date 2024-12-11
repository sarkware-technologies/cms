import { Router } from 'express';
import axios from "axios";

import Utils from '../utils/utils.js';

export default class CacheRouter {
     
    constructor() {
 
        this.router = new Router();
        this.router.get("/cache/invalidatePageCache", this.invalidatePageCache);        
        this.router.get("/cache/invalidateAllPageCache", this.invalidateAllPageCache);        
 
    }

    getRoutes = () => { return this.router; };

    invalidatePageCache = async (_req, _res) => {
        try {

            const response = await axios.get(process.env.COMPOSER_SERVER +"/cms/api/invalidatePageCache?page="+ _req.query.page);
            _res.status(200).json(response.data);

        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    invalidateAllPageCache = async (_req, _res) => {
        try {
            
            const response = await axios.get(process.env.COMPOSER_SERVER  +"/cms/api/invalidateAllPageCache");
            _res.status(200).json(response.data);

        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };   

}