import { Router } from 'express';
import EntityService from '../services/entity.js';
import Utils from '../utils/utils.js';
import RC from '../utils/request-interceptor.js';

const router = Router();
const entityService = new EntityService();
const moduleHandle = "entity";

router.get(
    `/${moduleHandle}/count`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await entityService.count(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}/all`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await entityService.listAll(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}/:id/fields`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await entityService.listFields(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}/:id`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await entityService.get(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await entityService.list(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.post(
    `/${moduleHandle}`,
    await RC.interceptRequest(moduleHandle, 'post', [], async (req, res) => {
        try {
            res.status(200).json(await entityService.create(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.put(
    `/${moduleHandle}/:id`,
    await RC.interceptRequest(moduleHandle, 'put', [], async (req, res) => {
        try {
            res.status(200).json(await entityService.update(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.delete(
    `/${moduleHandle}/:id`,
    await RC.interceptRequest(moduleHandle, 'delete', [], async (req, res) => {
        try {
            res.status(200).json(await entityService.delete(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

export default router;