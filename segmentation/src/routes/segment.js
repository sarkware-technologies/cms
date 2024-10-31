import { Router } from "express";
import Utils from "../utils/utils.js";
import SegmentService from "../services/segment.js";
import RC from "../utils/request-interceptor.js";

const router = Router();
const segmentService = new SegmentService();
const moduleHandle = "segment";

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
    `/${moduleHandle}/:id/exclusiveRetailers`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await segmentService.listExclusiveRetailers(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}/:id/inclusiveRetailers`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await segmentService.listInclusiveRetailers(req));
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
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.put(
    `/${moduleHandle}/:id/deleteRetailers`,
    await RC.interceptRequest(moduleHandle, 'put', [], async (req, res) => {
        try {
            res.status(200).json(await segmentService.deleteRetailersFromSegment(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.put(
    `/${moduleHandle}/:id/retailers`,
    await RC.interceptRequest(moduleHandle, 'put', [], async (req, res) => {
        try {
            res.status(200).json(await segmentService.addRetailersToSegment(req));
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