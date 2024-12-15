import axios from "./opensearchservice.js"
import RedisConnector from "../utils/openSearchredis.js";
import MYDBM from "../utils/mysql.js";
import ApiService from './api.js';
import searchResponseModel from "../models/searchResponseModel.js"
export default class OpensearchApi {

    constructor() {
        this.redisPool = new RedisConnector();
        this.API = new ApiService();
        this.startTime=new Date()
    }

    YourTopPickProducts = async (data, details) => {
        try {
            const filters = data.map((item, index, array) => {
                const data = {
                    productname: item.product_name,
                    storeid: item.storeid,
                    company: item.company,
                };
                const comma = index !== array.length - 1;
                return comma ? { ...data, comma } : { ...data };
            });

            const requestPayload = {
                id: 'ordered_product_search_template_v4',
                params: {
                    specific_filters: filters,
                },
            };
            const result = await axios.axiosCall(requestPayload);
            return await this.searchResponseHandler(result, details.store, details.offer);
        }
        catch (e) {

        }

    };

    getOfferdetails = async (userId) => {

        try {

            this.startTime =new Date();
            let store = [];
            const redisClientReader = await this.redisPool.getReaderConnection();
            let responseReader = await redisClientReader.get(`retailer****${userId}`);
            let responseOfferReader = null;
       
            if (!responseReader) {
                const redisWriteReader = await this.redisPool.getWriterConnection();
                const resionData = await this.RegionwiseStoresForRetailerManagerNew(userId);                
                const mappedActualData = resionData?.map((item) => {
                    return {
                        userId,
                        RetailerId: item.RetailerId,
                        StoreId: item.StoreId,
                        StoreName: item.StoreName,
                        Priority: item.Priority || 'None',
                        regionname: item.regionname,
                        PartyCode: item.PartyCode,
                    };
                });
                await redisWriteReader.set(
                    `retailer****${userId}`,
                    JSON.stringify(mappedActualData),
                    {
                        EX: 60 * 15, //60 * 60 * 1,
                    },
                );
                responseReader = await redisClientReader.get(`retailer****${userId}`);
            }
       
            const storeData = JSON.parse(responseReader) || [];
            let { nonNullPriority, nullPriority } = this.StorePriorityFilter(storeData);
            store = this.updatePriorities(nonNullPriority, nullPriority);
       
            if (!responseOfferReader) {
                
                const redisWriteReader = await this.redisPool.getWriterConnection();
                // Your API endpoint
                const result = await this.API.prepareOfferedProductForElasticAPi(userId)
                {
                    const endTime = new Date();
                    const diffInMillySecod = Math.abs(new Date(this.startTime) - endTime);
                    console.log(diffInMillySecod,567898765);
                }
                await redisWriteReader.set(
                    `offers-${userId}`,
                    JSON.stringify(result),
                    {
                        EX: 60 * 15, //60 * 60 * 1,
                    },
                );

     
                responseOfferReader = await redisClientReader.get(`offers-${userId}`);
            }
           
            return { store, offer: JSON.parse(responseOfferReader) || [] }

        } catch {
            return { store: [], offer: [] }
        }

    }

    StorePriorityFilter(storeData) {
        let nonNullPriority = storeData.filter(
            (item) => item.Priority !== 'None' && item.Priority !== '0',
        );
        let nullPriority = storeData.filter(
            (item) => item.Priority === 'None' || item.Priority === '0',
        );

        nonNullPriority = nonNullPriority.sort(
            (a, b) => parseInt(a.Priority) - parseInt(b.Priority),
        );
        nullPriority = nullPriority.sort((a, b) =>
            a.StoreName.localeCompare(b.StoreName),
        );

        return { nonNullPriority, nullPriority };
    }

    updatePriorities(nonNullPriority, nullPriority) {
        // Step 1: Extract numeric priorities and find the highest priority
        let highestPriority = 0;
        nonNullPriority.forEach((item) => {
            if (!isNaN(parseInt(item.Priority))) {
                highestPriority = Math.max(highestPriority, item.Priority);
            }
        });

        // Step 2: Assign new priorities to stores with 'None'
        let noneIndex = 1; // Start incrementing from highestPriority + 1
        nullPriority.forEach((item) => {
            if (item.Priority === 'None' || item.Priority === '0') {
                item.Priority = (highestPriority + noneIndex).toString();
                noneIndex++;
            }
        });

        return [...nonNullPriority, ...nullPriority].reverse();
    }


    RegionwiseStoresForRetailerManagerNew = async (userId) => {
        try {
            const retailer = await MYDBM.queryWithConditions(`SELECT * FROM RetailerStoreParty  WHERE UserId = ?`, [userId]);
            return retailer;
        }
        catch (e) {
            return [];
        }
    }




