
import Pr2RedisClient from "../utils/pr2-redis.js";

export default class Redisdata {

    constructor() {
        this.redisPool = Pr2RedisClient.getInstance();
    }
    async topPicksResponsenew(data) {
        let result = [];
        data?.forEach((a) => {
            result.push({
                product_name: a.ProductName,
                storeid: a.Storeid,
                company: a.company,
            });
        });

        return result;
    }
    topPicks = async (data) => {
        try {
            const redisClientReader = await this.redisPool.getReaderConnection();
            let result = [];
            if (data?.storeId != null && data.storeId.length != 0) {
                result = await new Promise(async (resolve, reject) => {
                    let results = [];
                    for (let i = 0; i < data?.storeId.length; i++) {
                        let resultTemp = await redisClientReader.get(
                            `DistributorTrendingProducts****${data?.storeId[i]}`,
                        );
                        resultTemp = resultTemp ? resultTemp.replace(/'/g, '"') : null;
                        resultTemp = JSON.parse(resultTemp);
                        if (
                            resultTemp != null &&
                            Array.isArray(resultTemp) &&
                            resultTemp.length != 0
                        ) {
                            for (let x = 0; x < resultTemp.length; x++) {
                                results.push(resultTemp[x]);
                            }
                        }
                    }
                    resolve(results);
                });
            }
            result = await this.topPicksResponsenew(result);
            return result;
        } catch (error) {
            serverError(this.response, error.message);
        }
    }


    orderAgain = async (data) => {
        try {
            const redisClientReader = await this.redisPool.getReaderConnection();
            let resultTemp = await redisClientReader.get(
                `OrderAgain****${data.UserId}`,
            );
            let result = [];
            if (resultTemp != null) {
                resultTemp = resultTemp.replace(/'/g, '"');
                resultTemp = JSON.parse(resultTemp);
                if (Array.isArray(resultTemp)) {
                    result = resultTemp;
                }
            }
            result = await this.topPicksResponsenew(result);
            return result;
        } catch (error) {
            serverError(this.response, error.message);
        }
    }

    trendingProducts = async (data) => {
        try {
            const redisClientReader = await this.redisPool.getReaderConnection();
            let resultTemp = await redisClientReader.get(
                `TrendingProducts****${data.regionName}`,
            );

            let result = [];
            if (resultTemp != null) {
                resultTemp = resultTemp.replace(/'/g, '"');
                resultTemp = JSON.parse(resultTemp);
                if (Array.isArray(resultTemp)) {
                    result = resultTemp;
                }
            }
            result = await this.topPicksResponsenew(result);
            return result;
        } catch (error) {
            serverError(this.response, error.message);
        }
    }

}
