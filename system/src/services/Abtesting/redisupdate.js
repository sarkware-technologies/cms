import RedisClientSession from "../../utils/redisSessionManager.js";
import AbTestingModel from "../../models/Ab-test.js";
import AbretailerModel from "../../models/Ab-retailers.js";
import AbregionModel from "../../models/Ab-region.js";
import AbBuildVersionModel from "../../models/ab-build-version.js";

export default class RedisSyncService {
    constructor() {
        this.redisClient = RedisClientSession.getInstance();
    }

    async bulkUpdate(req) {
        let tests = await AbTestingModel.find();

        tests.forEach((test) => {
            this.updateRedis(test._id);
        });
        return { message: "Started successfully" }
    }

    async updateRedis(testId) {
        let test = await AbTestingModel.findOne({_id:testId});
        const [retailers, regions, builds] = await Promise.all([
            AbretailerModel.find({ mappedId: testId }),
            AbregionModel.find({ mappedId: testId }),
            AbBuildVersionModel.find({ mappedId: testId }),
        ]);

        await Promise.all([
            this.updateRedisEntries(retailers, this.prepareRetailerPayload, "Retailer",test),
            this.updateRedisEntries(regions, this.prepareRegionPayload, "Region",test),
            this.updateRedisEntries(builds, this.prepareBuildPayload, "Build",test),
        ]);
    }

    async updateRedisEntries(items, payloadMapper, keyPrefix,test) {
        const entries = items.map(async item => {
            const payload = payloadMapper(item,test);
            const redisKey = `${keyPrefix}***${payload.id}`;
            return this.redisClient.put("AB_TESTING", redisKey,JSON.stringify(payload));
        });
        await Promise.all(entries);
    }

    prepareRetailerPayload(item,test) {
        return {
            id: item.userId,
            lastModified: item.lastModified,
            apis: test.apis,
            mappedId: item.mappedId,
            retailerId: item.retailerId,
            username: item.username,
        };
    }

    prepareRegionPayload(item,test) {
        return {
            id: item.regionId,
            lastModified: item.lastModified,
            apis: test.apis,
            mappedId: item.mappedId,
            regionName: item.regionName,
        };
    }

    prepareBuildPayload(item,test) {
        return {
            id: item.version+item.os,
            lastModified: item.lastModified,
            apis: test.apis,
            mappedId: item.mappedId,
            os: item.os,
        };
    }

    remove = (key)=>{
        return this.redisClient.delete("AB_TESTING", key);
    }

    getAll = (key)=>{
        return this.redisClient.getAll(key);
    }
}
