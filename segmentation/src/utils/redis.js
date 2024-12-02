import redis from "redis";

export default class RedisClient {

    static instance;

    constructor() {
        if (RedisClient.instance) {
            return RedisClient.instance;
        }

        try { 
            
            this.writeClient = redis.createClient({
                //url: "redis://pharmretail-uat-cmsreplicationgroup.desm5w.ng.0001.aps1.cache.amazonaws.com:6379",
                url: process.env.REDIS_WRITE_CLIENT
            });

            this.readClient = redis.createClient({
                //url: "redis://pharmretail-uat-cmsreplicationgroup-ro.desm5w.ng.0001.aps1.cache.amazonaws.com:6379",
                url: process.env.REDIS_READ_CLIENT
            });

            this.writeClient.connect();
            this.readClient.connect();

        } catch (error) {
            console.log(error);
        }

        console.log("Redis client is connected");

        RedisClient.instance = this;
    }

    static getInstance() {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }
        return RedisClient.instance;
    }

    async put(group, key, object) {
        try {
            await this.writeClient.hSet(group, key, object);                
        } catch (err) {
            console.error("Error storing object in Redis:", err);
        }
    }

    async get(group, key) {
        try {
            const data = await this.readClient.hGet(group, key);
            if (data) {
                return JSON.parse(data);
            } else {               
                return null;
            }
        } catch (err) {
            console.error("Error retrieving object from Redis:", err);
        }
    }

    async getAll(group) {

        try {
            const data = await this.readClient.hGetAll(group);
            if (data) {                
                return Object.fromEntries(
                    Object.entries(data).map(([key, value]) => [key, JSON.parse(value)])
                );
            } else {
                return null;
            }
        } catch (err) {
            console.error("Error retrieving all key-value pairs from Redis:", err);
        }

    }

    async exists(group, key) {
        try {
            // Using hExists to check if the key exists in the hash
            const exists = await this.readClient.hExists(group, key);
            return exists; // Returns true or false
        } catch (err) {
            console.error("Error checking key existence in Redis:", err);
        }
    }

    async invalidateAllCache(group) {
        try {
            await this.writeClient.del(group);            
        } catch (err) {
            console.error("Error invalidating cache in Redis:", err);
        }
    }

}

// Properly close the Redis clients when done
process.on("exit", () => {
    const redisClient = RedisClient.getInstance();
    redisClient.writeClient.quit();
    redisClient.readClient.quit();
});

