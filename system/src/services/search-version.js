import { Worker } from 'worker_threads';

import MYDBM from "../utils/mysql.js";
import Utils from "../utils/utils.js";
import EM from "../utils/entity.js";
import Pr2RedisClient from '../utils/pr2-redis.js';

export default class SearchVersionService {

    constructor() {
        this.redisClient = Pr2RedisClient.getInstance();
    }

    listRegions = async (_req) => {

        const page = parseInt(_req.query.page, 10) || 1; // Default to page 1 if not provided
        const pageSize = parseInt(process.env.PAGE_SIZE, 10) || 10; // Default to 10 items per page if not provided
        const offset = (page - 1) * pageSize;

        const searchFor = _req.query.search ? _req.query.search : "";
        const searchFrom = _req.query.field ? _req.query.field : "";

        if (searchFrom !== "") {
            return await this.searchRegions(_req, page, offset, pageSize, searchFrom, searchFor);
        }

        try {

            const _regions = await MYDBM.queryWithConditions('SELECT RegionName, RegionId FROM regions LIMIT ? OFFSET ?', [pageSize, offset]);
            const regions = await this.updateRegionStates(_regions);

            const totalResult = await MYDBM.queryWithConditions(`SELECT COUNT(*) as count FROM regions`, []);
            const totalItems = totalResult[0].count;

            return Utils.response(totalItems, page, regions);

        } catch (_e) {
            console.log(_e);
            throw _e;
        };

    };

    searchRegions = async (_req, _page, _skip, _limit, _field, _search) => {

        try {

            const _regions = await MYDBM.queryWithConditions('SELECT RegionName, RegionId FROM regions WHERE RegionName LIKE ? LIMIT ? OFFSET ?;', [`${_search}%`, _limit, _skip]);

            const totalResult = await MYDBM.queryWithConditions('SELECT COUNT(*) as count FROM regions WHERE RegionName LIKE ?;', [`${_search}%`]);
            const totalItems = totalResult[0].count;

            const regions = await this.updateRegionStates(_regions);

            return Utils.response(totalItems, _page, regions);

        } catch (_e) {
            console.error('Error fetching regions:', _e.message);
            throw _e;
        }

    };

    listRetailers = async (_req) => {

        const page = parseInt(_req.query.page, 10) || 1;
        const pageSize = parseInt(process.env.PAGE_SIZE, 10) || 15;
        const offset = (page - 1) * pageSize;

        const searchFor = _req.query.search ? _req.query.search : "";
        const searchFrom = _req.query.field ? _req.query.field : "";

        const filter = _req.query.filter ? _req.query.filter : "";
        const filterBy = _req.query.filter_by ? _req.query.filter_by : "";
        const filterType = _req.query.filter_type ? _req.query.filter_type : "";

        if (searchFrom !== "") {
            return await this.searchRetailers(_req, page, offset, pageSize, searchFrom, searchFor);
        }

        if (filter !== "") {
            if (filterType === "seeds") {
                return await this.groupSeed(_req, filter);
            } else {
                return await this.groupBy(_req, page, offset, pageSize, filter, filterBy);
            }
        }

        try {

            const query = `
                SELECT r3.RegionName, r3.RegionId, r.RetailerName, r.RetailerId, r.Pincode, r.Pincode, u.Username, u.MobileNumber 
                FROM retailers r 
                INNER JOIN retailermanagers r2 ON r.RetailerId = r2.RetailerId
                INNER JOIN users u ON u.UserId = r2.UserId
                INNER JOIN regions r3 ON r.RegionId = r3.RegionId                
                LIMIT ? OFFSET ?
            `;

            const _retailers = await MYDBM.queryWithConditions(query, [pageSize, offset]);
            const retailers = await this.updateVersionInfo(_retailers);

            const totalQuery = `SELECT COUNT(*) as count FROM retailers r INNER JOIN retailermanagers r2 ON r.RetailerId = r2.RetailerId INNER JOIN regions r3 ON r.RegionId = r3.RegionId INNER JOIN users u ON u.UserId = r2.UserId;`;
            const totalResult = await MYDBM.queryWithConditions(totalQuery, []);
            const totalItems = totalResult[0].count;

            return Utils.response(totalItems, page, retailers);

        } catch (_e) {
            console.log(_e);
            throw _e;
        };

    };

