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
            
            this.entityCache = {};
            this.pageCache = {};

            this.timers = {};
            this.expirationTime = 3600 * 24 * 1000; // 24 Hrs

            Cache.instance = this;
        }
  
        return Cache.instance;

    };

    getAll = () => this.entityCache;

    setEntities = (_value) => {
        this.entityCache = _value;
    };

    setEntity = (_key, _value) => {
        this.entityCache[_key] = _value;
    }; 
    
    getEntity = (_key) => {
        return this.entityCache[_key];
    };

    hasEntity = (_key) => {
        return this.entityCache[_key] ? true : false;
    };
  
    removeEntity = (_key) => {
        delete this.entityCache[_key];
    };  

    setPage = (_key, _value) => {
        this.pageCache[_key] = _value;
        this.initTimer(_key);
    };

    getPage = (_key) => {
        return this.pageCache[_key] ? this.pageCache[_key] : null;
    };

    hasPage = (_key) => {
        return this.pageCache[_key] ? true : false;
    };

    removePage = (_key) => {
        if (this.pageCache[_key]) {
            delete this.pageCache[_key];
        }
    }; 
    
    removePageType = (_type) => {

        const keys = Object.keys(this.pageCache);

        for (let i = 0; i < keys.length; i++) {
            if (keys[i].startsWith(_type)) {
                delete this.pageCache[keys[i]];
            }
        }
        
    }; 

    removeAllPage = () => {
        this.pageCache = {};
    }

    initTimer = (_key) => {

        if (!this.timers[_key]) {
             this.timers[_key] = setTimeout(() => {
                 this.removePage(_key);
                 delete this.timers[_key];
            }, this.expirationTime);
        }

    };

    resetTimer = (_key) => {

        if (this.timers[_key]) {
            clearTimeout(this.timers[_key]);
            delete this.timers[_key];
            this.initTimer(_key);
        }
        
    };

}
  
// Create a single instance of the Cache class
const cache = new Cache();
  
// Export the instance to make it accessible from other modules
export default cache;