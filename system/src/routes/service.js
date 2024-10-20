import { Router } from "express";
import Utils from "../utils/utils.js";
import ServiceService from "../services/service.js";

export default class ServiceRouter {

    constructor() {

        this.router = new Router();
        this.serviceService = new ServiceService();

        this.router.get("/service/all", this.listAll);
        this.router.get("/service/:id", this.get);
        this.router.get("/services", this.list);     
        this.router.put("/service/:id", this.update);
        this.router.delete("/service/:id", this.delete);
        this.router.post("/service", this.create);

        this.router.get("/services/:id/modules", this.listModules);
        this.router.get("/services/:id/versions", this.listVersions);

    }

    getRoutes = () => {
        return this.router;
    };

    list = async (_req, _res) => {
        try {
            _res.status(200).json(await this.serviceService.list(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    listAll = async (_req, _res) => {
        try {
            _res.status(200).json(await this.serviceService.listAll(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    listModules = async (_req, _res) => {
        try {
            _res.status(200).json(await this.serviceService.listModules(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    listVersions = async (_req, _res) => {
        try {
            _res.status(200).json(await this.serviceService.listVersions(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    get = async (_req, _res) => {
        try {
            _res.status(200).json(await this.serviceService.get(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    update = async (_req, _res) => {
        try {
            _res.status(200).json(await this.serviceService.update(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    delete = async (_req, _res) => {
        try {
            _res.status(200).json(await this.serviceService.delete(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    create = async (_req, _res) => {
        try {
            _res.status(200).json(await this.serviceService.create(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

}