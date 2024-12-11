import redis from "redis";

export default class RedisClient {
  static instance;

  constructor() {
    if (RedisClient.instance) {
      return RedisClient.instance;
    }

    try {
      this.writeClient = redis.createClient({
        url: process.env.REDIS_WRITE_CLIENT,
      });

      this.readClient = redis.createClient({
        url: process.env.REDIS_READ_CLIENT,
      });

      this.writeClient.connect();
      this.readClient.connect();
    } catch (error) {
      console.log(error);
    }

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
      await this.writeClient.hSet(group, key, JSON.stringify(object));          
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
        console.log(`No data found for key: ${key}`);
        return null;
      }
    } catch (err) {
      console.error("Error retrieving object from Redis:", err);
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
