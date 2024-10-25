import { Router } from "express";
import Utils from "../utils/utils.js";
import AuthTypeService from "../services/auth-type.js";
import RC from '../utils/request-interceptor.js';

const router = Router();
const authTypeService = new AuthTypeService();
const moduleHandle = "auth_type";

router.get(
    `/${moduleHandle}/all`,
    await RC.interceptRequest(moduleHandle, 'get', [{ roles: [], privileges: [] }], async (req, res) => {
        try {
            res.status(200).json(await authTypeService.listAll(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}/:id`,
    await RC.interceptRequest(moduleHandle, 'get', [{ roles: [], privileges: [] }], async (req, res) => {
        try {
            res.status(200).json(await authTypeService.get(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}`,
    await RC.interceptRequest(moduleHandle, 'get', [{ roles: [], privileges: [] }], async (req, res) => {
        try {
            res.status(200).json(await authTypeService.list(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.put(
    `/${moduleHandle}/:id`,
    await RC.interceptRequest(moduleHandle, 'put', [{ roles: [], privileges: [] }], async (req, res) => {
        try {
            res.status(200).json(await authTypeService.update(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.delete(
    `/${moduleHandle}/:id`,
    await RC.interceptRequest(moduleHandle, 'delete', [{ roles: [], privileges: [] }], async (req, res) => {
        try {
            res.status(200).json(await authTypeService.delete(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.post(
    `/${moduleHandle}`,
    await RC.interceptRequest(moduleHandle, 'post', [{ roles: [], privileges: [] }], async (req, res) => {
        try {
            res.status(200).json(await authTypeService.create(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

export default router;