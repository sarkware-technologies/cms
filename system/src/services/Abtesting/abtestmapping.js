import Utils from "../../utils/utils.js";
import AbTestingModel from "../../models/Ab-test.js";
import AbretailerModel from "../../models/Ab-retailers.js";
import AbregionModel from "../../models/Ab-region.js";
import AbBuildVersionModel from "../../models/ab-build-version.js";
import MYDBM from "../../utils/mysql.js";
import RedisSyncService from "./redisupdate.js";


export default class ABtestmappingService {

    constructor() {
        this.updateRedisService = new RedisSyncService();
    }


    mapping = async (_req) => {
        try {
            let { users, region, build, mappingId } = _req.body;
            let abtest = await AbTestingModel.findOne({ _id: mappingId })
            let updateuser = async () => {
                if (users && users.length != 0) {
                    let mappedRetailers = await AbretailerModel.find({ mappedId: abtest._id });
                    if (!Array.isArray(users) || users.length === 0) {
                        return;
                    }
                    let sql = `
                    SELECT * 
                    FROM users u
                    INNER JOIN retailermanagers r2 ON r2.UserId = u.UserId
                    LEFT JOIN retailers r ON r.RetailerId = r2.RetailerId
                    WHERE r.RetailerId IN (?)`;

                    let retailers = await MYDBM.queryWithConditions(sql, [users]);
                    let mappedUserIds = new Set(mappedRetailers.map((item) => item.retailerId));
                    let bulkOps = [];
                    retailers.forEach((retailer) => {
                        if (!mappedUserIds.has(retailer.RetailerId)) {
                            bulkOps.push(
                                {
                                    updateOne: {
                                        filter: { retailerId: retailer.RetailerId },
                                        update: {
                                            $set: {
                                                retailerId: retailer.RetailerId,
                                                userId: retailer.UserId,
                                                mappedId: mappingId,
                                                mappedAB: abtest.apis,
                                                username: retailer.Username,
                                                lastModified: new Date().getTime()
                                            }
                                        },
                                        upsert: true,
                                        runValidators: true
                                    }
                                }
                            )
                        }
                    });
                    await AbretailerModel.bulkWrite(bulkOps);
                }
            }
            let updateregion = async () => {
                let bulkOps = [];
                if (region && region.length != 0) {
                    let sql = `
                select * from regions  u
                WHERE u.RegionId IN (?)`;
                    if (region == 'all') {
                        let allregions = await MYDBM.queryWithConditions("select * from regions  u", []);
                        region = allregions.map((a) => a.RegionId);
                    }
                    if (region == "none") {
                        region = [];
                    }

                    let regions = await MYDBM.queryWithConditions(sql, [region]);

                    regions.forEach((element) => {
                        bulkOps.push(
                            {
                                updateOne: {
                                    filter: { regionId: element.RegionId },
                                    update: {
                                        $set: {
                                            regionId: element.RegionId,
                                            mappedId: mappingId,
                                            mappedAB: abtest.apis,
                                            regionName: element.RegionName,
                                            lastModified: new Date().getTime()
                                        }
                                    },
                                    upsert: true,
                                    runValidators: true
                                }
                            }
                        )
                    });

                    await AbregionModel.bulkWrite(bulkOps);
                }
            }
            let updatebuild = async () => {
                let bulkOps = [];
                if (build && build.length != 0) {
                    if (build == 'all') {
                        let allbuild = await AbBuildVersionModel.find();
                        build = allbuild.map((a) => a._id);
                    }
                    if (build == "none") {
                        build = [];
                    }
                    build.forEach((element) => {

                            bulkOps.push(
                                {
                                    updateOne: {
                                        filter: { _id: element },
                                        update: {
                                            $set: {
                                                mappedId: mappingId,
                                                mappedAB: abtest.apis,
                                                lastModified: new Date().getTime()
                                            }
                                        },
                                        upsert: true,
                                        runValidators: true
                                    }
                                }
                            )
                    });

                    await AbBuildVersionModel.bulkWrite(bulkOps);
                }
            }
            await Promise.all([
                updateuser(),
                updateregion(),
                updatebuild()
            ])
            await this.updateRedisService.updateRedis(mappingId);
            return { message: "mapping success" }
        }
        catch (error) {
            console.log(error);
        }
    };

