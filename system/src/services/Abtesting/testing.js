import Utils from "../../utils/utils.js";
import AbTestingModel from "../../models/Ab-test.js";
import MYDBM from "../../utils/mysql.js";
import RedisSyncService from "./redisupdate.js";
import AbretailerModel from "../../models/Ab-retailers.js";
import AbregionModel from "../../models/Ab-region.js";
import AbBuildVersionModel from "../../models/ab-build-version.js";

export default class ABtesingService {

    constructor() {
        this.updateRedisService = new RedisSyncService();
     }


    list = async (_req) => {

        try {

            let _authTypes = [];

            const page = parseInt(_req.query.page) || 1;
            const skip = (page - 1) * parseInt(process.env.PAGE_SIZE);
            const limit = parseInt(process.env.PAGE_SIZE);

            const searchFor = _req.query.search ? _req.query.search : "";
            const searchFrom = _req.query.field ? _req.query.field : "";

            const filter = _req.query.filter ? _req.query.filter : "";
            const filterBy = _req.query.filter_by ? _req.query.filter_by : "";
            const filterType = _req.query.filter_type ? _req.query.filter_type : "";

            if (searchFrom !== "") {
                return this.search(_req, page, skip, limit, searchFrom, searchFor);
            }

            if (filter !== "") {
                if (filterType === "seeds") {
                    return this.groupSeed(_req, filter);
                } else {
                    return this.groupBy(_req, page, skip, limit, filter, filterBy);
                }
            }

            const _count = await AbTestingModel.countDocuments({});
            _authTypes = await AbTestingModel.find({}).sort({ title: 1 }).skip(skip).limit(limit).lean();
            const abTestsWithCounts = _authTypes.map(test => {
                return Promise.all([
                    AbregionModel.find({ mappedId: test._id }).count(),
                    AbretailerModel.find({ mappedId: test._id }).count(),
                    AbBuildVersionModel.find({ mappedId: test._id }).count()
                ]).then(([regionCount, userCount, buildCount]) => ({
                    ...test,
                    apicount: Object.keys(test.apis).length,
                    regioncount: regionCount,
                    usercount: userCount,
                    buildcount: buildCount
                }));
            });
            const newabbuild = await Promise.all(abTestsWithCounts);

            return Utils.response(_count, page, newabbuild);

        } catch (e) {
            throw _e;
        }

    };

    listAll = async (_req) => {

        try {
            return await AbTestingModel.find({}).sort({ title: 1 }).lean();
        } catch (e) {
            throw e;
        }

    };

    search = async (_req, _page, _skip, _limit, _field, _search) => {

        try {

            const _count = await AbTestingModel.countDocuments({ [_field]: { $regex: new RegExp(_search, 'i') } });
            const _authTypes = await AbTestingModel.find({ [_field]: { $regex: new RegExp(_search, 'i') } }).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();

            return Utils.response(_count, _page, _authTypes);

        } catch (_e) {
            throw _e;
        }

    };

    groupSeed = async (_req, _field) => {

        try {
            return await AbTestingModel.distinct(_field).exec();
        } catch (_e) {

            throw _e;
        }

    };

    groupBy = async (_req, _page, _skip, _limit, _field, _match) => {

        try {

            let query = {};
            if (_match) {
                query[_field] = { $in: _match.split('|') };
            }

            const _count = await AbTestingModel.countDocuments(query);
            const _authTypes = await AbTestingModel.find(query).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();

            return Utils.response(_count, _page, _authTypes);

        } catch (_e) {
            throw _e;
        }

    };

    count = async (_req) => {

        try {
            return await AbTestingModel.countDocuments({});
        } catch (_e) {
            throw _e;
        }

    };

    get = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Auth type id is missing");
        }

        try {
            return await AbTestingModel.findOne({ _id: _req.params.id }).lean();
        } catch (_e) {
            throw _e;
        }

    };

    update = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Auth type id is missing");
        }

        try {
           const test=  await AbTestingModel.findByIdAndUpdate(_req.params.id, { $set: { ..._req.body, updatedBy: _req.user._id } }, { runValidators: true, new: true });
            this.updateRedisService.bulkUpdate();
            return test;
        } catch (_e) {
            throw _e;
        }

    };

    delete = async (_req) => {

        if (!_req.params.id) {
            throw new Error("Auth type id is missing");
        }

        try {
            return await AbTestingModel.deleteOne({ _id: _req.params.id });
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

            body["createdBy"] = _req.user._id
            const model = new AbTestingModel(body);
            const authType = await model.save();

            return {
                status: true,
                message: "Auth type " + authType.title + " is created successfully",
                payload: authType
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
                message: e.message || 'An error occurred while creating auth type'
            };

        }

    };


    getRetailer= async (req)=>{


        const { search, region, page = 1, pageSize = 50 } = req.query;
        const offset = (page - 1) * pageSize;

        // Base SQL query
        let sql = `SELECT * FROM users u
         INNER JOIN retailermanagers r2 ON r2.UserId = u.UserId
         LEFT JOIN retailers r ON r.RetailerId = r2.RetailerId
         INNER JOIN regions r3 ON r3.RegionId = r.RegionId
         WHERE u.IsAuthorized = 1  AND (u.IsDeleted = 0 OR u.IsDeleted IS NULL)`;


        // Add search condition if `search` is provided
        const replacements = [];
        if (search && search.trim() !== '') {
            sql += ` AND (u.username LIKE CONCAT('%', ?, '%') OR u.mobilenumber LIKE CONCAT('%', ?, '%'))`;
            replacements.push(search, search);
        }

        // Add region condition if `region` is provided
        if (region && region.trim() !== '') {
            sql += ` AND r3.RegionId = ?`;
            replacements.push(region);
        }

        // Append pagination with numeric values
        sql += ` LIMIT ? OFFSET ?`;
        replacements.push(Number(pageSize), Number(offset)); // Ensure they are numbers


        let retailers = await MYDBM.queryWithConditions(sql, replacements);
        retailers = Array.isArray(retailers) && retailers.length > 0 ? retailers : [];

        return retailers;
    
    }


    getRgions = async ()=>{
        let regions = await MYDBM.queryWithConditions("SELECT * FROM regions", []);
        return regions;
    }
    
    

}