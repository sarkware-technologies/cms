import { Router } from "express";
import Utils from "../utils/utils.js";
import SynchService from "../services/synch.js";
import RC from "../utils/request-interceptor.js";

const router = Router();
const synchService = new SynchService();
const moduleHandle = "synch";
const basicAuthToken = process.env.CMS_SYNC_BASIC_AUTH || "0f777851-ac8a-4f42-84f2-230f98d7c8d1";

const verifyBasicAuth = (_req) => {

    try {

        const authHeader = _req.headers["authorization"];

        if (!authHeader) {
            throw new Error("Unauthorized request - authorization header not found");
        }

        if (!authHeader.startsWith("Basic ")) {
            throw new Error("Unsupported token type - Expect Basic token");
        }

        const token = authHeader.split(" ")[1];
        if (basicAuthToken == token) {
            return true;
        } else {
            throw new Error("Unathourized, invalid token");
        }

    } catch (e) {
        throw e;
    }

};

router.post(
    `/${moduleHandle}/retailer`,
    await RC.interceptRequest(moduleHandle, 'post', [], async (req, res) => {
        try {
            verifyBasicAuth(req);
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
            verifyBasicAuth(req);
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
            verifyBasicAuth(req);
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
            verifyBasicAuth(req);
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
            verifyBasicAuth(req);
            res.status(200).json(await synchService.updateOrder(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

export default router;