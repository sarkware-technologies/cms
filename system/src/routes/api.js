import { Router } from 'express';
import Utils from '../utils/utils.js';
import AP from '../services/api.js';
import RC from '../utils/request-interceptor.js';

const router = Router();
const moduleHandle = "api";

AP.init();

const processRequest = async (req, res, method) => {
    try {
        const result = await AP.handle(req, res, method);
        res.status(200).json(result);
    } catch (error) {
        Utils.handleError(error, res);
    }
};

router.get(
    `/${moduleHandle}/*`,
    await RC.interceptRequest(moduleHandle, 'get', [{ roles: [], privileges: [] }], async (req, res) => {
        await processRequest(req, res, "get");
    })
);

router.post(
    `/${moduleHandle}/*`,
    await RC.interceptRequest(moduleHandle, 'post', [{ roles: [], privileges: [] }], async (req, res) => {
        await processRequest(req, res, "post");
    })
);

router.put(
    `/${moduleHandle}/*`,
    await RC.interceptRequest(moduleHandle, 'put', [{ roles: [], privileges: [] }], async (req, res) => {
        await processRequest(req, res, "put");
    })
);

router.delete(
    `/${moduleHandle}/*`,
    await RC.interceptRequest(moduleHandle, 'delete', [{ roles: [], privileges: [] }], async (req, res) => {
        await processRequest(req, res, "delete");
    })
);


export default router;