    searchRetailers = async (_req, _page, _skip, _limit, _field, _search) => {

        try {

            const query = `
            SELECT r3.RegionName, r.RetailerName, r.RetailerId, r.Pincode, u.Username, u.MobileNumber
            FROM retailers r 
            INNER JOIN retailermanagers r2 ON r.RetailerId = r2.RetailerId
            INNER JOIN users u ON u.UserId = r2.UserId
            INNER JOIN regions r3 ON r.RegionId = r3.RegionId
            WHERE (r.RetailerName LIKE ? OR u.Username LIKE ?) 
            AND r.IsAuthorized = 1 
            LIMIT ? OFFSET ?
            `;

            const _retailers = await MYDBM.queryWithConditions(query, [`${_search}%`, `${_search}%`, _limit, _skip]);
            const retailers = await this.updateVersionInfo(_retailers);

            const totalQuery = `
            SELECT COUNT(*) as count 
            FROM retailers r 
            INNER JOIN retailermanagers r2 ON r.RetailerId = r2.RetailerId
            INNER JOIN users u ON u.UserId = r2.UserId
            INNER JOIN regions r3 ON r.RegionId = r3.RegionId
            WHERE (r.RetailerName LIKE ? OR u.Username LIKE ?) 
            AND r.IsAuthorized = 1
            `;
            const totalResult = await MYDBM.queryWithConditions(totalQuery, [`${_search}%`, `${_search}%`]);
            const totalItems = totalResult[0].count;

            return Utils.response(totalItems, _page, retailers);

        } catch (_e) {
            console.error('Error fetching retailers:', _e.message);
            throw _e;
        }

    };

    groupSeed = async (_req, _filter) => {

        try {
            return await MYDBM.queryWithConditions(`select * from regions;`, []);
        } catch (_e) {
            throw _e;
        }

    };

    groupBy = async (_req, _page, _skip, _limit, _field, _match) => {

        try {
            const query = `
                SELECT r3.RegionName, r.RetailerName, r.RetailerId
                FROM retailers r 
                INNER JOIN retailermanagers r2 ON r.RetailerId = r2.RetailerId
                INNER JOIN regions r3 ON r.RegionId = r3.RegionId
                WHERE r.RegionId = ? AND r.IsAuthorized=1 
                LIMIT ? OFFSET ?
            `;

            const retailer = await MYDBM.queryWithConditions(query, [_match, _limit, _skip]);

            const totalQuery = `
                SELECT COUNT(*) as count 
                FROM retailers r 
                INNER JOIN retailermanagers r2 ON r.RetailerId = r2.RetailerId
                INNER JOIN regions r3 ON r.RegionId = r3.RegionId
                WHERE r.RegionId = ? r.IsAuthorized=1 
            `;
            const totalResult = await MYDBM.queryWithConditions(totalQuery, [_match]);
            const totalItems = totalResult[0].count;

            return Utils.response(totalItems, _page, retailer);

        } catch (_e) {
            console.error('Error fetching retailers:', _e.message);
            throw _e;
        }

    };

    updateVersionInfo = async (_retailers) => {

        const result = [];

        try {

            const regionSearchVersionModel = await EM.getModel("cms_system_search_region_version");
            const retailerSearchVersionModel = await EM.getModel("cms_system_search_retailer_version");

            const retailerVersions = await retailerSearchVersionModel.find({}).lean();                        

            for (let i = 0; i < _retailers.length; i++) {

                const _version = _retailers[i];
                const regionVersions = await regionSearchVersionModel.findOne({ regionId: _retailers[i].RegionId }).lean(); 
                _version["enableMdmSearch"] = regionVersions ? regionVersions.enableMdmSearch : true;                

                for (let j = 0; j < retailerVersions.length; j++) {
                    if (retailerVersions[j].retailerId == _version.RetailerId) {
                        _version["enableMdmSearch"] = retailerVersions[j].enableMdmSearch;                        
                    }
                }

                result.push(_version);

            }
        } catch (e) {
            console.log(e);
        }

        return result;

    };

    updateRegionStates = async (_regions) => {

        const result = [];

        try {

            for (let i = 0; i < _regions.length; i++) {

                const regionRecord = _regions[i];
                regionRecord["enableMdmSearch"] = true;

                const regionSearchVersionModel = await EM.getModel("cms_system_search_region_version");
                const version = await regionSearchVersionModel.findOne({ regionId: _regions[i].RegionId }).lean();
                if (version) {
                    regionRecord["enableMdmSearch"] = version["enableMdmSearch"];
                }                

                result.push(regionRecord);

            }
        } catch (e) {
            console.log(e);
        }

        return result;

    };

    toggleRegionVersion = async (_req) => {

        try {

            let _enableMdmSearch = true;
            if ('enableMdmSearch' in _req.query && _req.query.enableMdmSearch == 0) {
                _enableMdmSearch = false;
            }

            const regionSearchVersionModel = await EM.getModel("cms_system_search_region_version");
            let _versionDetail = await regionSearchVersionModel.findOne({ regionId: _req.query.regionId }).lean();

            if (_versionDetail) {
                _versionDetail = await regionSearchVersionModel.findByIdAndUpdate(_versionDetail._id, { $set: { enableMdmSearch: _enableMdmSearch } }, { runValidators: true, new: true });                
            } else {

                /* Fetch retailer details */
                const region = await MYDBM.queryWithConditions(`SELECT * FROM regions WHERE RegionId = ?`, [_req.query.regionId]);

                if (region) {
                    const model = new regionSearchVersionModel({                        
                        regionId: region[0].RegionId,
                        enableMdmSearch: _enableMdmSearch
                    });
                    await model.save();                    
                }

            }

            /* Flush the reailer search version for this region */
            const retailerSearchVersionModel = await EM.getModel("cms_system_search_retailer_version");
            await retailerSearchVersionModel.deleteMany({ regionId: _req.query.regionId });

            return await this.listRegions(_req);

        } catch (e) {
            console.log(e);
            throw e;
        }

    };

