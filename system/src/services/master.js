import AP from "./api.js";
import EM from "../utils/entity.js";
import Utils from "../utils/utils.js";
import MYDBM from "../utils/mysql.js";

export default class MasterService {

    constructor() {}

    init = async () => {

        AP.event.on('on_master_master_company_search_list', async (_params, callback) => {

            try {

                let _count = 0;
                let _records = [];

                const [_req] = _params;

                const page = parseInt(_req.query.page) || 1;
                const skip = (page - 1) * 15;
                const limit = 15;

                const searchFor = _req.query.search ? _req.query.search : "";
                const searchFrom = _req.query.field ? _req.query.field : "";       
                
                if (searchFrom !== "") {                     
                    callback(this.companySearch(_req, page, skip, limit, searchFor));
                    return;                    
                }

                _records = await MYDBM.queryWithConditions(`select CompanyId, CompanyName from companies where LOWER(CompanyName) LIKE LOWER('${searchFor}%') LIMIT ${skip},15`, []);                                    
                _count = await MYDBM.queryWithConditions(`select count(*) as count from companies where LOWER(CompanyName) LIKE LOWER('%${searchFor}%')`, []);
                
                callback(Utils.response(_count[0].count, page, _records));

            } catch (error) {                
                callback(error);
            }

        });

        AP.event.on('on_master_company_products', async (_params, callback) => {
            
            try {                                
                
                let _count = 0;
                let _records = [];

                const [_req] = _params;

                const page = parseInt(_req.query.page) || 1;
                const skip = (page - 1) * parseInt(process.env.PAGE_SIZE);
                const limit = parseInt(process.env.PAGE_SIZE);

                const searchFor = _req.query.search ? _req.query.search : "";
                const searchFrom = _req.query.field ? _req.query.field : "";

                const filter = _req.query.filter ? _req.query.filter : "";
                const filterBy = _req.query.filter_by ? _req.query.filter_by : "";
                const filterType = _req.query.filter_type ? _req.query.filter_type : "";

                let populateList = [];
                let populate = _req.query.populate;

                if (populate) {                                 
                    let paths = populate.split('|');   
                    for (let i = 0; i < paths.length; i++) {
                        populateList.push({path: paths[i]});
                    }
                }

                let sortQuery = {};
                if (_req.query.sort) {
                    sortQuery[_req.query.sort] = 1;
                }

                if (searchFrom !== "") {
                    callback(this.search(_req, "product", page, skip, limit, searchFrom, searchFor, populateList));
                    return;
                }

                if (filter !== "") {
                    if (filterType === "seeds") {
                        callback(this.groupSeed(_req, "product", filter));
                    } else {
                        callback(this.groupBy(_req, "product", page, skip, limit, filter, filterBy, populateList));                        
                    }
                    return;
                }
                    
                const model = await EM.getModel("product");

                if (model) {

                    _count = await model.countDocuments({BRAND_CODE: (_req.query.cid+"") });

                    if (Array.isArray(populateList) && populateList.length > 0) {
                        _records = await model.find({BRAND_CODE: (_req.query.cid+"") }).populate(populateList).sort(sortQuery).skip(skip).limit(limit).lean().exec();
                    } else {
                        _records = await model.find({BRAND_CODE: (_req.query.cid+"") }).sort(sortQuery).skip(skip).limit(limit).lean();
                    }
                    
                    callback(Utils.response(_count, page, _records));

                }
                
            } catch (error) {                
                callback(error);
            }

        });        
        
    };

    companySearch = async (_req, _page, _skip, _limit, _search) => { 

        try {

            const _records = await MYDBM.queryWithConditions(`select CompanyId, CompanyName from companies where LOWER(CompanyName) LIKE LOWER('${_search}%') LIMIT ${_skip},15`, []);                                    
            const _count = await MYDBM.queryWithConditions(`select count(*) as count from companies where LOWER(CompanyName) LIKE LOWER('${_search}%')`, []);

            return Utils.response(_count[0].count, _page, _records);

        } catch (e) {
            throw e;
        }

    };

    search = async (_req, _entity, _page, _skip, _limit, _field, _search, _populates) => {

        try {

            let _count = 0;
            let _records = [];

            const model = await EM.getModel(_entity);

            if (model) {

                _count = await model.countDocuments({ [_field]: { $regex: new RegExp(_search, 'i') } });

                if (_populates && Object.keys(_populates).length > 0) {
                    _records = await model.find({ [_field]: { $regex: new RegExp(_search, 'i') } }).populate(_populates).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean().exec();
                } else {
                    _records = await model.find({ [_field]: { $regex: new RegExp(_search, 'i') } }).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();
                }

            } else {
                throw new Error(_entity +" model not found");
            }

            return Utils.response(_count, _page, _records);

        } catch (_e) {
            throw _e;
        }

    }; 

    groupSeed = async(_req, _entity, _field) => {

        try {

            const model = await EM.getModel(_entity);

            if (model) {
                return await model.distinct(_field).exec();
            } else {
                throw new Error(_entity +" model not found");
            }
            
        } catch (_e) {
            throw _e;
        }

    };

    groupBy = async(_req, _entity, _page, _skip, _limit, _field, _match, _populates) => { 

        try {

            let query = {};
            if (_match) {
                query[_field] = { $in: _match.split('|') };
            }

            let _count = 0;
            let _records = [];
            const model = await EM.getModel(_entity);

            if (model) {

                _count = await model.countDocuments(query);

                if (_populates && Object.keys(_populates).length > 0) {
                    _records = await model.find(query).populate(_populates).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean().exec();
                } else {
                    _records = await model.find(query).sort({ [_field]: 1 }).skip(_skip).limit(_limit).lean();
                }

            } else {
                throw new Error(_entity +" model not found");
            }

            return Utils.response(_count, _page, _records);

        } catch (_e) {
            throw _e;
        }

    };

}