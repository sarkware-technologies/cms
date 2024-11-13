import dotenv from "dotenv";
dotenv.config();

import cache from "./cache.js";
import mongoose from "mongoose";
import EntityService from "../services/entity.js";

/**
 * 
 * @author          Sark
 * @version         1.0.0
 * @description     Responsible for creating and maintaining mongoose models
 *                  This module also constantly in contact with system module 
 *                  Will get the latest entity meta at real time
 * 
 */
class EntityManager {

    constructor () {

        this.types = {
            "1" : "String",
            "2" : "Number",
            "3" : "Date",
            "4" : "Boolean",
            "5" : "ObjectId",
            "6" : "Array",
            "7" : "BigInt",
            "8" : "Mixed"            
        };

        this.reloadEntityCache();

    }

    reloadEntityCache = async () => {
        await cache.setEntities();
    };

    createModel = async (_collectionName, _fields) => {

        try {
            return mongoose.model(_collectionName);
        } catch (_e) {
            /* OK, the model is yet to be loaded */
        }

        let config = {};
        let options = {};
        const schemaFields = {};

        for (const field of _fields) {
            if (field.status) {
                
                /* Type */
                config = {
                    type: this.types[field.type]                    
                };
                /* Check for the ObjectId type */
                if (this.types[field.type] === "ObjectId") {
                    config["type"] = mongoose.Schema.Types.ObjectId                    
                }

                /* Required */
                if (field.required) {
                    config["required"] = field.required;
                }

                /* Default */
                if (field.default) {                    
                    config["default"] = field.default;
                }

                /* Unique */
                if (field.unique) {                    
                    config["unique"] = field.unique;
                }

                /* Index */
                if (field.index) {                    
                    config["index"] = field.index;
                }

                if (field.options) {
                    try {
                        
                        options = {};
                        if (field.options && typeof field.options === "string") {
                            options = JSON.parse(field.options);
                        }
                        
                        if (this.types[field.type] === "String") {

                            if (('match' in options) && options.match !== "") {
                                config["match"] = options.match;
                            }
                            if ('trim' in options) {
                                config["trim"] = options.trim;
                            }
                            if (('enum' in options) && Array.isArray(options.enum)) {
                                config["enum"] = options.enum;
                            }
                            if (('minLength' in options) && !Number.isNaN(options.minLength) && parseFloat(options.minLength) >= 0) {
                                config["minLength"] = parseFloat(options.minLength);
                            }
                            if (('maxLength' in options) && !Number.isNaN(options.maxLength) && parseFloat(options.maxLength) > 0) {
                                config["maxLength"] = parseFloat(options.maxLength);
                            }
                            if ('lowercase' in options) {
                                config["lowercase"] = options.lowercase;
                            }
                            if ('uppercase' in options) {
                                config["uppercase"] = options.uppercase;
                            }                            

                        } else if (this.types[field.type] === "Number") {
                            if (('min' in options) && !Number.isNaN(options.min) && parseFloat(options.min) >= 0) {
                                config["min"] = parseFloat(options.min);
                            }
                            if (('max' in options) && !Number.isNaN(options.max) && parseFloat(options.max) > 0) {
                                config["max"] = parseFloat(options.max);
                            }
                        } else if (this.types[field.type] === "Date") {
                            if (('min' in options) && this.isValidDate(options.min)) {
                                config["min"] = new Date(options.min);
                            }
                            if (('max' in options) && this.isValidDate(options.max)) {
                                config["max"] = new Date(options.max);
                            }
                        } else if (this.types[field.type] === "ObjectId") {

                            const _entity = await this.getEntityHandle(options.entity, _collectionName);
                            if (_entity) { 
                                config["ref"] = _entity;
                            }                            
                                                        
                        } else if (this.types[field.type] === "Array") {

                            if (options.itemType === "ObjectId") {
                                const _entity = await this.getEntityHandle(options.itemTarget, _collectionName);
                                config["ref"] = _entity;
                                config["type"] = mongoose.Schema.Types.ObjectId;
                            } else {
                                config["type"] = options.itemType;
                            }

                            config = [config];

                        }

                    } catch (_e) { 
                        console.error(_e);
                        /* Ignore */
                    }                    
                    
                }   
                
                /* Update default value for Boolean - since default is String type */
                if (this.types[field.type] === "Boolean" && config["default"] && typeof config["default"] === 'string') {
                    config["default"] = (config["default"] === 'true');
                }

                schemaFields[field.handle] = config;

            }            
        }

        /* Auditing fields */
        //schemaFields["healthy"] = { type: mongoose.Schema.Types.Boolean, default: true };
        //schemaFields["audit_msg"] = { type: mongoose.Schema.Types.String, default: "" };
        //schemaFields["last_dump"] = { type: mongoose.Schema.Types.String, default: "" };
        schemaFields["createdBy"] = { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null },
        schemaFields["updatedBy"] = { type: mongoose.Schema.Types.ObjectId, ref: "cms_system_user", default: null }

        const schema = new mongoose.Schema(schemaFields, {strict: true, timestamps: true});  

        return mongoose.model(_collectionName, schema);        

    };