    toggleRetailerVersion = async (_req) => {

        try {
            
            const retailerSearchVersionModel = await EM.getModel("cms_system_search_retailer_version");
            let _versionDetail = await retailerSearchVersionModel.findOne({ retailerId: _req.query.retailerId }).lean();

            let _enableMdmSearch = true;
            if ('enableMdmSearch' in _req.query && _req.query.enableMdmSearch == 0) {
                _enableMdmSearch = false;
            }

            if (_versionDetail) {
                _versionDetail = await retailerSearchVersionModel.findByIdAndUpdate(_versionDetail._id, { $set: { enableMdmSearch: _enableMdmSearch } }, { runValidators: true, new: true });                
            } else {

                /* Fetch retailer details */
                const retailer = await MYDBM.queryWithConditions(`SELECT * FROM retailers WHERE RetailerId = ?`, [_req.query.retailerId]);

                if (retailer) {
                    const model = new retailerSearchVersionModel({
                        retailerId: retailer[0].RetailerId,
                        regionId: retailer[0].RegionId,
                        enableMdmSearch: _enableMdmSearch
                    });
                    await model.save();                    
                }

            }

            return await this.listRetailers(_req);

        } catch (e) {
            console.log(e);
            throw e;
        }

    };

    handleBulkUpload = async (_req) => {

        try {

            const { users } = _req.body;
            const userAppVersionModel = await EM.getModel("userappversion");
            const retailerSearchVersionModel = await EM.getModel("cms_system_search_retailer_version");
    
            if (!users) {
                throw new Error('Request body is required');
            }
    
            if (!Array.isArray(users) || users.length === 0) {
                throw new Error('Invalid request body');
            }
    
            const batchSize = 5;
            const totalBatch = Math.ceil(users.length / batchSize);
    
            const query = `
                SELECT r3.RegionName, r.RetailerName, r.RetailerId, r.Pincode, u.Username, u.MobileNumber
                FROM retailers r 
                INNER JOIN retailermanagers r2 ON r.RetailerId = r2.RetailerId
                INNER JOIN users u ON u.UserId = r2.UserId
                INNER JOIN regions r3 ON r.RegionId = r3.RegionId
                WHERE u.Username = ?
            `;

            let _enableMdmSearch = true;
            if ('enableMdmSearch' in _req.body && _req.body.enableMdmSearch == 0) {
                _enableMdmSearch = false;
            }
    
            const results = [];
    
            for (let i = 0; i < totalBatch; i++) {
                const batch = users.slice(i * batchSize, (i + 1) * batchSize);
    
                const updatePromise = batch.map(async (uname) => {
                    try {
                        const retailers = await MYDBM.queryWithConditions(query, [uname.trim()]);
    
                        if (Array.isArray(retailers) && retailers.length === 1) {
                            let versionDetail = await retailerSearchVersionModel.findOne({ retailerId: retailers[0].RetailerId }).lean();
    
                            if (versionDetail) {                                
                                // Update existing version
                                versionDetail = await retailerSearchVersionModel.findByIdAndUpdate(
                                    versionDetail._id, 
                                    { $set: { enableMdmSearch: _enableMdmSearch } }, 
                                    { runValidators: true, new: true }
                                );                
                            } else {

                                /* Fetch retailer details */
                                const retailer = await MYDBM.queryWithConditions(`SELECT * FROM retailers WHERE RetailerId = ?`, [retailers[0].RetailerId]);

                                if (retailer) {
                                    versionDetail = new retailerSearchVersionModel({
                                        retailerId: retailer[0].RetailerId,
                                        regionId: retailer[0].RegionId,
                                        enableMdmSearch: _enableMdmSearch
                                    });
                                    versionDetail = await versionDetail.save();                    
                                }

                            }    

                            let _msg = "Version "+ version +" has been enabled for "+ retailers[0].RetailerName;                            
                            
                            results.push({status: true, message: _msg});
                            return versionDetail;

                        } else {                            
                            results.push({status: false, message: `Retailer not found for user: ${uname}`});
                            return null;
                        }
                    } catch (e) {                                                
                        results.push({status: false, message: `Error while switching version for ${uname}`});
                        return e.message;
                    }
                });
    
                await Promise.all(updatePromise);
            }
    
            return results;
    
        } catch (e) {
            console.error("Critical error in handleBulkUpload:", e);
            throw e;
        }

    }; 

    delay = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    };

}