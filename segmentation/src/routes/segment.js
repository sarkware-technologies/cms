import { Router } from "express";
import Utils from "../utils/utils.js";
import SegmentService from "../services/segment.js";
import RC from "../utils/request-interceptor.js";

const router = Router();
const segmentService = new SegmentService();
const moduleHandle = "segment";

router.get(
    `/${moduleHandle}/mdmLookUp/:code`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await segmentService.mdmCodeLookUp(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}/all`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await segmentService.listAll(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}/houseKeep`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await segmentService.houseKeep(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}/:id/summary`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await segmentService.segmentSummary(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}/:id/retailers`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await segmentService.listSegmentRetailers(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}/:id/blacklistedRetailers`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await segmentService.listBlacklistedRetailers(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}/:id/whitelistedRetailers`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await segmentService.listWhitelistedRetailers(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}/:id/buildHistory`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await segmentService.buildHistory(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}/:id`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await segmentService.get(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await segmentService.list(req));
        } catch (error) { console.log(error);
            Utils.handleError(error, res);
        }
    })
);

router.put(
    `/${moduleHandle}/:id/blacklistRetailers`,
    await RC.interceptRequest(moduleHandle, 'put', [], async (req, res) => {
        try {
            res.status(200).json(await segmentService.blacklistRetailersFromSegment(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.put(
    `/${moduleHandle}/:id/removeBlacklistRetailers`,
    await RC.interceptRequest(moduleHandle, 'put', [], async (req, res) => {
        try {
            res.status(200).json(await segmentService.removeBlacklistRetailersFromSegment(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.put(
    `/${moduleHandle}/:id/whitelistRetailers`,
    await RC.interceptRequest(moduleHandle, 'put', [], async (req, res) => {
        try {
            res.status(200).json(await segmentService.whitelistRetailersToSegment(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.put(
    `/${moduleHandle}/:id/removeWhitelistRetailers`,
    await RC.interceptRequest(moduleHandle, 'put', [], async (req, res) => {
        try {
            res.status(200).json(await segmentService.removeWhitelistRetailersFromSegment(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.put(
    `/${moduleHandle}/:id`,
    await RC.interceptRequest(moduleHandle, 'put', [], async (req, res) => {
        try {
            res.status(200).json(await segmentService.update(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.delete(
    `/${moduleHandle}/:id`,
    await RC.interceptRequest(moduleHandle, 'delete', [], async (req, res) => {
        try {
            res.status(200).json(await segmentService.delete(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}/:id/build/status`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await segmentService.buildStatus(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.post(
    `/${moduleHandle}/:id/build`,
    await RC.interceptRequest(moduleHandle, 'post', [], async (req, res) => {
        try {
            res.status(200).json(await segmentService.buildSegment(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.post(
    `/${moduleHandle}`,
    await RC.interceptRequest(moduleHandle, 'post', [], async (req, res) => {
        try {
            res.status(200).json(await segmentService.create(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

export default router;