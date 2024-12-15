import dotenv from "dotenv";
dotenv.config();

import DBM from "./db.js";
import MYDBM from "./mysql.js";
import EM from "./entity.js";
import Pr2RedisClient from "./pr2-redis.js";

export default class VersionToggler {

    constructor() {
        this.BATCH_SIZE = 1000;
        this.redisClient = Pr2RedisClient.getInstance();
    }

    processUpdate = async (_regionId, _version) => {

        try {

            await DBM.connect();
            const retailers = await MYDBM.queryWithConditions('SELECT RetailerId FROM retailers WHERE RegionId = ?', [_regionId]);

            if (retailers.length === 0) {
                console.log('No retailers to update.');
                return;
            }

            const userAppVersionModel = await EM.getModel("userappversion");
            const bulkRegionUpdateStatusModel = await EM.getModel("system_bulk_update_status");

            const totalRetailers = retailers.length;
            let processedCount = 0;

            for (let i = 0; i < totalRetailers; i += this.BATCH_SIZE) {

                const batch = retailers.slice(i, i + this.BATCH_SIZE);

                const bulkOps = batch.map(retailer => ({
                    updateOne: {
                        filter: { RetailerId: retailer.RetailerId },
                        update: { $set: { RetailerId: retailer.RetailerId, RegionId: _regionId, Version: _version } },
                        upsert: true,
                        runValidators: true
                    }
                }));
                batch.map(async retailer => {
                    await this.redisClient.put("VERSION_MANAGER",retailer.RetailerId.toString(), { RetailerId: retailer.RetailerId, RegionId: _regionId, Version: parseInt(_version) });
                });
                processedCount += bulkOps.length;
                const result = await userAppVersionModel.bulkWrite(bulkOps);

                await bulkRegionUpdateStatusModel.findOneAndUpdate(
                    { region: _regionId },
                    {
                        $set: {
                            region: _regionId,
                            updated: processedCount,
                            pending: (totalRetailers - processedCount),
                            total: totalRetailers,
                            message: (`Processing ${processedCount} out of ${totalRetailers} retailers.`)
                        }
                    },
                    { runValidators: true, new: true, upsert: true }
                );

            }

            /* Now remove the progress tracking records */
            await bulkRegionUpdateStatusModel.deleteOne({ region: _regionId });

            return true;

        } catch (e) {
            console.log(e);
            throw e;
        }

    };

}