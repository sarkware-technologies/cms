import { promises as fs } from 'fs';
import path from 'path';

import EM from "../utils/entity.js";
import MYDBM from "../utils/mysql.js";
import cache from "../utils/cache.js"

import SegmentModel from "../models/segment.js";
import UserSegmentModel from "../models/user-segment.js";
import OfferModel from "../models/offer.js";

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class ApiService {

    constructor() {
        this.companyPath = path.join(__dirname, '..', 'bucket', 'companies.json');
        this.productPath = path.join(__dirname, '..', 'bucket', 'products.json');
        this.therapyPath = path.join(__dirname, '..', 'bucket', 'therapies.json');
        this.companiesData = null;
        this.productsData = null;
        this.therapyData = null;
    }

    companyQuery = async () => {

        try {

            const data = await fs.readFile(this.companyPath, 'utf8');   
            const companies = JSON.parse(data);

            const dd = [];

            for (let i = 0; i < companies.length; i++) {
                //console.log(`select * from companies where CompanyCode='${companies[i].company_code}'`);
                //dd.push(await MYDBM.queryWithConditions(`select * from companies where CompanyCode='${companies[i].company_code}'`, []));
            }

            return await MYDBM.queryWithConditions(`select * from companies`, []);

        } catch (e) {
            console.log(e);
        }

    };

    dataQuery = async () => {

        try {

            if (!this.productsData) {
                const data = await fs.readFile(this.productPath, 'utf8');   
                this.productsData = JSON.parse(data);
            }

            let p = [];
            let pp = [];
            const result = {};
           
            const keys = Object.keys(this.productsData);

            for (let i = 0; i < keys.length; i++) {

                p = [];
                const products = this.productsData[keys[i]];

                //for (let j = 0; j < products.length; j++) {  console.log("Fetch ing detauls for product : "+ products[j].ProductName);
                    //const reco = await MYDBM.queryWithConditions(`select mgpm.PRODUCT_NAME as ProductName, mgpm.PTR, mgpm.MRP, mgpm.MDM_PRODUCT_CODE as MDMProductCode, pmpl.PRODUCT_CODE as ProductCode from mdm_golden_product_master mgpm left join prproduct_mdm_product_linkage pmpl on pmpl.MDM_PRODUCT_CODE = mgpm.MDM_PRODUCT_CODE WHERE mgpm.MDM_PRODUCT_CODE='${products[j]["MDMProductCode"]}';`);
                    //p.push(reco[0]);
               // } 

                pp = [];
                for (let j = 0; j < products.length; j++) {

                    if (!products[j]) {
                        continue;
                    }

                    const rr = {
                        ProductName: products[j].ProductName,
                        PTR: products[j].PTR,
                        MRP: products[j].MRP,
                        MDMProductCode: products[j].MDMProductCode,
                        ProductCode: products[j].ProductCode,
                        CompanyId: "",
                        CompanyName: "",
                        CashbackMessage: "",
                        CashbackTermsAndConditions: ""
                    }

                    const cRecord = await this.getCompanyRecord(keys[i]); console.log(cRecord);
                    if (cRecord) {
                        rr["CompanyId"] = cRecord.company_id;
                        rr["CompanyName"] = cRecord.company_name;
                    }

                    pp.push(rr);
                }

                result[keys[i]] = pp;

            }                             

            return result;            

        } catch (e) {
            throw e;
        }

    };

    getCompanyRecord = async (_code) => {

        try {
            if (!this.companiesData) {
                const data = await fs.readFile(this.companyPath, 'utf8');   
                this.companiesData = JSON.parse(data);
            }

            for (let i = 0; i < this.companiesData.length; i++) {
                if (this.companiesData[i].company_code == _code) {
                    return this.companiesData[i];
                }
            }

            return null;

        } catch (err) {            
            throw err;
        }

    };

    getCompanies = async () => {
        
        try {
            if (!this.companiesData) {
                const data = await fs.readFile(this.companyPath, 'utf8');   
                this.companiesData = JSON.parse(data);
            }
            return this.companiesData;
        } catch (err) {            
            throw err;
        }

    };

    fetchStaticCompanyProducts = async (_user, _companyId, _count = 0) => {

        try {
            
            if (!this.productsData) {
                const data = await fs.readFile(this.productPath, 'utf8');   
                this.productsData = JSON.parse(data);
            }

            if (this.productsData[_companyId]) {                

                const products = this.productsData[_companyId];
                const offers = await this.prepareOfferedProductForElasticAPi(_user);

                for (let i = 0; i < products.length; i++) {
                    products[i]["CashbackMessage"] = "";
                    for (let j = 0; j < offers.length; j++) {
                        if (offers[j].mdmProductId == products[i].MDMProductCode) {
                            products[i]["CashbackMessage"] = offers[j].offerText;
                            products[i]["CashbackTermsAndConditions"] = offers[j].tcText;
                        }
                    }
                }


                if (_count == 0) {
                    return products;
                } else {
                    if (_count < products.length) {
                        return products.slice(0, _count);
                    } else {
                        return products;
                    }
                }
            }

            return [];
            
        } catch (err) {            
            throw err;
        }

    };

    getStaticCompanyTherapies = async (_companyId, _count = 0) => {

        try {
            
            if (!this.therapyData) {
                const data = await fs.readFile(this.therapyPath, 'utf8');   
                this.therapyData = JSON.parse(data);
            }

            if (this.therapyData[_companyId]) {

                if (_count == 0) {
                    return this.therapyData[_companyId];
                } else {
                    if (_count < this.therapyData[_companyId].length) {
                        return this.therapyData[_companyId].slice(0, _count);
                    } else {
                        return this.therapyData[_companyId];
                    }
                }
                
            }

            return [];

        } catch (err) {            
            throw err;
        }

    }

    getCompanyTherapies = async (_companyId, _count) => {

        try {

            return await MYDBM.queryWithConditions(`SELECT mgpm.THERAPY_NAME 
            FROM mdm_golden_product_master mgpm
            JOIN mdm_store_product_master msp ON msp.MDM_PRODUCT_CODE=mgpm.MDM_PRODUCT_CODE
            join companies c on c.CompanyCode = msp.COMPANY_CODE 
            WHERE c.CompanyId=? Limit 0,${_count}`,
            [_companyId]);  

        } catch (e) {
            return [];
        }
        
    };    

    getDistributorTherapies = async (_distributorId, _count) => { 

        try {

            return await MYDBM.queryWithConditions(`SELECT mgpm.THERAPY_NAME 
            FROM mdm_golden_product_master  mgpm
            JOIN mdm_store_product_master   msp   ON msp.MDM_PRODUCT_CODE=mgpm.MDM_PRODUCT_CODE
            WHERE msp.Storeid=? Limit 0,${_count}`,
            [_distributorId]);  

        } catch (e) {
            return [];
        }
        
    };

    getProductForSku = async (_sku) => {

        try {
            const productModel = await EM.getModel("product");
            return await productModel.findOne({MDM_PRODUCT_CODE: _sku}).lean();
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }

    };

    fetchTopOfferedProducts = async (_req, _user) => {

        try {

            let retailerId = null;     
            
            const retailer = await MYDBM.queryWithConditions(`select * from retailers r inner join retailermanagers r2 on r2.RetailerId = r.RetailerId where r2.UserId=?`, [_user]);               

            if (retailer && Array.isArray(retailer) && retailer.length > 0) {
                retailerId = retailer[0].RetailerId;
            }

            if (retailerId && _req.query.companyId) {
                const rawQuery = `SELECT r.retailerid, rsp.StoreId, sp.ProductCode, sp.MRP, sp.PTR, sp.ProductName, sp.VATPercentage, GROUP_CONCAT(ss.Scheme SEPARATOR '') AS scheme, sts.TotalStock, s.StoreName, c.CompanyId, c.CompanyName, sd.CashbackType, sd.cashbackValue, sd.MinQty, sd.MaxQty FROM retailers r LEFT JOIN retailerstoreparties rsp ON r.retailerid = rsp.retailerid LEFT JOIN storeproducts sp ON sp.StoreId = rsp.StoreId LEFT JOIN storeschemes ss ON sp.StoreId = ss.StoreId AND sp.productCode = ss.productcode LEFT JOIN storestocks sts ON sts.StoreId = sp.StoreId AND sts.ProductCode = sp.ProductCode LEFT JOIN stores s ON s.storeid = sp.storeid LEFT JOIN companies c ON c.CompanyId = s.CompanyId LEFT JOIN productstoreproducts psp ON psp.StoreId = rsp.StoreId AND psp.productCode = sp.ProductCode LEFT JOIN schemeproducts scp ON scp.ProductId = psp.ProductId LEFT JOIN schemedetails sd ON sd.SchemeId = scp.SchemeId WHERE r.RetailerId = ${retailerId} AND c.CompanyId = ${_req.query.companyId} GROUP BY r.retailerid, rsp.StoreId, sp.ProductCode, sp.MRP, sp.PTR, sp.ProductName, sp.VATPercentage, sts.TotalStock, s.StoreName, c.CompanyId, c.CompanyName, sd.CashbackType, sd.cashbackValue, sd.MinQty, sd.MaxQty Limit 0,100;`;
                let oProducts = await MYDBM.queryWithConditions(rawQuery, []);

                if (oProducts && oProducts.length > 0) {
                    return oProducts;
                } else {
                    return await this.fetchTopProducts(retailerId, null, _req.query.companyId, 100);
                }

            }

            if (retailerId) {
                const rawQuery = `SELECT r.retailerid, rsp.StoreId, sp.ProductCode, sp.MRP, sp.PTR, sp.ProductName, sp.VATPercentage, GROUP_CONCAT(ss.Scheme SEPARATOR '') AS scheme, sts.TotalStock, s.StoreName, c.CompanyId, c.CompanyName, sd.CashbackType, sd.cashbackValue, sd.MinQty, sd.MaxQty FROM retailers r LEFT JOIN retailerstoreparties rsp ON r.retailerid = rsp.retailerid LEFT JOIN storeproducts sp ON sp.StoreId = rsp.StoreId LEFT JOIN storeschemes ss ON sp.StoreId = ss.StoreId AND sp.productCode = ss.productcode LEFT JOIN storestocks sts ON sts.StoreId = sp.StoreId AND sts.ProductCode = sp.ProductCode LEFT JOIN stores s ON s.storeid = sp.storeid LEFT JOIN companies c ON c.CompanyId = s.CompanyId LEFT JOIN productstoreproducts psp ON psp.StoreId = rsp.StoreId AND psp.productCode = sp.ProductCode LEFT JOIN schemeproducts scp ON scp.ProductId = psp.ProductId LEFT JOIN schemedetails sd ON sd.SchemeId = scp.SchemeId WHERE r.RetailerId = ${retailerId} GROUP BY r.retailerid, rsp.StoreId, sp.ProductCode, sp.MRP, sp.PTR, sp.ProductName, sp.VATPercentage, sts.TotalStock, s.StoreName, c.CompanyId, c.CompanyName, sd.CashbackType, sd.cashbackValue, sd.MinQty, sd.MaxQty Limit 0,100;`;
                return await MYDBM.queryWithConditions(rawQuery, []);
            }

            throw new Error("Retailer Id is missing");

        } catch (e) {
            throw e;
        }
        
    };

    fetchTopPicks = async (_req) => {                        
        
        let rid = _req.query.rid;

        try {

            if (rid && _req.query.storeId) {            
                return await this.fetchTopProducts(rid, _req.query.storeId, null, 100);
            }
    
            if (rid && _req.query.companyId) {
                return await this.fetchTopProducts(rid, null, _req.query.companyId, 100);
            }
    
            if (rid) {
                return await this.fetchTopProducts(rid, null, null, 100);
            }
            
            throw new Error ("Retailer Id is missing");

        } catch (e) {
            throw e;
        }

    };   

    fetchTopProducts = async (_rid, _storeId, _companyId, _count) => {

        const randomProducts = [];

        try {

            //const products = await MYDBM.queryWithConditions("SELECT SPM.*, csc.*, mgpm.MRP FROM mdm_store_product_master SPM inner join retailerstoreparties r on r.RetailerId=? INNER JOIN mdm_golden_product_master mgpm ON SPM.MDM_PRODUCT_CODE = mgpm.MDM_PRODUCT_CODE INNER JOIN companystorecompanies csc ON csc.StoreCompanyCode = SPM.COMPANY_CODE WHERE SPM.PTR != 0 and SPM.STOREID = r.StoreId LIMIT 0, 100", [_rid]);

            let _products = [];

            if (_storeId) {

                /* Products for distributor page */

                _products = await MYDBM.queryWithConditions(`select distinct spt.StoreProductId as ProductId ,spt.ProductCode ,spt.RegExProductName ,spt.MRP  ,spt.PTR ,spt.ProductName ,c.CompanyId ,c.CompanyName,
                    s.StoreId ,s.StoreName ,ss.Scheme ,ssk.BoxQuantity as qty,ssk.TotalStock as Stock
                    from schemeproducts sp
                    left join productstoreproducts psp on psp.ProductId = sp.ProductId
                    left join storeproducts spt on spt.StoreId = psp.StoreId
                    left join retailerstoreparties rt on rt.StoreId  = spt.StoreId
                    left join stores s on s.StoreId = rt.StoreId  
                    left join storeschemes ss on ss.StoreId  = s.StoreId
                    left join schemedetails sd on sd.SchemeId = sp.SchemeId  
                    left join companies c on c.CompanyId  = s.CompanyId
                    left join storestocks ssk on ssk.StoreId  = s.StoreId
                    left join schemes scm on scm.SchemeId = sd.SchemeId
                    where ssk.TotalStock  >= 50 and spt.MRP != 0 and spt.PTR !=0 and ssk.ProductCode = spt.ProductCode and ss.ProductCode = spt.ProductCode and rt.RetailerId=? and s.StoreId=? Limit 0,400`, 
                [_rid, _storeId]);

            } else if (_companyId) {

                /* Products for company page */

                _products = await MYDBM.queryWithConditions(`select distinct c.CompanyId ,c.CompanyName ,p.ProductId ,p.Name as ProductName,p.PTR ,p.MRP from retailerstoreparties rsp
                    left join companystorecompanies csc on csc.StoreId = rsp.StoreId  
                    left join companies c on c.CompanyId  = csc.CompanyId
                    left join productstoreproducts ps on ps.StoreId  = csc.StoreId
                    left join products p on p.ProductId  = ps.ProductId
                    where rsp.RetailerId=? and c.CompanyId=? Limit 0,400`,
                [_rid, _companyId]);  
                
                

            } else {

                /* Products for retailer page */

                //_products = await MYDBM.queryWithConditions("SELECT * FROM storeproducts sp LEFT JOIN retailerstoreparties rsp ON rsp.Storeid=sp.storeid WHERE rsp.RetailerId=? LIMIT 0, 100", [_rid]);

                _products = await MYDBM.queryWithConditions(`select distinct spt.StoreProductId as ProductId ,spt.ProductCode ,spt.RegExProductName ,spt.MRP  ,spt.PTR ,spt.ProductName ,c.CompanyId ,c.CompanyName,
                    s.StoreId ,s.StoreName ,ss.Scheme ,ssk.BoxQuantity as qty,ssk.TotalStock as Stock
                    from schemeproducts sp
                    left join productstoreproducts psp on psp.ProductId = sp.ProductId
                    left join storeproducts spt on spt.StoreId = psp.StoreId
                    left join retailerstoreparties rt on rt.StoreId  = spt.StoreId
                    left join stores s on s.StoreId = rt.StoreId  
                    left join storeschemes ss on ss.StoreId  = s.StoreId
                    left join schemedetails sd on sd.SchemeId = sp.SchemeId  
                    left join companies c on c.CompanyId  = s.CompanyId
                    left join storestocks ssk on ssk.StoreId  = s.StoreId
                    left join schemes scm on scm.SchemeId = sd.SchemeId
                    where ssk.TotalStock  >= 50 and spt.MRP != 0 and spt.PTR !=0 and ssk.ProductCode = spt.ProductCode and ss.ProductCode = spt.ProductCode and rt.RetailerId=? Limit 0,400`, 
                [_rid]);

            }
                
            const productLength = (_products.length > _count) ? _count : _products.length;

            for (let i = 0; i < productLength; i++) {
                randomProducts.push(_products[Math.floor(Math.random() * productLength)]);
            }

            return randomProducts;
            
        } catch (_e) {
            throw _e;
        }

    };

    fetchTopDistributorsPriority = async (_user, _count = 100) => {

        try {
            return await MYDBM.queryWithConditions(
                `SELECT 
                    se.Priority, s.StoreId, s.StoreName, s.StoreCode, sd.Address1, sd.Address2, sd.City, stc.doNotShowToRetailer,st.Statename
                FROM
                    RetailerManagers AS rm
                    INNER JOIN retailers AS r ON r.RetailerId = rm.RetailerId
                    INNER JOIN RetailerStoreParties rs ON r.RetailerId = rs.RetailerId
                    LEFT JOIN StoreParties AS sp ON rs.StoreId = sp.StoreId AND rs.PartyCode = sp.PartyCode 
                    INNER JOIN Stores s ON s.StoreId = rs.StoreId
                    INNER JOIN storeconfigs AS stc ON stc.StoreId = s.StoreId AND stc.doNotShowToRetailer =0
                    LEFT JOIN setdistributorpriorities se ON s.StoreId = se.StoreId AND r.RetailerId = se.RetailerId
                    LEFT JOIN storeaddresses sd ON sd.StoreId = s.StoreId
                    LEFT JOIN states st on st.StateId = sd.StateId
                WHERE
                    rm.UserId =${_user}
                    AND s.StoreId != COALESCE(s.GroupStoreId, 0) 
                GROUP BY
                    se.Priority, s.StoreId, s.StoreName, s.StoreCode, sd.Address1, sd.Address2, sd.City, stc.doNotShowToRetailer,st.Statename
                ORDER BY se.Priority
                    LIMIT ${_count}`);

        } catch (_e) {
            return [];
        }

    };

    fetchTopDistributorsRandom = async (_user, _count = 100) => {
        // now one more condition matched in this query
        try {
            const randomDistributors = [];
            const distributors = await MYDBM.queryWithConditions(
                `SELECT 
                    se.Priority, s.StoreId, s.StoreName, s.StoreCode, sd.Address1, sd.Address2, sd.City, stc.doNotShowToRetailer,st.Statename
                FROM
                    RetailerManagers AS rm
                    INNER JOIN retailers AS r ON r.RetailerId = rm.RetailerId
                    INNER JOIN RetailerStoreParties rs ON r.RetailerId = rs.RetailerId
                    LEFT JOIN StoreParties AS sp ON rs.StoreId = sp.StoreId AND rs.PartyCode = sp.PartyCode 
                    INNER JOIN Stores s ON s.StoreId = rs.StoreId
                    INNER JOIN storeconfigs AS stc ON stc.StoreId = s.StoreId AND stc.doNotShowToRetailer =0
                    LEFT JOIN setdistributorpriorities se ON s.StoreId = se.StoreId AND r.RetailerId = se.RetailerId
                    LEFT JOIN storeaddresses sd ON sd.StoreId = s.StoreId
                    LEFT JOIN states st on st.StateId = sd.StateId
                WHERE
                    rm.UserId =${_user}
                    AND s.StoreId != COALESCE(s.GroupStoreId, 0) 
                GROUP BY
                    se.Priority, s.StoreId, s.StoreName, s.StoreCode, sd.Address1, sd.Address2, sd.City, stc.doNotShowToRetailer,st.Statename
                    LIMIT ${_count}`);
            if (distributors) {
                const distriLength = (distributors.length > _count) ? _count : distributors.length;
                for (let i = 0; i < distriLength; i++) {
                    randomDistributors.push(distributors[Math.floor(Math.random() * distriLength)]);
                }
            }
            return randomDistributors;

        } catch (_e) {
            return [];
        }

    };

    fetchTopDistributors = async (_rid, _count) => {

        try {

            const randomDistributors = [];
            const retailer = await MYDBM.queryWithConditions(`select * from retailers where RetailerId=?`, [_rid]);                

            if (retailer && Array.isArray(retailer) && retailer.length > 0) {

                const distributors = await MYDBM.queryWithConditions(`CALL PR_ORM_DisplayStoresForRegionPincode(?,?)`, [retailer[0].RetailerId, retailer[0].Pincode]);
                if (distributors) {                
                    const distriLength = (distributors.length > _count) ? _count : distributors.length;
                    const sortedDistributors = distributors.sort((a, b) => a.Priority - b.Priority);    
                    for (let i = 0; i < distriLength; i++) {                 
                        randomDistributors.push(sortedDistributors[i]);
                    }    
                }

            }            

            return randomDistributors;

        } catch (_e) {
            return [];
        }

    };

    fetchTopBrands = async (_rid, _count) => {

        try {
            const randomBrands = [];
            const brands = await MYDBM.queryWithConditions("SELECT distinct  c.* FROM companies c limit 0,100", []);

            if (brands) {

                const brandsLength = (brands.length > _count) ? _count : brands.length;

                for (let i = 0; i < brandsLength; i++) {
                    randomBrands.push(brands[Math.floor(Math.random() * brandsLength)]);
                }

            }

            return randomBrands;
        } catch (_e) {
            throw _e;
        }

    };

    fetchCompanyProductsOld = async (_cid, _user, _count=100) => {      

        try {            

            let _products = [];

            if (_cid) {
                _products = await MYDBM.queryWithConditions(`select 
                sp.StoreProductId as ProductId,
                sp.ProductCode ,
                sp.RegExProductName,
                sp.RegExProductName,
                sp.MRP,
                sp.PTR,
                sp.ProductName,
                sp.StoreId 
                FROM storeproducts sp
                LEFT JOIN  companies  c ON c.CompanyCode =sp.CompanyCode
                WHERE c.CompanyId=? Limit 0,${_count}`,
                [_cid]);
            }

            const offers = await this.prepareOfferedProductForElasticAPi(_user);

            for (let i = 0; i < _products.length; i++) {
                _products[i]["CashbackMessage"] = "";
                for (let j = 0; j < offers.length; j++) {
                    if (offers[j].productId == _products[i].ProductId) {
                        _products[i]["CashbackMessage"] = offers[j].offerText;
                    }
                }
            }

            return _products;
            

        } catch (_e) {
            console.log(_e);
        }

        return [];

    };

    fetchDistributorProducts = async (_sid, _user, _count=100) => {

        try {

            let _products = [];            

            _products = await MYDBM.queryWithConditions(`select 
            sp.StoreProductId as ProductId,
            sp.ProductCode,
            sp.RegExProductName,
            sp.ProductName,
            sp.MRP,
            sp.PTR,
            sp.ProductName,
            sp.StoreId,
            sp.Company as CompanyName,
            sp.CompanyCode,
            c.CompanyId 
            FROM storeproducts sp
            left join companies c on c.CompanyName = sp.Company  
            WHERE sp.StoreId=? Limit 0,${_count}`, 
            [_sid]);            

            return _products;

        } catch (_e) {
            console.log(_e);
        }

        return []; 

    };  
    
    prepareCashBackProductForRetailer = async(_userId) => {

        const offer = [];
        const retailer = await MYDBM.queryWithConditions(`select * from retailers r inner join retailermanagers r2 on r2.RetailerId = r.RetailerId where r2.UserId=?`, [_userId]);

        if (retailer && retailer.length > 0) {            
                        
            let segments = await this.determineSegments(_userId);
            const allOffers = await OfferModel.find({}).lean();

            if (segments.length === 0) {
                segments.push("all");
            }
            segments = segments.map(item => item.trim());

            if (allOffers && Array.isArray(allOffers)) {

                if (allOffers.length == 0) {
                    return [];
                }

                for (let i = 0; i < allOffers.length; i++) {

                    let isEligible = false;
                    const offerSegments = allOffers[i].SegmentName.split(","); 

                    if (allOffers[i].Audience.trim().toLowerCase() === "all") {
                        /* This means this offers is applicable for all users */
                        isEligible = true;
                    } else {

                        if (Array.isArray(offerSegments)) {

                            const  offerItemSegments = offerSegments.map(item => item.trim());
                            const mappedSegments = segments.filter(value => offerItemSegments.includes(value));

                            if (Array.isArray(mappedSegments) && mappedSegments.length > 0) {
                                isEligible = true;
                            }

                        }

                    }

                    if (isEligible) {
                        offer.push({
                            ProductName: allOffers[i].ProductName,
                            PTR: allOffers[i].PTR,
                            MRP: allOffers[i].MRP,
                            MDMProductCode: allOffers[i].MDMProductCode,
                            ProductCode: allOffers[i].ProductCode,
                            CompanyId: allOffers[i].CompanyId,
                            CompanyName: allOffers[i].CompanyName,
                            CashbackMessage: allOffers[i].CashbackMessage,
                            CashbackTermsAndConditions: allOffers[i].CashbackTermsAndConditions
                        });
                    }

                }
            }           

        }

        return offer;

    };

    prepareOfferedProductForElasticAPi = async(_userId) => {  
        //console.log("prepareOfferedProductForElasticAPi is called : "+ _userId);

        const offer = [];
        // const retailer = await MYDBM.queryWithConditions(`select * from retailers r inner join retailermanagers r2 on r2.RetailerId = r.RetailerId where r2.UserId=?`, [_userId]);

        // if (retailer && retailer.length > 0) {            
            
            let segments = await this.determineSegments(_userId);
            const allOffers = await OfferModel.find({}).lean();            

            if (segments.length === 0) {
                segments.push("all");
            }
            segments = segments.map(item => item.trim());

            if (allOffers && Array.isArray(allOffers)) {

                if (allOffers.length == 0) {
                    return [];
                }

                for (let i = 0; i < allOffers.length; i++) {

                    let isEligible = false;
                    const offerSegments = allOffers[i].SegmentName.split(","); 

                    if (allOffers[i].Audience.trim().toLowerCase() === "all") {
                        /* This means this offers is applicable for all users */
                        isEligible = true;
                    } else {

                        if (Array.isArray(offerSegments)) {

                            const  offerItemSegments = offerSegments.map(item => item.trim());
                            const mappedSegments = segments.filter(value => offerItemSegments.includes(value));

                            if (Array.isArray(mappedSegments) && mappedSegments.length > 0) {
                                isEligible = true;
                            }

                        }

                    }

                    if (isEligible) {
                        offer.push({
                            productId: allOffers[i].ProductId,
                            mdmProductId: allOffers[i].MDMProductCode,
                            offerText: allOffers[i].CashbackMessage,
                            tcText: allOffers[i].CashbackTermsAndConditions
                        });
                    }

                }
            }

        // }

        return offer;

    };

    getIndocoProducts = async () => {
            
        return [
            {
                "ProductName": "CYCLOPAM 20/500 MG TABLET 10",
                "PTR": 43.14,
                "MRP": 60.4,
                "MDMProductCode": "MPC10161968",
                "ProductCode": "",
                "CompanyId": 0,
                "CompanyName": "INDOCO REMEDIES LTD",
                "CashbackMessage": "",
                "CashbackTermsAndConditions": ""
            },
            {
                "ProductName": "CYCLOPAM 10/40MG SUSPENSION 60 ML",
                "PTR": 70.71,
                "MRP": 99,
                "MDMProductCode": "MPC10126353",
                "ProductCode": "",
                "CompanyId": 0,
                "CompanyName": "INDOCO REMEDIES LTD",
                "CashbackMessage": "",
                "CashbackTermsAndConditions": ""
            },
            {
                "ProductName": "CYCLOPAM 10/40 MG SUSPENSION 30 ML",
                "PTR": 47.07,
                "MRP": 65.9,
                "MDMProductCode": "MPC10014228",
                "ProductCode": "",
                "CompanyId": 0,
                "CompanyName": "INDOCO REMEDIES LTD",
                "CashbackMessage": "",
                "CashbackTermsAndConditions": ""
            }
        ]
        
    }

    fetchMankindProducts = async (_user, _count=100) => {
        
        try {
            
            return [
                {
                    "StoreId": 365,
                    "StoreName": "Patel Pharma, PCMC",
                    "ProductName": "METHARGO TAB",
                    "ProductFullName": "METHARGO TAB",
                    "ProductCode": "1538",
                    "DisplayProductCode": "1538",
                    "Packing": null,
                    "MRP": 8.8,
                    "PTR": 0.57,
                    "Company": "Mankind",
                    "CompanyCode": null,
                    "Scheme": null,
                    "Stock": 10000,
                    "ProductLock": false,
                    "HiddenPTR": 0.57,
                    "ShowPTR": true,
                    "RShowPtr": 1,
                    "RShowPtrForAllCompanies": 1,
                    "AllowMinQty": 0,
                    "AllowMaxQty": 0,
                    "StepUpValue": 0,
                    "AllowMOQ": true,
                    "RetailerSchemePreference": 1,
                    "RetailerSchemePriority": 1,
                    "RegExProductName": null,
                    "DisplayHalfScheme": false,
                    "DisplayHalfSchemeOn": "",
                    "RoundOffDisplayHalfScheme": 0,
                    "RStockVisibility": 1,
                    "IsMapped": 0,
                    "NonMapPartyCode": "NA",
                    "IsShowNonMappedOrderStock": 1,
                    "OrderRemarks": false,
                    "OrderDeliveryModeStatus": false,
                    "IsPartyLocked": "NA",
                    "IsPartyLockedSoonByDist": "NA",
                    "HalfSchemeValueToRetailer": 0,
                    "RewardSchemeId": "NA",
                    "NetRate": "NA",
                    "PrProductName": null,
                    "PrProductId": 0,
                    "AvailDistributorCount": 0,
                    "PrRegexProductName": null,
                    "DiscountPercentScheme": null,
                    "Margin": "NA",
                    "CashbackMessage": "",
                    "CashbackMinQuantity": "NA",
                    "CashbackMaxQuantity": 0,
                    "CashbackTermsAndConditions": null,
                    "StoreProductGST": 0,
                    "AvailableStoreCount": "NA",
                    "RateValidity": "NA",
                    "CompanyId": 0,
                    "CompanyName": null,
                    "ExpiryDate": null,
                    "CashbackFromDate": null,
                    "CashbackEndDate": null,
                    "MobileNumber": "5628695652",
                    "MaxCashback": 0,
                    "StorePriority": null,
                    "BrandName": null,
                    "motherBrandCode": null,
                    "MotherBrandName": null,
                    "ManufactureName": null,
                    "DrugCategoryName": null,
                    "SuperGroupName": null,
                    "SubGroupName": null,
                    "SubGroupShortCode": null,
                    "DrugtypeName": null,
                    "ClassName": null,
                    "BrandCode": null,
                    "UniformProductCode": null,
                    "TherapyName": null,
                    "RegionName": "PCMC"
                  },
                  {
                    "StoreId": 365,
                    "StoreName": "Patel Pharma, PCMC",
                    "ProductName": "MAHA Q TAB",
                    "ProductFullName": "MAHA Q TAB",
                    "ProductCode": "1898",
                    "DisplayProductCode": "1898",
                    "Packing": null,
                    "MRP": 2.63,
                    "PTR": 0.99,
                    "Company": "Mankind",
                    "CompanyCode": null,
                    "Scheme": null,
                    "Stock": 10000,
                    "ProductLock": false,
                    "HiddenPTR": 0.99,
                    "ShowPTR": true,
                    "RShowPtr": 1,
                    "RShowPtrForAllCompanies": 1,
                    "AllowMinQty": 0,
                    "AllowMaxQty": 0,
                    "StepUpValue": 0,
                    "AllowMOQ": true,
                    "RetailerSchemePreference": 1,
                    "RetailerSchemePriority": 1,
                    "RegExProductName": null,
                    "DisplayHalfScheme": false,
                    "DisplayHalfSchemeOn": "",
                    "RoundOffDisplayHalfScheme": 0,
                    "RStockVisibility": 1,
                    "IsMapped": 0,
                    "NonMapPartyCode": "NA",
                    "IsShowNonMappedOrderStock": 1,
                    "OrderRemarks": false,
                    "OrderDeliveryModeStatus": false,
                    "IsPartyLocked": "NA",
                    "IsPartyLockedSoonByDist": "NA",
                    "HalfSchemeValueToRetailer": 0,
                    "RewardSchemeId": "NA",
                    "NetRate": "NA",
                    "PrProductName": null,
                    "PrProductId": 0,
                    "AvailDistributorCount": 0,
                    "PrRegexProductName": null,
                    "DiscountPercentScheme": null,
                    "Margin": "NA",
                    "CashbackMessage": "",
                    "CashbackMinQuantity": "NA",
                    "CashbackMaxQuantity": 0,
                    "CashbackTermsAndConditions": null,
                    "StoreProductGST": 0,
                    "AvailableStoreCount": "NA",
                    "RateValidity": "NA",
                    "CompanyId": 0,
                    "CompanyName": null,
                    "ExpiryDate": null,
                    "CashbackFromDate": null,
                    "CashbackEndDate": null,
                    "MobileNumber": "5628695652",
                    "MaxCashback": 0,
                    "StorePriority": null,
                    "BrandName": null,
                    "motherBrandCode": null,
                    "MotherBrandName": null,
                    "ManufactureName": null,
                    "DrugCategoryName": null,
                    "SuperGroupName": null,
                    "SubGroupName": null,
                    "SubGroupShortCode": null,
                    "DrugtypeName": null,
                    "ClassName": null,
                    "BrandCode": null,
                    "UniformProductCode": null,
                    "TherapyName": null,
                    "RegionName": "PCMC"
                  },
                  {
                    "StoreId": 365,
                    "StoreName": "Patel Pharma, PCMC",
                    "ProductName": "MAHAPOD 200MG TAB",
                    "ProductFullName": "MAHAPOD 200MG TAB",
                    "ProductCode": "1896",
                    "DisplayProductCode": "1896",
                    "Packing": null,
                    "MRP": 32.14,
                    "PTR": 13.81,
                    "Company": "Mankind",
                    "CompanyCode": null,
                    "Scheme": null,
                    "Stock": 10000,
                    "ProductLock": false,
                    "HiddenPTR": 13.81,
                    "ShowPTR": true,
                    "RShowPtr": 1,
                    "RShowPtrForAllCompanies": 1,
                    "AllowMinQty": 0,
                    "AllowMaxQty": 0,
                    "StepUpValue": 0,
                    "AllowMOQ": true,
                    "RetailerSchemePreference": 1,
                    "RetailerSchemePriority": 1,
                    "RegExProductName": null,
                    "DisplayHalfScheme": false,
                    "DisplayHalfSchemeOn": "",
                    "RoundOffDisplayHalfScheme": 0,
                    "RStockVisibility": 1,
                    "IsMapped": 0,
                    "NonMapPartyCode": "NA",
                    "IsShowNonMappedOrderStock": 1,
                    "OrderRemarks": false,
                    "OrderDeliveryModeStatus": false,
                    "IsPartyLocked": "NA",
                    "IsPartyLockedSoonByDist": "NA",
                    "HalfSchemeValueToRetailer": 0,
                    "RewardSchemeId": "NA",
                    "NetRate": "NA",
                    "PrProductName": null,
                    "PrProductId": 0,
                    "AvailDistributorCount": 0,
                    "PrRegexProductName": null,
                    "DiscountPercentScheme": null,
                    "Margin": "NA",
                    "CashbackMessage": "",
                    "CashbackMinQuantity": "NA",
                    "CashbackMaxQuantity": 0,
                    "CashbackTermsAndConditions": null,
                    "StoreProductGST": 0,
                    "AvailableStoreCount": "NA",
                    "RateValidity": "NA",
                    "CompanyId": 0,
                    "CompanyName": null,
                    "ExpiryDate": null,
                    "CashbackFromDate": null,
                    "CashbackEndDate": null,
                    "MobileNumber": "5628695652",
                    "MaxCashback": 0,
                    "StorePriority": null,
                    "BrandName": null,
                    "motherBrandCode": null,
                    "MotherBrandName": null,
                    "ManufactureName": null,
                    "DrugCategoryName": null,
                    "SuperGroupName": null,
                    "SubGroupName": null,
                    "SubGroupShortCode": null,
                    "DrugtypeName": null,
                    "ClassName": null,
                    "BrandCode": null,
                    "UniformProductCode": null,
                    "TherapyName": null,
                    "RegionName": "PCMC"
                  },
                  {
                    "StoreId": 365,
                    "StoreName": "Patel Pharma, PCMC",
                    "ProductName": "VOMINIL TAB",
                    "ProductFullName": "VOMINIL TAB",
                    "ProductCode": "1540",
                    "DisplayProductCode": "1540",
                    "Packing": null,
                    "MRP": 16.33,
                    "PTR": 1.56,
                    "Company": "Mankind",
                    "CompanyCode": null,
                    "Scheme": null,
                    "Stock": 10000,
                    "ProductLock": false,
                    "HiddenPTR": 1.56,
                    "ShowPTR": true,
                    "RShowPtr": 1,
                    "RShowPtrForAllCompanies": 1,
                    "AllowMinQty": 0,
                    "AllowMaxQty": 0,
                    "StepUpValue": 0,
                    "AllowMOQ": true,
                    "RetailerSchemePreference": 1,
                    "RetailerSchemePriority": 1,
                    "RegExProductName": null,
                    "DisplayHalfScheme": false,
                    "DisplayHalfSchemeOn": "",
                    "RoundOffDisplayHalfScheme": 0,
                    "RStockVisibility": 1,
                    "IsMapped": 0,
                    "NonMapPartyCode": "NA",
                    "IsShowNonMappedOrderStock": 1,
                    "OrderRemarks": false,
                    "OrderDeliveryModeStatus": false,
                    "IsPartyLocked": "NA",
                    "IsPartyLockedSoonByDist": "NA",
                    "HalfSchemeValueToRetailer": 0,
                    "RewardSchemeId": "NA",
                    "NetRate": "NA",
                    "PrProductName": null,
                    "PrProductId": 0,
                    "AvailDistributorCount": 0,
                    "PrRegexProductName": null,
                    "DiscountPercentScheme": null,
                    "Margin": "NA",
                    "CashbackMessage": "",
                    "CashbackMinQuantity": "NA",
                    "CashbackMaxQuantity": 0,
                    "CashbackTermsAndConditions": null,
                    "StoreProductGST": 0,
                    "AvailableStoreCount": "NA",
                    "RateValidity": "NA",
                    "CompanyId": 0,
                    "CompanyName": null,
                    "ExpiryDate": null,
                    "CashbackFromDate": null,
                    "CashbackEndDate": null,
                    "MobileNumber": "5628695652",
                    "MaxCashback": 0,
                    "StorePriority": null,
                    "BrandName": null,
                    "motherBrandCode": null,
                    "MotherBrandName": null,
                    "ManufactureName": null,
                    "DrugCategoryName": null,
                    "SuperGroupName": null,
                    "SubGroupName": null,
                    "SubGroupShortCode": null,
                    "DrugtypeName": null,
                    "ClassName": null,
                    "BrandCode": null,
                    "UniformProductCode": null,
                    "TherapyName": null,
                    "RegionName": "PCMC"
                  },
                  {
                    "StoreId": 365,
                    "StoreName": "Patel Pharma, PCMC",
                    "ProductName": "MAHATUM-250MG TAB",
                    "ProductFullName": "MAHATUM-250MG TAB",
                    "ProductCode": "1601",
                    "DisplayProductCode": "1601",
                    "Packing": null,
                    "MRP": 81,
                    "PTR": 19.24,
                    "Company": "Mankind",
                    "CompanyCode": null,
                    "Scheme": null,
                    "Stock": 10000,
                    "ProductLock": false,
                    "HiddenPTR": 19.24,
                    "ShowPTR": true,
                    "RShowPtr": 1,
                    "RShowPtrForAllCompanies": 1,
                    "AllowMinQty": 0,
                    "AllowMaxQty": 0,
                    "StepUpValue": 0,
                    "AllowMOQ": true,
                    "RetailerSchemePreference": 1,
                    "RetailerSchemePriority": 1,
                    "RegExProductName": null,
                    "DisplayHalfScheme": false,
                    "DisplayHalfSchemeOn": "",
                    "RoundOffDisplayHalfScheme": 0,
                    "RStockVisibility": 1,
                    "IsMapped": 0,
                    "NonMapPartyCode": "NA",
                    "IsShowNonMappedOrderStock": 1,
                    "OrderRemarks": false,
                    "OrderDeliveryModeStatus": false,
                    "IsPartyLocked": "NA",
                    "IsPartyLockedSoonByDist": "NA",
                    "HalfSchemeValueToRetailer": 0,
                    "RewardSchemeId": "NA",
                    "NetRate": "NA",
                    "PrProductName": null,
                    "PrProductId": 0,
                    "AvailDistributorCount": 0,
                    "PrRegexProductName": null,
                    "DiscountPercentScheme": null,
                    "Margin": "NA",
                    "CashbackMessage": "",
                    "CashbackMinQuantity": "NA",
                    "CashbackMaxQuantity": 0,
                    "CashbackTermsAndConditions": null,
                    "StoreProductGST": 0,
                    "AvailableStoreCount": "NA",
                    "RateValidity": "NA",
                    "CompanyId": 0,
                    "CompanyName": null,
                    "ExpiryDate": null,
                    "CashbackFromDate": null,
                    "CashbackEndDate": null,
                    "MobileNumber": "5628695652",
                    "MaxCashback": 0,
                    "StorePriority": null,
                    "BrandName": null,
                    "motherBrandCode": null,
                    "MotherBrandName": null,
                    "ManufactureName": null,
                    "DrugCategoryName": null,
                    "SuperGroupName": null,
                    "SubGroupName": null,
                    "SubGroupShortCode": null,
                    "DrugtypeName": null,
                    "ClassName": null,
                    "BrandCode": null,
                    "UniformProductCode": null,
                    "TherapyName": null,
                    "RegionName": "PCMC"
                  }
            ];

        } catch (_e) {
            console.log(_e);
        }

        return [];

    };

    determineSegments = async (_rId) => {

        try {

            let mappedSegments = [];
            const segments = await SegmentModel.find().lean();

            if (segments) {                    
                const userSegment = await UserSegmentModel.findOne({userId: _rId});
                if (userSegment) {
                    mappedSegments = userSegment.segment.map(item => item.segmentKey);
                }
            }

            return mappedSegments;
            
        } catch (_e) {
            return [];
        }
        
    }

}
