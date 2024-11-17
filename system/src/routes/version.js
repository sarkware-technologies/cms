import { Router } from "express";
import Utils from "../utils/utils.js";
import VersionService from '../services/version.js';
import RC from '../utils/request-interceptor.js';

const router = Router();
const versionService = new VersionService();
const moduleHandle = "version";

router.get(
    `/${moduleHandle}/retailers`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await versionService.listRetailers(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}/regions`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await versionService.listRegions(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.put(
    `/${moduleHandle}/retailer`,
    await RC.interceptRequest(moduleHandle, 'put', [], async (req, res) => {
        try {
            res.status(200).json(await versionService.toggleRetailerVersion(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.put(
    `/${moduleHandle}/regions`,
    await RC.interceptRequest(moduleHandle, 'put', [], async (req, res) => {
        try {
            res.status(200).json(await versionService.toggleRegionVersion(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.post(
    `/${moduleHandle}/upload`,
    await RC.interceptRequest(moduleHandle, 'post', [], async (req, res) => {
        try {
            res.status(200).json(await versionService.handleBulkUpload(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

export default router;