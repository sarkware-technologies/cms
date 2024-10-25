import RedisClient from "./redis.js";
import ServiceService from "../services/service.js";
import EntityService from "../services/entity.js";
import CapabilityModel from "../models/capability.js";
import MenuModel from "../models/menu.js";
import RoleModel from "../models/role.js";

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
            await this.setCapabilities();

            return true;

        } catch (e) {
            return false;
        }

    };    

    setCapabilities = async () => {
        try {
            const roles = await RoleModel.find().lean();
    
            if (Array.isArray(roles)) {
                
                await Promise.all(
                    roles.map(async (role) => {
                        const capabilities = await CapabilityModel.find({ role: role._id }).populate('module').lean().exec();
    
                        if (Array.isArray(capabilities)) {
                            
                            const redisPromises = capabilities.map(async (capability) => {
                                const roleCaps = {
                                    read: capability.can_read,
                                    create: capability.can_create,
                                    delete: capability.can_delete,
                                    update: capability.can_update
                                };
                                try {
                                    return await this.redisClient.put(
                                        "pharmarack_cms_caps",
                                        `${role._id}_${capability.module.handle}`,
                                        JSON.stringify(roleCaps)
                                    );
                                } catch (e) {
                                    console.error("Error storing capability in Redis:", e);
                                }
                            });
    
                            await Promise.all(redisPromises);
                        }
                    })
                );
            }
        } catch (e) {
            console.error("Critical error. Setting up capabilities cache failed", e);
        }
    };

    setCapability = async (_roleId) => {

        try {
            const capabilities = await CapabilityModel.find({ role: _roleId }).populate('module').lean().exec();
            
            if (Array.isArray(capabilities)) {
                const redisPromises = capabilities.map(async (capability) => {
                    const roleCaps = {
                        read: capability.can_read,
                        create: capability.can_create,
                        delete: capability.can_delete,
                        update: capability.can_update
                    };
                    
                    try {
                        return await this.redisClient.put(
                            "pharmarack_cms_caps",
                            `${_roleId}_${capability.module.handle}`,
                            JSON.stringify(roleCaps)
                        );
                    } catch (e) {
                        console.error("Error storing capability in Redis:", e);
                    }
                });
    
                await Promise.all(redisPromises);
            }
    
        } catch (e) {
            console.log("Error setting capability:", e);
        }
        
    };
    

    setPrivileges = async () => {

    };

    setPrivilege = async (_key, _value) => {
        
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