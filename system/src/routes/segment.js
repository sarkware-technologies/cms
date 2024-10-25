import { Router } from "express";
import Utils from "../utils/utils.js";
import SegmentService from "../services/segment.js";

export default class SegmentRouter {

    constructor() {

        this.router = new Router();
        this.segmentService = new SegmentService();
        this.moduleHandle = "segment";

        this.router.get(`/${this.moduleHandle}/all`, this.listAll);       
        this.router.get(`/${this.moduleHandle}/:id/retailers`, this.listSegmentRetailers);        
        this.router.get(`/${this.moduleHandle}/:id`, this.get);
        this.router.get(`/${this.moduleHandle}`, this.list);        
        
        this.router.put(`/${this.moduleHandle}/:id/deleteRetailers`, this.deleteRetailersFromSegment);
        this.router.put(`/${this.moduleHandle}/:id/retailers`, this.addRetailersToSegment);

        this.router.put(`/${this.moduleHandle}/:id`, this.update);        
        this.router.delete(`/${this.moduleHandle}/:id`, this.delete);
        this.router.post(`/${this.moduleHandle}`, this.create);

    }

    getRoutes = () => {
        return this.router;
    };

    list = async (_req, _res) => {
        try {
            _res.status(200).json(await this.segmentService.list(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    listAll = async (_req, _res) => {
        try {
            _res.status(200).json(await this.segmentService.listAll(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    get = async (_req, _res) => {
        try {
            _res.status(200).json(await this.segmentService.get(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    update = async (_req, _res) => {
        try {
            _res.status(200).json(await this.segmentService.update(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    delete = async (_req, _res) => {
        try {
            _res.status(200).json(await this.segmentService.delete(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    create = async (_req, _res) => {
        try {
            _res.status(200).json(await this.segmentService.create(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    listSegmentRetailers = async (_req, _res) => {
        try {
            _res.status(200).json(await this.segmentService.listSegmentRetailers(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    addRetailersToSegment = async (_req, _res) => {
        try {
            _res.status(200).json(await this.segmentService.addRetailersToSegment(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

    deleteRetailersFromSegment = async (_req, _res) => {
        try {
            _res.status(200).json(await this.segmentService.deleteRetailersFromSegment(_req));
        } catch (_e) {
            Utils.handleError(_e, _res);
        }
    };

}