import { Router } from 'express';
import Utils from './utils/utils.js';
import cache from './utils/cache.js';
import ComposeService from './services/compose.js';
import ApiService from './services/api.js';
import ElasticService from './services/elastic.js';
import RedisClient from "./utils/redis.js";
import CreateNewCompany from "./services/company.service.js";
  
const routes = new Router();
const CS = new ComposeService();

const API = new ApiService();

const elastic = new ElasticService();
const redisClient = RedisClient.getInstance();
const companyservide = new CreateNewCompany();

const processPageRequest = async (_req, _res) => {
    try {
        _res.status(200).json(await CS.handlePageRequest(_req));
    } catch (_e) {
        Utils.handleError(_e, _res);
    }
};

const processTopPicksRequest = async (_req, _res) => {
    try {

        const _token = _req.headers["authorization"];
        if (!_token) {
            throw new Error("Bearer token not present");
        }

        _res.status(200).json(await elastic.getOrderedProducts(_token, 5));
    } catch (_e) {
        Utils.handleError(_e, _res);
    }
};

const processTopTrendingRequest = async (_req, _res) => {
    try {

        const _token = _req.headers["authorization"];
        if (!_token) {
            throw new Error("Bearer token not present");
        }

        _res.status(200).json(await elastic.getTrendingProducts(_token, 5));
    } catch (_e) {
        Utils.handleError(_e, _res);
    }
};

const processTopOfferedRequest = async (_req, _res) => {
    try {
        const _token = _req.headers["authorization"];
        if (!_token) {
            throw new Error("Bearer token not present");
        }

        /* validate token */
        const token = _req.headers["authorization"].split(" ")[1];
        const user = Utils.verifyToken(token);

        if (!user) {
            throw new Error("Invalid token");
        }

        _res.status(200).json(await API.fetchTopOfferedProducts(_req, user));
    } catch (_e) {
        Utils.handleError(_e, _res);
    }
};

const processCompanyProductRequest = async (_req, _res) => {

    try {

        const _token = _req.headers["authorization"];
        if (!_token) {
            throw new Error("Bearer token not present");
        }

        /* validate token */
        const token = _req.headers["authorization"].split(" ")[1];
        const user = Utils.verifyToken(token);

        if (!user) {
            throw new Error("Invalid token");
        }

        const cid = _req.query.cid ? _req.query.cid : null;
        _res.status(200).json(await API.fetchStaticCompanyProducts(user, cid));

    } catch (_e) {
        Utils.handleError(_e, _res);
    }

};

const processCashBackProductRequest = async (_req, _res) => {

    try {

        const _token = _req.headers["authorization"];
        if (!_token) {
            throw new Error("Bearer token not present");
        }

        /* validate token */
        const token = _req.headers["authorization"].split(" ")[1];
        const user = Utils.verifyToken(token);

        if (!user) {
            throw new Error("Invalid token");
        }

        _res.status(200).json(await API.prepareCashBackProductForRetailer(user));
    } catch (_e) {
        Utils.handleError(_e, _res);
    }

};

const processOfferedProductRequestForElastic = async (_req, _res) => {

    try {

        const _token = _req.headers["authorization"];
        if (!_token) {
            throw new Error("Bearer token not present");
        }

        /* validate token */
        const token = _req.headers["authorization"].split(" ")[1];
        const user = Utils.verifyToken(token);

        if (!user) {
            throw new Error("Invalid token");
        }

        _res.status(200).json(await API.prepareOfferedProductForElasticAPi(user));
    } catch (_e) {
        Utils.handleError(_e, _res);
    }

};

const processDistributorProductRequest = async (_req, _res) => {

    try {

        const _token = _req.headers["authorization"];
        if (!_token) {
            throw new Error("Bearer token not present");
        }

        /* validate token */
        const token = _req.headers["authorization"].split(" ")[1];
        const user = Utils.verifyToken(token);

        if (!user) {
            throw new Error("Invalid token");
        }

        const sid = _req.query.sid ? _req.query.sid : null;
        _res.status(200).json(await API.fetchDistributorProducts(sid, user));

    } catch (_e) {
        Utils.handleError(_e, _res);
    }

};