    async searchResponseHandler(data, storeData, offers) {
        try {
            const redisClientReader = await this.redisPool.getReaderConnection();
            let mappedData = [];
            const groupCache = {};
            for (let item of data) {
                let responseObj = new searchResponseModel();

                let it = item?._source || JSON.parse(item);
                const store = storeData.find(
                    (obj) => obj.StoreId === parseInt(it.storeid),
                );
                const offer = offers.find(
                    (obj) => obj.mdmProductId === it.mdmproductcode,
                );
                let group = null;

                if (store) {
                    // Check if group data is available in cache
                    const cacheKey = `${store.StoreId}****${store.PartyCode}`;
                    if (groupCache[cacheKey]) {
                        group = groupCache[cacheKey];
                    } else {
                        // Fetch group data if not available in cache
                        group = await redisClientReader.get(`group****${cacheKey}`);
                        if (group?.startsWith('"') && group?.endsWith('"')) {
                            group = group.slice(1, -1);
                        }
                        group = group !== undefined ? group : null;
                        // Cache group data
                        groupCache[cacheKey] = group;
                    }
                }

                if ((!group || group === '') && store) {
                    group = await this.setGroupDataInRedis(group, it, store);
                    const cacheKey = `${store.StoreId}****${store.PartyCode}`;
                    groupCache[cacheKey] = group;
                }
                it = await this.groupWisePTR(group, it);
                const priority = store?.Priority || 'None';
                responseObj.StoreId = parseInt(it.storeid);
                responseObj.StoreName = it.storename;
                responseObj.ProductName = it.productname;
                responseObj.ProductFullName = it.productfullname;
                responseObj.ProductCode = it.productcode;
                responseObj.DisplayProductCode = it.displayproductcode;
                responseObj.Packing = it.unitpack;
                responseObj.MRP = it.mrp ? parseFloat(it.mrp) : 0.0;
                responseObj.PTR = it.ptr ? parseFloat(it.ptr) : 0.0;
                responseObj.Company = it.company;
                responseObj.CompanyCode = it.companycode;
                //responseObj.RShowSchemes = parseInt(it.rshowschemes);
                responseObj.RSchemeToShow = it.rschemetoshow;
                responseObj.Scheme = parseInt(it.rshowschemes) ? it.scheme : '';
                responseObj.SchFrom = it.schfrom;
                responseObj.SchUpto = it.schupto;
                responseObj.Stock = parseInt(it.stock);
                responseObj.StockFlag = parseInt(it.stockflag);
                responseObj.ProductLock = Boolean(it.productlock);
                responseObj.HiddenPTR = it?.hiddenptr ? parseFloat(it.hiddenptr) : 0.0;
                responseObj.ShowPTR = Boolean(it.showptr);
                responseObj.RShowPtr = parseInt(it.rshowptr);
                responseObj.RShowPtrForAllCompanies = parseInt(
                    it.rshowptrforallcompanies,
                );
                responseObj.AllowMinQty = it.allowminqty;
                responseObj.AllowMaxQty = it.allowmaxqty;
                responseObj.StepUpValue = it.stepupvalue;
                responseObj.AllowMOQ = Boolean(parseInt(it.allowmoq));
                responseObj.RetailerSchemePreference = it.retailerschemepreference;
                responseObj.RetailerSchemePriority = it.retailerschemepriority;
                responseObj.RegExProductName = it.prregexproductname;
                responseObj.DisplayHalfScheme = Boolean(it.displayhalfscheme);
                responseObj.DisplayHalfSchemeOn = it.displayhalfschemeon;
                responseObj.RoundOffDisplayHalfScheme = it.roundoffdisplayhalfscheme;
                responseObj.RStockVisibility = it.rstockvisibility;
                responseObj.IsMapped = store ? 1 : 0;
                responseObj.StorePriority = priority.toString();
                responseObj.NonMapPartyCode = 'NA';
                responseObj.IsShowNonMappedOrderStock = it.isshownonmappedorderstock;
                responseObj.OrderRemarks = it.orderremarks;
                responseObj.OrderDeliveryModeStatus = it.orderdeliverymodestatus;
                responseObj.HalfSchemeValueToRetailer = it.halfschemevaluetoretailer;
                responseObj.IsPartyLocked =
                    it.dproductlock.toLowerCase() === 'yes' ? 1 : 0;
                responseObj.RewardSchemeId = 'NA';
                responseObj.NetRate = it.netrate ? parseFloat(it.netrate) : 0.0;
                responseObj.PrProductName = it.prproductname;
                responseObj.PrProductId = it.prproductid;
                responseObj.PrRegexProductName = it.prregexproductname;
                responseObj.DiscountPercentScheme = it.discountpercentscheme;
                responseObj.Margin = 0.0;
                responseObj.CashbackMessage = offer ? offer.offerText : '';

                responseObj.CashbackTermsAndConditions =
                    offer && offer?.tcText ? offer.tcText : '';
                responseObj.CashbackFromDate = it.cashbackfromdate;
                responseObj.CashbackEndDate = it.cashbackenddate;
                responseObj.MaxCashback = it.maxcashback;
                responseObj.StoreProductGST = it.storeproductgst
                    ? parseFloat(it.storeproductgst)
                    : 0.0;
                responseObj.AvailableStoreCount = 'NA';
                responseObj.RateValidity = 'NA';
                responseObj.CompanyId = it.companyid;
                responseObj.CompanyName = it.companyname;
                responseObj.ExpiryDate = it.expirydate;
                responseObj.MobileNumber = it.mobilenumber;
                responseObj.BrandName = it.brandname;
                responseObj.motherBrandCode = it.motherbrandcode;
                responseObj.MotherBrandName = it.motherbrandname;
                responseObj.ManufactureName = it.manufacturename;
                responseObj.DrugCategoryName = it.drugcategoryname;
                responseObj.SuperGroupName = it.supergroupname;
                responseObj.SubGroupName = it.subgroupname;
                responseObj.SubGroupShortCode = it.subgroupshortcode;
                responseObj.DrugtypeName = it.drugtypename;
                responseObj.ClassName = it.classname;
                responseObj.BrandCode = it.brandcode;
                responseObj.UniformProductCode = it.uniformproductcode;
                responseObj.TherapyName = it.therapyname;
                responseObj.IsGroupWisePTR = it.isgroupwiseptr
                    ? parseInt(it.isgroupwiseptr)
                    : 0;
                responseObj.IsGroupWisePTRRetailer = it.isgroupwiseptrretailer
                    ? parseInt(it.isgroupwiseptrretailer)
                    : 0;
                responseObj.CasePacking = it.casepacking;
                responseObj.BoxPacking = it.boxpacking;
                responseObj.DProductLock = it.dproductlock;
                responseObj.StockVisibility = it.stockvisibility;
                responseObj.MDMProductCode = it.mdmproductcode;
                responseObj.StoreStatus = it.storestatus;
                responseObj.SuggestedQuantity = it.suggestedquantity;
                responseObj.SchemeDetails =
                    it.schemedetails && it.schemedetails !== null
                        ? JSON.parse(it.schemedetails)
                        : [];
                responseObj.DoNotShowToRetailer = it.donotshowtoretailer;
                responseObj.RegionName = it.regionname;
                responseObj.IsHidden = it.ishidden;
                responseObj.ptrGroup = group;
                responseObj.PTRA = it.ptra;
                responseObj.PTRB = it.ptrb;
                responseObj.PTRC = it.ptrc;
                responseObj.PTRD = it.ptrd;
                responseObj.Margin = it?.margin ? parseFloat(it.margin) : 0;
                mappedData.push(responseObj);
            }
            return mappedData;
        } catch (error) {
            console.warn(error);
            return [];
        }
    }