    getModel = async (_entity) => {

        if (_entity) { 

            let modelExist = await cache.hasEntity(_entity);
            
            if (!modelExist) {

                /**
                 * Entity not found on the cache
                 * Thats probably the entity belongs to some other service,
                 * Lets try to fetch it from system
                 * 
                 **/
                try {
                    await this.reloadEntityCache();
                } catch (_e) {
                    console.error(_e);
                }

            }

            modelExist = await cache.hasEntity(_entity);
            if (modelExist) { 

                const entity = await cache.getEntity(_entity);

                if (Array.isArray(entity.fields) && entity.fields.length > 0) {                   
                    return await this.createModel(_entity, entity.fields);
                } else {
                    throw new Error("No fields found for entity : "+ _entity);    
                }

            }
        }

        throw new Error("Invalid entity : "+ _entity);

    };

    getEntityHandle = async(_id, _collectionName) => {

        const eCahceList = await cache.getAll();
        if (eCahceList) {
            const keys = Object.keys(eCahceList);
            for (let i = 0; i < keys.length; i++) {
                if (eCahceList[keys[i]].id == _id) {
                    if (keys[i] !== _collectionName) {

                        /* Also check if the model exist */
                        try {
                            mongoose.model(keys[i]);
                        } catch (_e) {
                            await this.createModel(keys[i], eCahceList[keys[i]].fields);
                        }
                        
                    }    
                    return keys[i];                 
                }
            }
        }

        return null;

    };

    migrateCollection = async (_db, _collection, _metaFields) => {

        let document = {};
        let collection = _db.collection(_collection);
        const oldDocuments = await collection.find().toArray();

        /* Drop the old collection */
        await _db.collection(_collection).drop(); 

        /* Now create new collection */
        collection = await _db.createCollection(_collection);

        /* Now insert the old documents */
        for (let i = 0; i < oldDocuments.length; i++) {

            document = {};
            document["_id"] = oldDocuments[i]._id;            
            document["createdAt"] = oldDocuments[i].createdAt;
            document["updatedAt"] = oldDocuments[i].updatedAt;
            document["__v"] = oldDocuments[i].__v;

            /* Prepare it */
            for (let j = 0; j < _metaFields.length; j++) {
                if (oldDocuments[i][_metaFields[j].handle]) {
                    document[_metaFields[j].handle] = oldDocuments[i][_metaFields[j].handle];
                } else {
                    document[_metaFields[j].handle] = _metaFields[j].default;
                }                
            }
            
            /* Insert it */
            await collection.insertOne(document);

        }

    };

}

const EM = new EntityManager();
export default EM;