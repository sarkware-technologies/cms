import { Router } from 'express';
import PrivilegeService from '../services/privilege.js';
import Utils from '../utils/utils.js';
import RC from '../utils/request-interceptor.js';

const router = Router();
const privilegeService = new PrivilegeService();
const moduleHandle = "privilege";

router.get(
    `/${moduleHandle}/count`,
    await RC.interceptRequest(moduleHandle, 'get', [{ roles: [], privileges: [] }], async (req, res) => {
        try {
            res.status(200).json(await privilegeService.count(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}/all`,
    await RC.interceptRequest(moduleHandle, 'get', [{ roles: [], privileges: [] }], async (req, res) => {
        try {
            res.status(200).json(await privilegeService.listAll(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}/:id`,
    await RC.interceptRequest(moduleHandle, 'get', [{ roles: [], privileges: [] }], async (req, res) => {
        try {
            res.status(200).json(await privilegeService.get(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}`,
    await RC.interceptRequest(moduleHandle, 'get', [{ roles: [], privileges: [] }], async (req, res) => {
        try {
            res.status(200).json(await privilegeService.list(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.post(
    `/${moduleHandle}`,
    await RC.interceptRequest(moduleHandle, 'post', [{ roles: [], privileges: [] }], async (req, res) => {
        try {
            res.status(200).json(await privilegeService.create(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.put(
    `/${moduleHandle}/:id`,
    await RC.interceptRequest(moduleHandle, 'put', [{ roles: [], privileges: [] }], async (req, res) => {
        try {
            res.status(200).json(await privilegeService.update(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.delete(
    `/${moduleHandle}/:id`,
    await RC.interceptRequest(moduleHandle, 'delete', [{ roles: [], privileges: [] }], async (req, res) => {
        try {
            res.status(200).json(await privilegeService.delete(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

export default router;