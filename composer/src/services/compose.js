import MYDBM from "../utils/mysql.js";

import SegmentModel from "../models/segment.js";
import PageComponentMappingModel from "../models/page-component-map.js";
import ComponentTypeModel from "../models/component-type.js";
import ComponentModel from "../models/component.js";
import PageTypeModel from "../models/page-type.js";
import PageModel from "../models/page.js";
import RulesGroupModel from "../models/rules-group.js";
import RuleModel from "../models/rule.js";
import RuleType from "../enums/rule-type.js";
import ConditionType from "../enums/condition-type.js";
import ApiService from "./api.js";
import ElasticService from "./elastic.js";
import OpensearchApi from "./openSearch.js";
import CmsRedisClient from "../utils/cms-redis.js";
import Retailer from "../models/retailer.js";
import RetailerMaster from "../models/retailer-master.js";
import SegmentRetailerModel from "../models/segment-retailer.js";

export default class ComposeService {

    constructor() {

        this.segments = null;
        this.provider = new ApiService();
        this.elastic = new ElasticService();
        this.OpensearchApi = new OpensearchApi();
        this.redisClient = CmsRedisClient.getInstance();

        // this.cdnBaseUrl = null;
        this.cdnBaseUrl = process.env.CDN_ASSET_URL || 'dimoww82uudwo.cloudfront.net';
        this.baseUrlRegex = /^(https?:\/\/).*?(\/|$)/;                

    }

