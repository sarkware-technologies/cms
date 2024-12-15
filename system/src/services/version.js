import { Worker } from 'worker_threads';

import MYDBM from "../utils/mysql.js";
import Utils from "../utils/utils.js";
import EM from "../utils/entity.js";
import Pr2RedisClient from '../utils/pr2-redis.js';

export default class VersionService {

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

            const _regions = await MYDBM.queryWithConditions('SELECT * FROM regions LIMIT ? OFFSET ?', [pageSize, offset]);
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

            const _regions = await MYDBM.queryWithConditions('SELECT * FROM regions WHERE RegionName LIKE ? LIMIT ? OFFSET ?;', [`${_search}%`, _limit, _skip]);

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

        const page = parseInt(_req.query.page, 10) || 1; // Default to page 1 if not provided
        const pageSize = parseInt(process.env.PAGE_SIZE, 10) || 10; // Default to 10 items per page if not provided
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
                SELECT r3.RegionName, r.RetailerName, r.RetailerId, r.Pincode, r.Pincode, u.Username, u.MobileNumber 
                FROM retailers r 
                INNER JOIN retailermanagers r2 ON r.RetailerId = r2.RetailerId
                INNER JOIN users u ON u.UserId = r2.UserId
                INNER JOIN regions r3 ON r.RegionId = r3.RegionId
                WHERE r.IsAuthorized=1 
                LIMIT ? OFFSET ?
            `;

            const _retailers = await MYDBM.queryWithConditions(query, [pageSize, offset]);
            const retailers = await this.updateVersionInfo(_retailers);

            const totalQuery = `SELECT COUNT(*) as count FROM retailers r INNER JOIN retailermanagers r2 ON r.RetailerId = r2.RetailerId INNER JOIN regions r3 ON r.RegionId = r3.RegionId INNER JOIN users u ON u.UserId = r2.UserId WHERE r.IsAuthorized=1;`;
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

            const userAppVersionModel = await EM.getModel("userappversion");
            const versions = await userAppVersionModel.find({}).lean();

            for (let i = 0; i < _retailers.length; i++) {

                const _version = _retailers[i];
                _version["Version1"] = true;
                _version["Version2"] = false;
                _version["Version"] = 1;

                for (let j = 0; j < versions.length; j++) {
                    if (versions[j].RetailerId == _version.RetailerId) {
                        _version["Version"] = versions[j].Version;
                        if (versions[j].Version == 1) {
                            _version["Version1"] = true;
                            _version["Version2"] = false;
                        } else if (versions[j].Version == 2) {
                            _version["Version1"] = false;
                            _version["Version2"] = true;
                        } else {
                            _version["Version1"] = true;
                            _version["Version2"] = true;
                        }
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

                regionRecord["Version1"] = 0;
                regionRecord["Version2"] = 0;
                regionRecord["Both"] = 0;
                regionRecord["Progress"] = "";
                regionRecord["Version1Full"] = false;
                regionRecord["Version2Full"] = false;

                const userAppVersionModel = await EM.getModel("userappversion");
                const versions = await userAppVersionModel.find({ RegionId: _regions[i].RegionId }).lean();
                for (let j = 0; j < versions.length; j++) {

                    if (versions[j].Version == 1) {
                        regionRecord["Version1"]++;
                    } else if (versions[j].Version == 2) {
                        regionRecord["Version2"]++;
                    } else {
                        regionRecord["Both"]++;
                    }

                }

                const retailers = await MYDBM.queryWithConditions('SELECT RetailerId FROM retailers WHERE RegionId = ?', [_regions[i].RegionId]);
                if (retailers && retailers.length > 0) {
                    regionRecord["Version1"] = (regionRecord["Version1"] + (retailers.length - versions.length));
                }

                if (retailers.length == regionRecord["Both"]) {
                    regionRecord["Version1Full"] = true;
                    regionRecord["Version2Full"] = true;
                } else if (retailers.length == regionRecord["Version1"]) {
                    regionRecord["Version1Full"] = true;
                } else if (retailers.length == regionRecord["Version2"]) {
                    regionRecord["Version2Full"] = true;
                }

                const bulkRegionUpdateStatusModel = await EM.getModel("system_bulk_update_status");
                const _progress = await bulkRegionUpdateStatusModel.findOne({ region: _regions[i].RegionId }).lean();
                if (_progress) {
                    regionRecord["Progress"] = _progress.message;
                    regionRecord["RegionName"] = regionRecord["RegionName"] + ("     - " + _progress.message);
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

            const worker = new Worker('./src/utils/thread.js', { workerData: { file: _req.query.regionId, user: _req.query.version } });

            worker.on('message', (message) => {
                console.log('Message from worker:', message);
            });

            worker.postMessage({ action: 'version_update' });

            const _version = _req.query.version == 1 ? 0 : 1;
            await MYDBM.queryWithConditions(`UPDATE regions SET isprv2enable = ? WHERE RegionId = ?`, [_version, _req.query.regionId]);

            await this.delay(2000);
            return await this.listRegions(_req);

        } catch (e) {
            console.log(e);
            throw e;
        }

    };

    toggleRetailerVersion = async (_req) => {

        try {

            const userAppVersionModel = await EM.getModel("userappversion");
            let _versionDetail = await userAppVersionModel.findOne({ RetailerId: _req.query.retailerId }).lean();

            if (_versionDetail && _versionDetail.Version) {
                _versionDetail = await userAppVersionModel.findByIdAndUpdate(_versionDetail._id, { $set: { Version: _req.query.version } }, { runValidators: true, new: true });
                this.redisClient.put("VERSION_MANAGER",_req.query.retailerId.toString(), _versionDetail);
            } else {

                /* Fetch retailer details */
                const retailer = await MYDBM.queryWithConditions(`SELECT * FROM retailers WHERE RetailerId = ?`, [_req.query.retailerId]);

                if (retailer) {
                    const model = new userAppVersionModel({
                        RetailerId: retailer[0].RetailerId,
                        RegionId: retailer[0].RegionId,
                        Version: _req.query.version
                    });
                    await model.save();
                    this.redisClient.put("VERSION_MANAGER",retailer[0].RetailerId.toString(), model);
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

            const { users, version } = _req.body;
            const userAppVersionModel = await EM.getModel("userappversion");
    
            if (!users || !version) {
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
    
            const results = [];
    
            for (let i = 0; i < totalBatch; i++) {
                const batch = users.slice(i * batchSize, (i + 1) * batchSize);
    
                const updatePromise = batch.map(async (uname) => {
                    try {
                        const retailers = await MYDBM.queryWithConditions(query, [uname.trim()]);
    
                        if (Array.isArray(retailers) && retailers.length === 1) {
                            let versionDetail = await userAppVersionModel.findOne({ RetailerId: retailers[0].RetailerId }).lean();
    
                            if (versionDetail && versionDetail.Version) {
                                // Update existing version
                                versionDetail = await userAppVersionModel.findByIdAndUpdate(
                                    versionDetail._id,
                                    { $set: { Version: version } },
                                    { runValidators: true, new: true }
                                );
                            } else {
                                // Create new version
                                versionDetail = new userAppVersionModel({
                                    RetailerId: retailers[0].RetailerId,
                                    RegionId: retailers[0].RegionId,
                                    Version: version
                                });
                                await versionDetail.save();
                            }
    
                            await this.redisClient.put("VERSION_MANAGER",retailers[0].RetailerId.toString(), versionDetail);

                            let _msg = "Version "+ version +" has been enabled for "+ retailers[0].RetailerName;
                            if (version == 3) {
                                _msg = "Both versions has been enabled for "+ retailers[0].RetailerName;
                            }
                            
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