const processCompanyTherapiesRequest = async (_req, _res) => {

    try {

        const _token = _req.headers["authorization"];
        if (!_token) {
            throw new Error("Bearer token not present");
        }

        /* validate token */
        const token = _req.headers["authorization"].split(" ")[1];
        const user = Utils.verifyToken(token);

        if (!user) {
            throw new Error("Invalid token");
        }

        const cid = _req.query.cid ? _req.query.cid : null;
        _res.status(200).json(await API.getCompanyTherapies(cid, 100));

    } catch (_e) {
        Utils.handleError(_e, _res);
    }

};

const processDistributorTherapiesRequest = async (_req, _res) => {

    const _token = _req.headers["authorization"];
    if (!_token) {
        throw new Error("Bearer token not present");
    }

    /* validate token */
    const token = _req.headers["authorization"].split(" ")[1];
    const user = Utils.verifyToken(token);

    if (!user) {
        throw new Error("Invalid token");
    }

    const sid = _req.query.sid ? _req.query.sid : null;
    _res.status(200).json(await API.getDistributorTherapies(sid, 100));

};

const invalidatePageCache = async (_req, _res) => {
    try {
        //cache.removePageType(_req.query.page);
        await redisClient.invalidateAllCache();
        _res.status(200).json({ status: true });
    } catch (_e) {
        Utils.handleError(_e, _res);
    }
};

const invalidateAllPageCache = async (_req, _res) => {
    try {
        //cache.removeAllPage();
        await redisClient.invalidateAllCache();
        _res.status(200).json({ status: true });
    } catch (_e) {
        Utils.handleError(_e, _res);
    }
};

const processCompaniesRequest = async (_req, _res) => {

    const _token = _req.headers["authorization"];
    if (!_token) {
        throw new Error("Bearer token not present");
    }

    /* validate token */
    const token = _req.headers["authorization"].split(" ")[1];
    const user = Utils.verifyToken(token);

    if (!user) {
        throw new Error("Invalid token");
    }

    _res.status(200).json(await API.getCompanies());

};

const processDataPrepareRequest = async (_req, _res) => {
    _res.status(200).json(await API.dataQuery());
};

const processCompaniesPrepareRequest = async (_req, _res) => {
    _res.status(200).json(await API.companyQuery());
};

routes.get("/page/*", processPageRequest);
routes.get("/api/topPicks", processTopPicksRequest);
routes.get("/api/topOffered", processTopOfferedRequest);
routes.get("/api/topTrending", processTopTrendingRequest);

routes.get("/api/distributorProducts", processDistributorProductRequest);
routes.get("/api/companyProducts", processCompanyProductRequest);
routes.get("/api/offers", processOfferedProductRequestForElastic);
routes.get("/api/cashBackOffers", processCashBackProductRequest);

routes.get("/api/companyTherapies", processCompanyTherapiesRequest);
routes.get("/api/distributorTherapies", processDistributorTherapiesRequest);

routes.get("/api/invalidatePageCache", invalidatePageCache);
routes.get("/api/invalidateAllPageCache", invalidateAllPageCache);


routes.get("/api/companies", processCompaniesRequest);
routes.post("/api/companies", companyservide.CreateNewCompany);
routes.get("/api/companies/list", companyservide.GetCompanys);
routes.get("/api/companies/:id", companyservide.GetCompany);
routes.put("/api/companies", companyservide.updateCompany);
routes.delete("/api/companies", companyservide.deleteCompany);

//routes.get("/api/prepareData", processDataPrepareRequest);
//routes.get("/api/prepareCompanies", processCompaniesPrepareRequest);

export default routes;