    handlePageRequest = async (_req) => {

        /** 
         * 
         * module : /cms
         * entity : /page
         * pageType   : /{page-type-handle}  Expect - page type handle
         * 
         */        
        
        let [module, entity, pageType] = this.getUrlPathParts(`${_req.protocol}://${_req.get("host")}${_req.originalUrl}`);
        const _token = _req.headers["authorization"];
        if (!_token) {
            throw new Error("Bearer token not present");
        }
        const user = _req.user;
        if (!user) {
            throw new Error("Invalid token");
        }

        if (module && entity && pageType) {

            let retailerId = null;
            let regionName = '';            
            let cmsRetailer = null;

            const distributorId = parseInt(_req.query.sid);
            const companyId = parseInt(_req.query.cid);

            let pageKey = (pageType + "_" + user);
            if (distributorId) {
                pageKey += "_" + distributorId;
            }
            if (companyId) {
                pageKey += "_" + companyId;
            }

            const pageCache = await this.redisClient.get("PAGE", pageKey);
            if (pageCache) {
                return pageCache;
            }
            try {

                let retailer = await Retailer.findOne({ userId: user });
                if (!retailer) {
                    const retailerPromise = await MYDBM.queryWithConditions(
                        `select r.RetailerId, r.RetailerName,r3.RegionName, r3.StateId, r3.RegionId from retailers r inner join retailermanagers r2 on r2.RetailerId = r.RetailerId inner join regions r3  on r3.RegionId = r.RegionId  where r2.UserId=?`,
                        [user]
                    );
                    if (retailerPromise && retailerPromise.length != 0) {
                        retailer = await Retailer.create({
                            userId: user,
                            RetailerId: retailerPromise[0].RetailerId,
                            RetailerName: retailerPromise[0].RetailerName,
                            RegionName: retailerPromise[0].RegionName                            
                        });
                    }
                }

                if (retailer) {
                    retailerId = retailer.RetailerId;
                    regionName = retailer?.RegionName;                    
                }                

                if (!retailerId) {
                    throw new Error("No retailer found", retailer);
                }

                /* Get  cms retailer id as well */
                cmsRetailer = await RetailerMaster.findOne({ RetailerId: retailerId}).lean();

                if (!cmsRetailer) {
                    throw new Error(`The retailer ${retailerId} is no found on CMS Retailer Master collection`);
                }

            } catch (e) {
                throw e;
            }

            /* Step 1 - determine the segments */            
            const segments = await this.determineSegments(cmsRetailer._id);

            /* Step 2 - fetch the page sequence */
            if (segments) {

                try {
                    
                    const [pageTypeObj, details] = await Promise.all([
                        PageTypeModel.findOne({ handle: pageType }).lean(),
                        this.OpensearchApi.getOfferdetails(user)
                    ]);
                    
                    if (pageTypeObj) {

                        let page = null;

                        if (companyId) {
                            /* Check for dedicated page */
                            page = await PageModel.findOne({ status: true, mapped_company: companyId }).lean();
                        }

                        if (!page) {
                            page = await PageModel.findOne({ type: pageTypeObj._id, status: true, is_default: false }).lean();
                        }

                        if (page) {
                            /* Read the sequence */
                            if (page.sequence && Array.isArray(page.sequence)) {

                                let payload = {
                                    title: "",
                                    meta: [],
                                    description: "",
                                    sequence: [],
                                    components: {},
                                    details
                                };

                                let typeList = {};

                                const batchPromises = page.sequence.map((seq, i) => {
                                    typeList[seq] = (typeList[seq] || 0) + 1; // Increment type count
                                    return this.prepareComponent(page._id, seq, typeList[seq], retailerId, distributorId, companyId, _token, user, regionName, details, i, segments);
                                });                                

                                let ress = await Promise.all(batchPromises);
                                ress.sort((a, b) => a[2] - b[2]); // Sort based on the third item in each result
                                ress.forEach(([componentId, components]) => {
                                    if (componentId) {
                                        payload.sequence.push(componentId);
                                        payload.components = { ...payload.components, ...components };
                                    }
                                });

                                if (payload.sequence.length === 0) {
                                    /* This means the page is empty - return the default page instead */
                                    const defaultPage = await PageModel.findOne({ type: pageTypeObj._id, status: true, is_default: true }).lean();
                                    if (defaultPage) {
                                        // Prepare default page components
                                        typeList = {};
                                        const defaultBatchPromises = defaultPage.sequence.map((seq, i) => {
                                            typeList[seq] = (typeList[seq] || 0) + 1; // Increment type count
                                            return this.prepareComponent(defaultPage._id, seq, typeList[seq], retailerId, distributorId, companyId, _token, user, regionName, details, i, segments);
                                        });

                                        let defaultRess = await Promise.all(defaultBatchPromises);
                                        defaultRess.sort((a, b) => a[2] - b[2]);
                                        defaultRess.forEach(([componentId, components]) => {
                                            if (componentId) {
                                                payload.sequence.push(componentId);
                                                payload.components = { ...payload.components, ...components };
                                            }
                                        });

                                    } else {
                                        throw new Error("Default Page not configured");
                                    }

                                }

                                if(pageType =="home_page") {
                                    if (payload != null) {
                                        payload.components['65fc01c082d219999d4a2c86']?.childrens.map((e) => {
                                            if (e.title == "Prescription") {
                                                    e.asset_url ='https://cms-pagecomposer.s3.ap-south-1.amazonaws.com/assets/1733483272744-Image.jpeg';
                                            }
                                        });
                                        payload.components['6752d46ff113da328887d271'].mobile_asset_url="https://cms-pagecomposer.s3.ap-south-1.amazonaws.com/assets/1733481966416-Group%201000004152%20(1).png";
                                    }
                                }
                                // Cache the result
                                await this.redisClient.put("PAGE", pageKey, payload);

                                return payload;

                            } else {
                                throw new Error("Invalid Sequence, Page not configured properly");
                            }

                        } else {
                            throw new Error("No page configured for page type : " + pageType);
                        }

                    } else {
                        throw new Error("Invalid page, No page found : " + pageType);
                    }

                } catch (_e) {
                    throw _e;
                }

            } else {                                
                throw new Error("Retailer is not belongs to any segment");                
            }

        } else {
            throw new Error("Invalid request");
        }
    };


