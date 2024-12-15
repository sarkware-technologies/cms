import redis from "redis";

export default class Pr2RedisClient {

    static instance;

    constructor() {
        
        if (Pr2RedisClient.instance) {
            return Pr2RedisClient.instance;
        }

        try {
            this.writeClient = redis.createClient({
                url: process.env.PR2_BACKEND_REDIS_WRITE_CLIENT,
            });

            this.readClient = redis.createClient({
                url: process.env.PR2_BACKEND_REDIS_READ_CLIENT,
            });

            this.writeClient.connect();
            this.readClient.connect();

        } catch (error) {
            console.log(error);
        }

        Pr2RedisClient.instance = this;
    }

    static getInstance() {
        if (!Pr2RedisClient.instance) {
            Pr2RedisClient.instance = new Pr2RedisClient();
        }
        return Pr2RedisClient.instance;
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
    async delete(group, key) {
        try {
            const result = await this.writeClient.hDel(group, key); // Delete the specific key from the hash
            if (result === 1) {
                console.log(`Successfully deleted key '${key}' from group '${group}'`);
            } else {
                console.log(`Key '${key}' not found in group '${group}'`);
            }
        } catch (err) {
            console.error("Error deleting object from Redis:", err);
        }
    }

    async  getAll(group) {

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
    const redisClient = Pr2RedisClient.getInstance();
    redisClient.writeClient.quit();
    redisClient.readClient.quit();
});

