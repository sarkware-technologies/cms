import { Router } from "express";
import Utils from "../utils/utils.js";
import SynchService from "../services/synch.js";
import RC from "../utils/request-interceptor.js";

const router = Router();
const synchService = new SynchService();
const moduleHandle = "synch";

router.post(
    `/${moduleHandle}/retailer`,
    await RC.interceptRequest(moduleHandle, 'post', [], async (req, res) => {
        try {
            res.status(200).json(await synchService.addRetailer(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.put(
    `/${moduleHandle}/retailer`,
    await RC.interceptRequest(moduleHandle, 'put', [], async (req, res) => {
        try {
            res.status(200).json(await synchService.updateRetailer(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.delete(
    `/${moduleHandle}/retailer`,
    await RC.interceptRequest(moduleHandle, 'delete', [], async (req, res) => {
        try {
            res.status(200).json(await synchService.deleteRetailer(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.post(
    `/${moduleHandle}/order`,
    await RC.interceptRequest(moduleHandle, 'post', [], async (req, res) => {
        try {
            res.status(200).json(await synchService.addOrder(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.put(
    `/${moduleHandle}/order`,
    await RC.interceptRequest(moduleHandle, 'put', [], async (req, res) => {
        try {
            res.status(200).json(await synchService.updateOrder(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

export default router;