import EM from "../utils/entity.js";
import Utils from "../utils/utils.js";
import CmsRedisClient from "../utils/cms-redis.js";
import cache from "../utils/cache.js";

export default class SponsoredProductService {

    constructor () {
        this.redisClient = CmsRedisClient.getInstance();
    }

    list = async (_req) => {

        try {

            let _sponsoredProducts = [];

            const page = parseInt(_req.query.page) || 1;
            const skip = (page - 1) * parseInt(process.env.PAGE_SIZE);
            const limit = parseInt(process.env.PAGE_SIZE);

            const searchFor = _req.query.search ? _req.query.search : "";
            const searchFrom = _req.query.field ? _req.query.field : "";

            const filter = _req.query.filter ? _req.query.filter : "";
            const filterBy = _req.query.filter_by ? _req.query.filter_by : "";
            const filterType = _req.query.filter_type ? _req.query.filter_type : "";

            if (searchFrom !== "") {
                return await this.search(_req, page, skip, limit, searchFrom, searchFor);
            }

            if (filter !== "") {
                if (filterType === "seeds") {
                    return await this.groupSeed(_req, filter);
                } else {
                    return await this.groupBy(_req, page, skip, limit, filter, filterBy);
                }
            }

            const sponsoredProductModel = await EM.getModel("cms_sponsored_product");
            const _count = await sponsoredProductModel.countDocuments({});
            _sponsoredProducts = await sponsoredProductModel.find({}).sort({ title: 1 }).skip(skip).limit(limit).lean();
            
            return Utils.response(_count, page, _sponsoredProducts);

        } catch (e) {
            throw e;
        }

    };   

    search = async (_req, _page, _skip, _limit, _field, _search) => {

        try {

            const sponsoredProductModel = await EM.getModel("cms_sponsored_product");
            const _count = await sponsoredProductModel.countDocuments({ [_field]: { $regex: new RegExp(_search, 'i') } });
            const _sponsoredProducts = await sponsoredProductModel.find({ [_field]: { $regex: new RegExp(_search, 'i') } }).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();

            return Utils.response(_count, _page, _sponsoredProducts);

        } catch (_e) {
            throw _e;
        }

    };

    groupSeed = async(_req, _field) => { 

        try {
            const sponsoredProductModel = await EM.getModel("cms_sponsored_product");
            return await sponsoredProductModel.distinct(_field).exec();
        } catch (_e) {

            throw _e;
        }

    };

    groupBy = async(_req, _page, _skip, _limit, _field, _match) => { 

        try {

            let query = {};
            if (_match) {
                query[_field] = { $in: _match.split('|') };
            }

            const sponsoredProductModel = await EM.getModel("cms_sponsored_product");
            const _count = await sponsoredProductModel.countDocuments(query);
            const _sponsoredProducts = await sponsoredProductModel.find(query).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();

            return Utils.response(_count, _page, _sponsoredProducts);

        } catch (_e) {
            throw _e;
        }

    };

    count = async (_req) => {

        try {
            const sponsoredProductModel = await EM.getModel("cms_sponsored_product");
            return await sponsoredProductModel.countDocuments({});
        } catch (_e) {
            throw _e;
        }

    };

    get = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Sponsored product id is missing");
        }

        try {
            const sponsoredProductModel = await EM.getModel("cms_sponsored_product");
            return await sponsoredProductModel.findOne({ _id: _req.params.id }).lean();
        } catch (_e) {
            throw _e;
        }

    };

    getSummary = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Sponsored product id is missing");
        }

        try {

            return {
                impression: 1000,
                addedToCart: 80,
                ordered: 60,
                averageQty: 5,
                revenue: 25000 
            };

        } catch (e) {
            throw e;
        }

    };

    getPerformance = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Sponsored product id is missing");
        }

        try {

            let _performance = [];

            const page = parseInt(_req.query.page) || 1;
            const skip = (page - 1) * parseInt(process.env.PAGE_SIZE);
            const limit = parseInt(process.env.PAGE_SIZE);

            const searchFor = _req.query.search ? _req.query.search : "";
            const searchFrom = _req.query.field ? _req.query.field : "";

            if (searchFrom !== "") {
                return await this.searchPerformance(_req, page, skip, limit, searchFrom, searchFor);
            }

            const sponsoredProductPerformance = await EM.getModel("cms_sponsored_product_performance");
            const _count = await sponsoredProductPerformance.countDocuments({});
            _performance = await sponsoredProductPerformance.find({ sponsoredProduct: _req.params.id }).sort({ impression: 1 }).skip(skip).limit(limit).lean();
            
            return Utils.response(_count, page, _performance);

        } catch (e) {
            throw e;
        }     

    };

    searchPerformance = async (_req, _page, _skip, _limit, _field, _search) => {

        try {

            const sponsoredProductPerformance = await EM.getModel("cms_sponsored_product_performance");
            const _count = await sponsoredProductPerformance.countDocuments({ [_field]: { $regex: new RegExp(_search, 'i') } });
            const _performance = await sponsoredProductPerformance.find({ [_field]: { $regex: new RegExp(_search, 'i') } }).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();

            return Utils.response(_count, _page, _performance);

        } catch (_e) {
            throw _e;
        }

    };

    update = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Sponsored product id is missing");
        }

        try {

            const sponsoredProductModel = await EM.getModel("cms_sponsored_product");
            const result = await sponsoredProductModel.findByIdAndUpdate(_req.params.id, { $set: { ..._req.body, updatedBy: _req.user._id } }, { runValidators: true, new: true });

            /* Update the cache */
            await cache.setSponsoredProduct(_req.params.id);

            return result;

        } catch (_e) {  console.log(_e);
            throw _e;
        }

    };

    delete = async (_req) => {
        
        if (!_req.params.id) {
            throw new Error("Sponsored product id is missing");
        }

        try {

            const sponsoredProductModel = await EM.getModel("cms_sponsored_product");            
            /* Finally remove the service itself */
            const result = await sponsoredProductModel.deleteOne({ _id: _req.params.id });
            
            /* Remove it from cache */
            await cache.deleteSponsoredProduct(_req.params.id);

            return result;

        } catch (_e) {
            throw _e;
        }

    };

    create = async (_req) => {

        try {

            const { body } = _req;

            if (!body) {
                throw new Error('Request body is required');
            }

            body["createdBy"] = _req.user._id;

            const sponsoredProductModel = await EM.getModel("cms_sponsored_product");
            const model = new sponsoredProductModel(body);
            const sponsoredProduct = await model.save();     

            /* Add it to the cache */
            await cache.setSponsoredProduct(sponsoredProduct._id);

            return {
                status: true,
                message: "Service "+ sponsoredProduct.title +" is created successfully",
                payload: sponsoredProduct
            };

        } catch (e) {

            if (e.name === 'ValidationError') {
                return {
                    status: false,
                    message: e.errors
                };
            }
    
            return {
                status: false,
                message: e.message || 'An error occurred while creating sponsored product'
            };

        }

    };


}