import { Router } from "express";
import Utils from "../utils/utils.js";
import ServiceService from "../services/service.js";
import RC from "../utils/request-interceptor.js";

const router = Router();
const serviceService = new ServiceService();
const moduleHandle = "service";

router.get(
    `/${moduleHandle}/all`,
    await RC.interceptRequest(moduleHandle, 'get', [{ roles: [], privileges: [] }], async (req, res) => {
        try {
            res.status(200).json(await serviceService.listAll(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}/:id/modules`,
    await RC.interceptRequest(moduleHandle, 'get', [{ roles: [], privileges: [] }], async (req, res) => {
        try {
            res.status(200).json(await serviceService.listModules(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}/:id/versions`,
    await RC.interceptRequest(moduleHandle, 'get', [{ roles: [], privileges: [] }], async (req, res) => {
        try {
            res.status(200).json(await serviceService.listVersions(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}/:id`,
    await RC.interceptRequest(moduleHandle, 'get', [{ roles: [], privileges: [] }], async (req, res) => {
        try {
            res.status(200).json(await serviceService.get(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}`,
    await RC.interceptRequest(moduleHandle, 'get', [{ roles: [], privileges: [] }], async (req, res) => {
        try {
            res.status(200).json(await serviceService.list(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.put(
    `/${moduleHandle}/:id`,
    await RC.interceptRequest(moduleHandle, 'put', [{ roles: [], privileges: [] }], async (req, res) => {
        try {
            res.status(200).json(await serviceService.update(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.delete(
    `/${moduleHandle}/:id`,
    await RC.interceptRequest(moduleHandle, 'delete', [{ roles: [], privileges: [] }], async (req, res) => {
        try {
            res.status(200).json(await serviceService.delete(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.post(
    `/${moduleHandle}`,
    await RC.interceptRequest(moduleHandle, 'post', [{ roles: [], privileges: [] }], async (req, res) => {
        try {
            res.status(200).json(await serviceService.create(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

export default router;