import { Router } from 'express';
import QueryBrowser from '../services/query-browser.js';
import Utils from '../utils/utils.js';
import RC from '../utils/request-interceptor.js';
import DbResource from '../enums/db-resource.js';

const router = Router();
const qbService = new QueryBrowser();
const moduleHandle = "query_browser";

router.get(
    `/${moduleHandle}/listResources`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {

            if (!req.query.type) {
                throw new Error("Type parameter is missing");
            }

            let rType = "BASE TABLE";
            if (req.query.type == DbResource.VIEW) {
                rType = "VIEW";
            } else if (req.query.type == DbResource.PROCEDURE) {
                rType = "PROCEDURE";
            }

            res.status(200).json(await qbService.listResources(rType));

        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}/selectResource`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await qbService.selectResource(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}/resourceStructure`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await qbService.getTableStructure(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.post(
    `/${moduleHandle}/executeSnippet`,
    await RC.interceptRequest(moduleHandle, 'post', [], async (req, res) => {
        try {
            res.status(200).json(await qbService.executeSnippet(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

export default router;