    prepareComponent = async (_pageId, _componentTypeId, _positionIndex, _retailerId, _distributorId, _companyId, _token, _user, regionName, details, index, _segments) => {

        try {

            let childrens = [],
                _childrens = [],
                configuration = {},
                childConfiguration = {};

            const payload = {};
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            const componetType = await ComponentTypeModel.findById(_componentTypeId).lean();

            const mappingIds = await PageComponentMappingModel.find({ page: _pageId, position: (_componentTypeId + "_" + _positionIndex) }).select('component').lean();
            const extractedIds = mappingIds.map(item => item.component.toString());

            const components = await ComponentModel.find({
                _id: { $in: extractedIds },
                type: _componentTypeId,
                status: true,
                "start_date": { $lte: currentDate },
                "end_date": { $gte: currentDate }
            }).lean();

            if (components.length > 0) {

                /* Loop through the component instances */
                for (let i = 0; i < components.length; i++) {

                    /* Make the parent configuration ready */
                    configuration = components[i].configuration;
                    if (typeof configuration === 'string') {
                        try {
                            configuration = JSON.parse(configuration);
                        } catch (_e) {
                            configuration = {};
                        }
                    }

                    configuration["id"] = components[i]._id;
                    configuration["title"] = components[i].title;
                    configuration["sub_title"] = components[i].sub_title;

                    if ('widget_title' in configuration) {
                        configuration["title"] = configuration["widget_title"];
                    }

                    if (configuration && configuration.sequence) {

                        configuration["childrens"] = [];

                        /* Check for child components */
                        _childrens = await ComponentModel.find({
                            status: true,
                            parent: components[i]._id,
                            "start_date": { $lte: currentDate },
                            "end_date": { $gte: currentDate }
                        }).lean();

                        childrens = _childrens.reduce((acc, child) => {
                            acc[child._id] = child;
                            return acc;
                        }, {});

                        for (let j = 0; j < configuration.sequence.length; j++) {

                            if (!childrens[configuration.sequence[j]]) {
                                /* This means the child component might be disabled or expired */
                                continue;
                            }

                            if (await this.evaluateMappingRules(configuration.sequence[j], _distributorId, _companyId, _segments)) {

                                if (childrens[configuration.sequence[j]].configuration) {

                                    childConfiguration = childrens[configuration.sequence[j]].configuration;

                                    if (typeof childConfiguration === 'string') {
                                        try {
                                            childConfiguration = JSON.parse(childConfiguration);
                                        } catch (_e) {
                                            childConfiguration = {};
                                        }
                                    }

                                    if (componetType.handle == "product_offer") {

                                        let _productRecord = null;
                                        /* This means, it is product_offer_items */
                                        if (childConfiguration["sku"] && childConfiguration["sku"] != "") {
                                            /* Try to fetch the corresponding product record */
                                            _productRecord = await this.provider.getProductForSku(childConfiguration["sku"]);
                                        }

                                        if (!_productRecord) {
                                            _productRecord = await this.provider.prepareProducts(_retailerId, 1);
                                            if (_productRecord && Array.isArray(_productRecord) && _productRecord.length > 0) {
                                                _productRecord = _productRecord[0];
                                            }
                                        }

                                        childConfiguration["data"] = _productRecord;

                                    }

                                    childConfiguration["id"] = childrens[configuration.sequence[j]]._id;
                                    childConfiguration["title"] = childrens[configuration.sequence[j]].title;
                                    childConfiguration["sub_title"] = childrens[configuration.sequence[j]].sub_title;

                                    //payload[ configuration.sequence[j] ] = childConfiguration;
                                    /* Add the child id to parent configuration */
                                    configuration["childrens"].push(childConfiguration);

                                }

                            }
                        }

                        if (this.cdnBaseUrl && (childConfiguration["id"] != "6752da87b723d5b5609feda7")) {
                            /* Prepare the CDN url */
                            configuration = this.prepareAssetCDNUrl(configuration);
                        }

                        if (configuration["childrens"].length > 0) {

                            /* Remove the sequence property */
                            delete configuration["sequence"];
                            /* we have found the component with it's children so return the component */
                            configuration["component_type"] = componetType.handle;
                            payload[components[i]._id] = configuration;
                            return [components[i]._id, payload, index];

                        }

                    } else {

                        /* This means this component doesn't has any parent child */
                        if (await this.evaluateMappingRules(components[i]._id, _distributorId, _companyId, _segments)) {

                            /* Since it is a match - break the loop */
                            configuration["component_type"] = componetType.handle;

                            /* Prepare data - if the widget is top widget */
                            if (componetType.handle == "top_widget") {

                                const count = configuration["items_to_show"] ? configuration["items_to_show"] : 4;

                                if (configuration["type"] == "products") {

                                    if (configuration["context"] == "ordered") {
                                        configuration["data"] = await this.elastic.getOrderedProducts(count, _user, details);
                                    } else if (configuration["context"] == "picked") {
                                        configuration["data"] = await this.elastic.getPickedProducts(count, _distributorId, details);
                                    } else if (configuration["context"] == "trending") {
                                        configuration["data"] = await this.elastic.getTrendingProducts(count, regionName, details);
                                    } else if (configuration["context"] == "company") {
                                        const _companyProducts = await this.provider.fetchStaticCompanyProducts(_user, _companyId, count);
                                        if (_companyProducts) {
                                            configuration["data"] = _companyProducts;
                                        } else {
                                            configuration["data"] = [];
                                        }                                        
                                    } else if (configuration["context"] == "store") {
                                        configuration["data"] = await this.elastic.getDistributorProducts(_token, _distributorId, count);                                        
                                    } else if (configuration["context"] == "indoco") {
                                        configuration["data"] = await this.provider.getIndocoProducts();                                        
                                    } else if (
                                        configuration["context"] == "mankind"
                                        || configuration["context"] == "cipla"
                                        || configuration["context"] == "glenmark"
                                        || configuration["context"] == "sun"
                                        || configuration["context"] == "torrent"
                                        || configuration["context"] == "intas"
                                        || configuration["context"] == "usv"
                                        || configuration["context"] == "abbott") {

                                        const _companyProducts = await this.provider.fetchStaticCompanyProducts(_user, _companyId, count);
                                        if (_companyProducts) {
                                            configuration["data"] = _companyProducts;
                                        } else {
                                            configuration["data"] = [];
                                        }

                                    } else {
                                        configuration["data"] = await this.provider.fetchTopProducts(_retailerId, _distributorId, _companyId, count);
                                    }

                                } else if (configuration["type"] == "brands") {


                                    configuration["data"] = await this.elastic.getBrands(count, regionName);
                                    //configuration["data"] = await this.provider.fetchTopBrands(_retailerId, count);
                                } else if (configuration["type"] == "distributors") {
                                    if (configuration["context"]) {
                                        if (configuration["context"] == "priority") {
                                            configuration["data"] = await this.provider.fetchTopDistributorsPriority(_user, count);
                                        } else {
                                            configuration["data"] = await this.provider.fetchTopDistributorsRandom(_user, count);
                                        }
                                    } else {
                                        configuration["data"] = await this.provider.fetchTopDistributors(_retailerId, count);
                                    }
                                } else if (configuration["type"] == "companies") {
                                    configuration["data"] = await this.provider.getIndocoProducts();
                                }

                            } else if (componetType.handle == "therapy") {

                                const count = configuration["items_to_show"] ? configuration["items_to_show"] : 4;

                                if (_companyId) {
                                    //configuration["data"] = await this.provider.getCompanyTherapies(_companyId, count);
                                    configuration["data"] = await this.provider.getStaticCompanyTherapies(_companyId, count);
                                } else if (_distributorId) {
                                    configuration["data"] = await this.provider.getDistributorTherapies(_distributorId, count);
                                }

                            }

                            if (this.cdnBaseUrl && childConfiguration["id"] != "6752d46ff113da328887d271") {
                                /* Prepare the CDN url */
                                configuration = this.prepareAssetCDNUrl(configuration);
                            }

                            payload[components[i]._id] = configuration;

                            /* return the component */
                            return [components[i]._id, payload, index];

                        }

                    }

                }

            }

            return [null, null, index];

        } catch (_e) {
            throw _e;
        }

    };

