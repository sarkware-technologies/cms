import { Router } from 'express';
import Utils from './utils/utils.js';
import ComposeService from './services/compose.js';
import ApiService from './services/api.js';
import ElasticService from './services/elastic.js';
import CmsRedisClient from './utils/cms-redis.js';
import SponsoredProductService from './services/sponsored-product.js';
  
const routes = new Router();
const CS = new ComposeService();
const API = new ApiService();
const elastic = new ElasticService();
const cmsRedisClient = CmsRedisClient.getInstance();
const sponsoredProduct = new SponsoredProductService();

/**
 * 
 * @param {*} _req 
 * @param {*} _res 
 * 
 * Handles the  page request from flutter
 * Common handler for all types of pages
 * 
 */
const processPageRequest = async (_req, _res) => {

    try {
        _res.status(200).json(await CS.handlePageRequest(_req));
    } catch (_e) {
        Utils.handleError(_e, _res);
    }

};

const processTopPicksRequest = async (_req, _res) => {

    try {        
        _res.status(200).json(await elastic.getOrderedProducts(_req, 5));
    } catch (_e) {
        Utils.handleError(_e, _res);
    }

};

const processTopTrendingRequest = async (_req, _res) => {

    try {
        _res.status(200).json(await elastic.getTrendingProducts(_req, 5));
    } catch (_e) {
        Utils.handleError(_e, _res);
    }

};

const processTopOfferedRequest = async (_req, _res) => {

    try {
        _res.status(200).json(await API.fetchTopOfferedProducts(_req));
    } catch (_e) {
        Utils.handleError(_e, _res);
    }

};

const processCompanyProductRequest = async (_req, _res) => {

    try {

        const user = _req.user;
        const cid = _req.query.cid ? _req.query.cid : null;

        _res.status(200).json(await API.fetchStaticCompanyProducts(user, cid));

    } catch (_e) {
        Utils.handleError(_e, _res);
    }

};

const processCashBackProductRequest = async (_req, _res) => {

    try {

        const user = _req.user;
        _res.status(200).json(await API.prepareCashBackProductForRetailer(user));

    } catch (_e) {
        Utils.handleError(_e, _res);
    }

};

const processOfferedProductRequestForElastic = async (_req, _res) => {

    try {

        const user = _req.user;
        _res.status(200).json(await API.prepareOfferedProductForElasticAPi(user));

    } catch (_e) {
        Utils.handleError(_e, _res);
    }

};

const processDistributorProductRequest = async (_req, _res) => {

    try {

        const user = _req.user;
        const sid = _req.query.sid ? _req.query.sid : null;
        _res.status(200).json(await API.fetchDistributorProducts(sid, user));

    } catch (_e) {
        Utils.handleError(_e, _res);
    }

};

const processCompanyTherapiesRequest = async (_req, _res) => {

    try {

        const cid = _req.query.cid ? _req.query.cid : null;
        _res.status(200).json(await API.getCompanyTherapies(cid, 100));

    } catch (_e) {
        Utils.handleError(_e, _res);
    }

};

const processDistributorTherapiesRequest = async (_req, _res) => {

    try {

        const sid = _req.query.sid ? _req.query.sid : null;
        _res.status(200).json(await API.getDistributorTherapies(sid, 100));

    } catch (_e) {
        Utils.handleError(_e, _res);
    }

};

const invalidatePageCache = async (_req, _res) => {

    try {

        await cmsRedisClient.invalidateAllCache("PAGE");
        _res.status(200).json({ status: true });

    } catch (_e) {
        Utils.handleError(_e, _res);
    }

};

const invalidateAllPageCache = async (_req, _res) => {

    try {
    
        await cmsRedisClient.invalidateAllCache("PAGE");
        _res.status(200).json({ status: true });

    } catch (_e) {
        Utils.handleError(_e, _res);
    }

};

const processCompaniesRequest = async (_req, _res) => {

    try {

        _res.status(200).json(await API.getCompanies());

    } catch (_e) {
        Utils.handleError(_e, _res);
    }

};

const getSponsoredProducts = async (_req, _res) => {

    try {

        _res.status(200).json(await sponsoredProduct.getSponsoredProducts(_req));

    } catch (_e) {
        Utils.handleError(_e, _res);
    }

};

const updateSponsoredProduct = async (_req, _res) => {

    try {

        _res.status(200).json(await sponsoredProduct.updateSponsoredProductPerformance(_req));

    } catch (_e) {
        Utils.handleError(_e, _res);
    }

};

routes.get("/page/*", processPageRequest);

routes.get("/sponsoredProduct", getSponsoredProducts);
routes.put("/sponsoredProduct", updateSponsoredProduct);

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

export default routes;