import RedisClient from "./redis.js";
import ServiceService from "../services/service.js";
import EntityService from "../services/entity.js";

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
            this.service = new ServiceService();
            this.entity = new EntityService();
        }
  
        return Cache.instance;

    };

    initCache = async () => {       

        try {

            await this.setEntities();  
            await this.setRoutes();
            return true;

        } catch (e) {
            return false;
        }

    };    

    setEntities = async () => {
        
        try {

            const entities = await this.entity.prepareEntites();
            const eKeys = Object.keys(entities);

            for (let i = 0; i < eKeys.length; i++) {
                await this.redisClient.put("pharmarack_cms_entities", eKeys[i], JSON.stringify(entities[eKeys[i]]));
            }

        } catch (e) {
            console.log("Critical error. Setting up entity cache is failed", e);            
        }

    };

    setEntity = async (_key, _value) => {
        
        try {
            await this.redisClient.put("pharmarack_cms_entities", _key, JSON.stringify(_value));
        } catch (e) {
            console.log(e);            
        }

    }; 

    getEntity = async (_key) => {
        return await this.redisClient.get("pharmarack_cms_entities", _key);
    };

    hasEntity = async (_key) => {
        return await this.redisClient.exists("pharmarack_cms_entities", _key);
    };
    
    setRoutes = async () => {

        try {
            const routes = await this.service.prepareRoutes();
            await this.redisClient.put("pharmarack_cms_routes", "services", JSON.stringify(routes));
        } catch (e) {
            console.log(e);            
        }

    };

}
  
// Create a single instance of the Cache class
const cache = new Cache();
  
// Export the instance to make it accessible from other modules
export default cache;