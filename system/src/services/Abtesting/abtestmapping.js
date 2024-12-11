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
        let { users, region, build, mappingId } = _req.body;
        let abtest = await AbTestingModel.findOne({ _id: mappingId })
        let updateuser = async () => {
            if (users && users.length != 0) {
                let mappedUsers = abtest.users;
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

                let mappedUserIds = new Set(abtest.users.map(user => user));
                let bulkOps = [];
                retailers.forEach((retailer) => {
                    if (!mappedUserIds.has(retailer.RetailerId)) {
                        mappedUsers.push(retailer.RetailerId);
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
                                            lastModified:new Date().getTime()
                                        }
                                    },
                                    upsert: true,
                                    runValidators: true
                                }
                            }
                        )
                    }
                });
                let findretailer = await AbretailerModel.find({ retailerId: { $in: users } });
                let mappings = findretailer.map((a) => a.mappedId)
                let mapped = await AbTestingModel.find({ _id: { $in: mappings } });
                const usersSet = new Set(users);

                await Promise.all(
                    mapped.map(async (element) => {
                        element.users = element.users.filter((a) => !usersSet.has(a));
                        await element.save();
                    })
                );

                await AbretailerModel.bulkWrite(bulkOps);
                await AbTestingModel.findByIdAndUpdate({ _id: mappingId }, { $set: { users: mappedUsers } });
            }
        }
        let updateregion = async () => {
            let mappedregion = abtest.region;
            let bulkOps = [];
            if (region && region.length != 0) {
                let sql = `
                select * from regions  u
                WHERE u.RegionId IN (?)`;
                if (region == 'all') {
                    let allregions = await MYDBM.queryWithConditions("select * from regions  u", []);
                    region = allregions.map((a) => a.RegionId);
                }
                if(region =="none"){
                    region =[];
                }

                let regions = await MYDBM.queryWithConditions(sql, [region]);

                regions.forEach((element) => {
                    let alreadymapped = abtest?.region.find((e) => e == element.RegionId);
                    if (alreadymapped == null) {
                        mappedregion.push(element.RegionId);

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
                                            lastModified:new Date().getTime()
                                        }
                                    },
                                    upsert: true,
                                    runValidators: true
                                }
                            }
                        )
                    }
                });
                let findregion = await AbregionModel.find({ regionId: { $in: region } });
                let mappings = findregion.map((a) => a.mappedId)
                let mapped = await AbTestingModel.find({ _id: { $in: mappings } });
                const regionSet = new Set(region);
                await Promise.all(
                    mapped.map(async (element) => {
                        element.region = element.region.filter((a) => !regionSet.has(a));
                        await element.save();
                    })
                );
                await AbregionModel.bulkWrite(bulkOps);
                await AbTestingModel.findByIdAndUpdate({ _id: mappingId }, { $set: { region: mappedregion } })
            }
        }
        let updatebuild = async () => {
            let mappedbuild = abtest.buildversion;
            let bulkOps = [];
            if (build && build.length != 0) {
                if (build == 'all') {
                    let allbuild = await AbBuildVersionModel.find();
                    build = allbuild.map((a) => a._id);
                }
                if(build =="none"){
                    build =[];
                }
                build.forEach((element) => {
                    let alreadymapped = abtest?.buildversion.find((e) => e == element);
                    if (alreadymapped == null) {
                        mappedbuild.push(element);
                        bulkOps.push(
                            {
                                updateOne: {
                                    filter: { _id: element },
                                    update: {
                                        $set: {
                                            mappedId: mappingId,
                                            mappedAB: abtest.apis,
                                            lastModified:new Date().getTime()
                                        }
                                    },
                                    upsert: true,
                                    runValidators: true
                                }
                            }
                        )
                    }
                });
                let findbuild = await AbBuildVersionModel.find({ _id: { $in: build } });
                let mappings = findbuild.map((a) => a.mappedId)
                let mapped = await AbTestingModel.find({ _id: { $in: mappings } });
                const buildSet = new Set(build);
                await Promise.all(
                    mapped.map(async (element) => {
                        element.buildversion = element.buildversion.filter((a) => !buildSet.has(a));
                        await element.save();
                    })
                );

                await AbBuildVersionModel.bulkWrite(bulkOps);
                await AbTestingModel.findByIdAndUpdate({ _id: mappingId }, { $set: { buildversion: mappedbuild } })
            }
        }
        await Promise.all([
            updateuser(),
            updateregion(),
            updatebuild()
        ])
       await this.updateRedisService.updateRedis(mappingId);
        return { message: "mapping success" }
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
        let mapped = await AbTestingModel.findOne({ _id: retailer.mappedId });
        if (mapped) {
            mapped.users = mapped.users.filter((a) => a != id);
            await mapped.save();
        }
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
        let mapped = await AbTestingModel.findOne({ _id: regions.mappedId });
        if (mapped) {
            mapped.users = mapped.region.filter((a) => a != id);
            await mapped.save();
        }
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
        let mapped = await AbTestingModel.findOne({ _id: build.mappedId });
        if (mapped) {
            mapped.users = mapped.buildversion.filter((a) => a != id);
            await mapped.save();
        }
        await AbBuildVersionModel.findOneAndUpdate({ _id: id }, { $set: { mappedAB: {}, mappedId: null } });
        this.updateRedisService.remove(`Build***${build.version+build.os}`);
        return { message: "Build Remoevd Successfully" }
    }


    getallRedis = async ()=>{
        return await this.updateRedisService.getAll(`AB_TESTING`);
    }
}