    groupWisePTR(group, it) {
        try {
            if (
                parseInt(it.isgroupwiseptr) === 0 ||
                parseInt(it.isgroupwiseptrretailer) === 0
            ) {
                return it;
            }
            switch (group) {
                case 'A': {
                    it.hiddenPTR = it.ptr;
                    it.ptr = it.ptra > 0 ? it.ptra : it.ptr;
                    return it;
                }
                case 'B': {
                    it.hiddenPTR = it.ptr;
                    it.ptr = it.ptrb > 0 ? it.ptrb : it.ptr;
                    return it;
                }
                case 'C': {
                    it.hiddenPTR = it.ptr;
                    it.ptr = it.ptrc > 0 ? it.ptrc : it.ptr;
                    return it;
                }
                case 'D': {
                    it.hiddenPTR = it.ptr;
                    it.ptr = it.ptrd > 0 ? it.ptrd : it.ptr;
                    return it;
                }
                default: {
                    return it;
                }
            }
        } catch (error) {
            return error;
        }
    }


    async setGroupDataInRedis(group, it, store) {
        try {
            if (store) {
                const groupResult = await this.storeMappedStoreGroup(
                    store.StoreId,
                    store.PartyCode,
                );
                const redisWriteReader = await this.redisPool.getWriterConnection();
                await redisWriteReader.set(
                    `group****${store.StoreId}****${store.PartyCode}`,
                    `${groupResult}`,
                    {
                        EX: 60 * 60 * 4, //60 * 60 * 1,
                    },
                );
                const redisClientReader = await this.redisPool.getReaderConnection();
                group = await redisClientReader.get(
                    `group****${store.StoreId}****${store.PartyCode}`,
                );
                //it = await this.groupWisePTR(group, it);
                return group;
            }
            return group;
        } catch (error) {
            return it;
        }
    }

    async storeMappedStoreGroup(storeId, PartyCode) {
        try {
            const results = await MYDBM.queryWithConditions('SELECT `Group` FROM storeparties  where StoreId = ? AND PartyCode = ?', [storeId, PartyCode]);
            return results.length ? results[0].Group : null;
        }
        catch (e) {
            return [];
        }
    }
}