import RedisClient from "./redis.js";

/**
 * 
 * @author          Sark
 * @version         1.0.0
 * @description     Helper utils for storing key values
 *                  An object cache (because it's singleton instance)
 *                  Used mainly for maintaining Entity Meta
 * 
 */
class Cache {

    constructor() {

        if (!Cache.instance) {            
            Cache.instance = this;
            this.redisClient = RedisClient.getInstance(); 
        }
  
        return Cache.instance;

    };

    initCache = async () => {       

        try {
            return true;
        } catch (e) {
            return false;
        }

    };    

    getCapabilities = async (_handle) => {

        try {
            return await this.redisClient.get("pharmarack_cms_caps", _handle);            
        } catch (e) {  console.log(e);
            return null;
        }

    };

    getPrivileges = async (_handle) => {

        try {
            return await this.redisClient.get("pharmarack_cms_prevs", _handle);
        } catch (e) { console.log(e);
            return null;
        }
        
    };

    getEntity = async (_handle) => {

        try {
            return await this.redisClient.get("pharmarack_cms_entities", _handle);
        } catch (e) {
            return null;
        }
        
    };

    hasEntity = async (_handle) => {

        try {
            return await this.redisClient.exists("pharmarack_cms_entities", _handle);
        } catch (e) {
            return null;
        }

    };

}
  
const cache = new Cache();  
export default cache;