    getmappeddetails = async (_req) => {
        const { type } = _req.params;

        if (type == "retailers") {
            return await this.getmappedretailers(_req);
        }
        else if (type == "region") {
            return await this.getmappedregion(_req);
        }
        else if (type == "build") {
            return await this.getmappedbuild(_req);
        }
        else {
            throw new Error("Invalid type");
        }
    }
    removemappted = async (_req) => {
        const { type } = _req.params;
        if (type == "retailers") {
            return await this.removeretailers(_req);
        }
        else if (type == "region") {
            return await this.removeregion(_req);
        }
        else if (type == "build") {
            return await this.removebuild(_req);
        }
        else {
            throw new Error("Invalid type");
        }
    }

    getmappedretailers = async (_req) => {
        const { id } = _req.params;
        const abtest = await AbTestingModel.findOne({ _id: id })
        if (!abtest) {
            throw new Error("Abtest not found");
        }
        const users = await AbretailerModel.find({ mappedId: id })
        const userlist = users.map((user) => user.retailerId);

        const sql = `
        SELECT * 
        FROM users u
        INNER JOIN retailermanagers r2 ON r2.UserId = u.UserId
        LEFT JOIN retailers r ON r.RetailerId = r2.RetailerId
        WHERE r.RetailerId IN (?)`;

        let retailers = [];
        if (userlist && userlist.length > 0) {
            retailers = await MYDBM.queryWithConditions(sql, [userlist]);
        }


        return { currentPage: 0, payload: retailers, recordPerPage: 0, totalPages: 0, totalRecords: retailers.length };


    }

    removeretailers = async (_req) => {
        const { id } = _req.body;
        let retailer = await AbretailerModel.findOne({ retailerId: id });

        await AbretailerModel.findOneAndUpdate({ retailerId: id }, { $set: { mappedAB: {}, mappedId: null } });
        this.updateRedisService.remove(`Retailer***${retailer.userId}`);
        return { message: "Retailer Remoevd Successfully" }
    }



    getmappedregion = async (_req) => {
        const { id } = _req.params;
        let abtest = await AbTestingModel.findOne({ _id: id })
        if (!abtest) {
            throw new Error("Abtest not found");
        }

        let assigned = await AbregionModel.find({ mappedId: id });

        return { currentPage: 0, payload: assigned, recordPerPage: 0, totalPages: 0, totalRecords: assigned.length };


    }
    removeregion = async (_req) => {
        const { id } = _req.body;
        let regions = await AbregionModel.findOne({ _id: id });
        await AbregionModel.findOneAndUpdate({ _id: id }, { $set: { mappedAB: {}, mappedId: null } });
        this.updateRedisService.remove(`Region***${regions.regionId}`);
        return { message: "Region Remoevd Successfully" }
    }

    getmappedbuild = async (_req) => {
        const { id } = _req.params;
        let abtest = await AbTestingModel.findOne({ _id: id })
        if (!abtest) {
            throw new Error("Abtest not found");
        }
        let assigned = await AbBuildVersionModel.find({ mappedId: id });

        return { currentPage: 0, payload: assigned, recordPerPage: 0, totalPages: 0, totalRecords: assigned.length };

    }
    removebuild = async (_req) => {
        const { id } = _req.body;
        let build = await AbBuildVersionModel.findOne({ _id: id });
        await AbBuildVersionModel.findOneAndUpdate({ _id: id }, { $set: { mappedAB: {}, mappedId: null } });
        this.updateRedisService.remove(`Build***${build.version + build.os}`);
        return { message: "Build Remoevd Successfully" }
    }


    getallRedis = async () => {
        return await this.updateRedisService.getAll(`AB_TESTING`);
    }
}