import RedisClient from "./redis.js";
import ServiceService from "../services/service.js";
import EntityService from "../services/entity.js";
import CapabilityModel from "../models/capability.js";
import RoleModel from "../models/role.js";
import RolePrivilegeMappingModel from "../models/role-privilege-mapping.js";

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
            await this.setPrivileges();

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
                                    get: capability.can_read,
                                    post: capability.can_create,
                                    delete: capability.can_delete,
                                    put: capability.can_update
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
                        get: capability.can_read,
                        post: capability.can_create,
                        delete: capability.can_delete,
                        put: capability.can_update
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
    
    getCapabilities = async (_handle) => {

        try {
            return await this.redisClient.get("pharmarack_cms_caps", _handle);            
        } catch (e) {  console.log(e);
            return null;
        }

    };

    setPrivileges = async () => {

        try {

            const roles = await RoleModel.find().lean();
    
            if (Array.isArray(roles)) {
                await Promise.all(
                    roles.map(async (_role) => {

                        const privileges = await RolePrivilegeMappingModel.find({ role: _role._id }).populate("privilege").lean().exec();
                        if (Array.isArray(privileges)) {

                            try {
                                const rolePrivileges = privileges.map((_priv) => _priv.privilege.handle);   

                                return await this.redisClient.put(
                                    "pharmarack_cms_prevs",
                                    `${_role._id}_privileges`,
                                    JSON.stringify(rolePrivileges)
                                );
                            } catch (e) {

                            }

                        }

                    })
                )
            }
            
        } catch (e) {
            console.log(e);
        }

    };

    setPrivilege = async (_roleId) => {
        
        try {

            const privileges = await RolePrivilegeMappingModel.find({ role: _roleId }).populate("privilege").lean().exec();
            if (Array.isArray(privileges)) {

                try {
                    const rolePrivileges = privileges.map((_priv) => _priv.privilege.handle);

                    return await this.redisClient.put(
                        "pharmarack_cms_prevs",
                        `${_roleId}_privileges`,
                        JSON.stringify(rolePrivileges)
                    );
                } catch (e) {

                }

            }

        } catch (e) {
            console.log(e);
        }

    };

    getPrivileges = async (_handle) => {

        try {
            return await this.redisClient.get("pharmarack_cms_prevs", _handle);
        } catch (e) { console.log(e);
            return null;
        }
        
    };

    setEntities = async () => {
        
        try {

            const entities = await this.entity.prepareEntites();
            const entityKeys = Object.keys(entities);

            const redisPromises = entityKeys.map(async (_eKey) => {
                try {
                    return await this.redisClient.put("pharmarack_cms_entities", _eKey, JSON.stringify(entities[_eKey]));
                } catch (e) {
                    console.log(e);
                }
            });

            await Promise.all(redisPromises);

        } catch (e) {
            console.log("Critical error. Setting up entity cache is failed", e);            
        }

    };

    setEntity = async (_handle, _entityObj) => {
        
        try {
            await this.redisClient.put("pharmarack_cms_entities", _handle, JSON.stringify(_entityObj));
        } catch (e) {
            console.log(e);            
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
    
    setRoutes = async () => {

        try {
            const routes = await this.service.prepareRoutes();
            await this.redisClient.put("pharmarack_cms_routes", "services", JSON.stringify(routes));
        } catch (e) {
            console.log(e);            
        }

    };

    getRoutes = async () => {

        try {
            return await this.redisClient.get("pharmarack_cms_routes", "services");
        } catch (e) {
            return null;
        }

    };

}
  
const cache = new Cache();  
export default cache;