import { Router } from "express";
import Utils from "../utils/utils.js";
import SearchVersionService from "../services/search-version.js";
import RC from '../utils/request-interceptor.js';

const router = Router();
const searchVersionService = new SearchVersionService();
const moduleHandle = "search_version";

router.get(
    `/${moduleHandle}/retailers`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await searchVersionService.listRetailers(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}/regions`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await searchVersionService.listRegions(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.put(
    `/${moduleHandle}/retailer`,
    await RC.interceptRequest(moduleHandle, 'put', [], async (req, res) => {
        try {
            res.status(200).json(await searchVersionService.toggleRetailerVersion(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.put(
    `/${moduleHandle}/regions`,
    await RC.interceptRequest(moduleHandle, 'put', [], async (req, res) => {
        try {
            res.status(200).json(await searchVersionService.toggleRegionVersion(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.post(
    `/${moduleHandle}/upload`,
    await RC.interceptRequest(moduleHandle, 'post', [], async (req, res) => {
        try {
            res.status(200).json(await searchVersionService.handleBulkUpload(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

export default router;