    prepareAssetCDNUrl = (_configuration) => {

        _configuration = this.replaceCDNUrl(_configuration);

        if (_configuration["childrens"] && Array.isArray(_configuration["childrens"])) {

            const _items = []
            for (let i = 0; i < _configuration["childrens"].length; i++) {
                _items.push(this.replaceCDNUrl(_configuration["childrens"][i]));
            }

            _configuration["childrens"] = _items;

        }

        return _configuration;

    };

    replaceCDNUrl = (_item) => {

        if (_item["asset_url"]) {
            _item["asset_url"] = _item["asset_url"].replace(this.baseUrlRegex, `https://${this.cdnBaseUrl}/`);
        }

        if (_item["mobile_asset_url"]) {
            _item["mobile_asset_url"] = _item["mobile_asset_url"].replace(this.baseUrlRegex, `https://${this.cdnBaseUrl}/`);
        }

        if (_item["web_asset_url"]) {
            _item["web_asset_url"] = _item["web_asset_url"].replace(this.baseUrlRegex, `https://${this.cdnBaseUrl}/`);
        }

        if (_item["preview_asset_url"]) {
            _item["preview_asset_url"] = _item["preview_asset_url"].replace(this.baseUrlRegex, `https://${this.cdnBaseUrl}/`);
        }

        return _item;

    };

    evaluateMappingRules = async (_componentId, _distributorId, _companyId, _segments) => {

        try {          
            
            const groups = await RulesGroupModel.find({ component: _componentId }).lean();
            const orConditions = await Promise.all(

                groups.map(async (group) => {
                    
                    const rulePromises = group.rules.map((ruleId) => RuleModel.findById(ruleId).lean());
                    const rules = await Promise.all(rulePromises);

                    // Evaluate the rules
                    const andConditions = rules
                    .filter(Boolean)
                    .map((rule) => {

                        if (rule.type == RuleType.RETAILER) {
                            return this.evaluateSegmentRule(rule, _segments);
                        } else if (_distributorId && rule.type == RuleType.DISTRIBUTOR) {
                            return this.evaluateDistributorRule(rule, _distributorId);
                        } else if (_companyId && rule.type == RuleType.COMPANY) {
                            return this.evaluateCompanyRule(rule, _companyId);
                        }
                        return false;
                    });

                    // Return true if all conditions are met for this group
                    return andConditions.length > 0 && andConditions.every(Boolean);

                })

            );

            // Return true if any group conditions are met
            return orConditions.length > 0 && orConditions.some(Boolean);

        } catch (_e) {
            console.log(_e);
            return false;
        }

    };

    evaluateDistributorRule = (_rule, _distributorId) => {

        try {

            const { distributors, condition } = _rule;
    
            // If distributors is a string
            if (typeof distributors === "string") {
                if (distributors == "none") {                    
                    return condition != ConditionType.INCLUDE; // true for EXCLUDE, false for INCLUDE
                } else {                    
                    return condition == ConditionType.INCLUDE; // true for INCLUDE, false for EXCLUDE
                }
            }
    
            // If distributors is an array
            const isMatched = Array.isArray(distributors) && distributors.includes(_distributorId);
            return condition == ConditionType.INCLUDE ? isMatched : !isMatched;

        } catch (error) {
            console.error("Error in evaluateDistributorRule:", error);
            throw error;
        }

    };
    

    evaluateCompanyRule = (_rule, _companyId) => {

        try {

            const { companies, condition } = _rule;

            // If companies is string
            if (typeof companies === "string") {
                if (companies == "none") {                    
                    return condition != ConditionType.INCLUDE; // true for EXCLUDE, false for INCLUDE
                } else {                    
                    return condition == ConditionType.INCLUDE; // true for INCLUDE, false for EXCLUDE
                }
            }
    
            // If companies is an array
            const isMatched = Array.isArray(companies) && companies.includes(_companyId);
            return condition == ConditionType.INCLUDE ? isMatched : !isMatched;
    
        } catch (error) {
            console.error("Error in evaluateCompanyRule:", error);
            throw error;
        }

    };
    

    evaluateSegmentRule = (_rule, _segments) => {

        try {

            const { segments, condition } = _rule;

            // If segments is a string
            if (typeof segments === "string") {
                if (segments == "none") {
                    return condition != ConditionType.INCLUDE; // false for INCLUDE, true for EXCLUDE
                } else {
                    return condition == ConditionType.INCLUDE; // true for INCLUDE, false for EXCLUDE
                }
            }

            // If segments is an array
            if (Array.isArray(_segments) && Array.isArray(segments)) {

                const segmentSet = new Set(segments);
                const hasMatchingSegment = _segments.some((segment) => segmentSet.has(segment));

                return condition == ConditionType.INCLUDE ? hasMatchingSegment : !hasMatchingSegment;
            }

            // Default fallback
            return condition != ConditionType.INCLUDE; // false for INCLUDE, true for EXCLUDE

        } catch (_e) {
            throw _e;
        }

    };

    determineSegments = async (_cmsRetailerId) => {

        try {

            const _segments = await SegmentRetailerModel.find({ retailer: _cmsRetailerId }).select("segment").lean();                       
            return _segments.map(item => item.segment || null).filter(Boolean);
         
        } catch (error) {
            throw new Error('Error fetching user segments: ' + error.message);
        }

    }

    getUrlPathParts = (_url) => {

        const parsedUrl = new URL(_url);
        const pathname = parsedUrl.pathname;
        const parts = pathname.split("/").filter((part) => part !== "");

        if (parts && Array.isArray(parts) && parts.length >= 3) {
            return [parts[0], parts[1], parts[2]];
        }

        return [null, null, null];

    };

}