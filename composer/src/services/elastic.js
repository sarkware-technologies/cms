import axios from 'axios';
import moment from 'moment';
import Redisdata from "./redisData.js";
import OpensearchApi from "./openSearch.js";

export default class ElasticService {

    constructor() {
        this.redisData = new Redisdata();
        this.openSearch = new OpensearchApi();

    }

    getBrands = async (_count, regionName) => {

        try {
            return await this.redisData.trendingProducts({ regionName });
        } catch (e) {
            console.log(e);
            return [];
        }
        
    };

    getTrendingProducts = async (_count, regionName, details) => {

        try {

            let tempRes = await this.redisData.trendingProducts({ regionName });

            if (tempRes && Array.isArray(tempRes) && tempRes.length > 0) {

                tempRes = await this.openSearch.YourTopPickProducts(tempRes, details);            
                let result = tempRes
                    .filter((item) => {
                        return item.DoNotShowToRetailer === false && item.ProductLock != true;
                    })
                    .sort((a, b) => a.Priority - b.Priority);
                result = result.slice(0, _count)
                return result;
            }

        } catch (e) {
            console.log(e);            
        }
        
        return [];       

    };

    getOrderedProducts = async (_count, user, details) => {

        try {

            let tempRes = await this.redisData.orderAgain({ UserId: user });

            if (tempRes && Array.isArray(tempRes) && tempRes.length > 0) {
                
                tempRes = await this.openSearch.YourTopPickProducts(tempRes, details);
                let result = tempRes
                    .filter((item) => {
                        return item.DoNotShowToRetailer === false && item.ProductLock != true;
                    })
                    .sort((a, b) => a.Priority - b.Priority);
                result = result.slice(0, _count)
                return result;
            }

        } catch (e) {
            console.log(e);
        }

        return [];   

    };

    getPickedProducts = async (_count, _distributorId, details) => {

        try {

            let tempRes = await this.redisData.topPicks({ storeId: [_distributorId] });

            if (tempRes && Array.isArray(tempRes) && tempRes.length > 0) {
                
                tempRes = await this.openSearch.YourTopPickProducts(tempRes, details);
                let result = tempRes
                    .filter((item) => {
                        return item.DoNotShowToRetailer === false && item.ProductLock != true;
                    })
                    .sort((a, b) => a.Priority - b.Priority);
                result = result.slice(0, _count)
                return result;
            }

        } catch (e) {
            console.log(e);            
        }

        return [];

    };

    getCompanyProducts = async (_token, _companyId, _count) => {

        try {

            const ss = await this.contactElasticServer(_token, '/open-search/api/v1/search/product-search-by-companyids', {
                "CompanyIds": [parseInt(_companyId)],
                "Count": _count * 5,
            });

            console.log(ss);

            return ss;

        } catch (e) {
            return [];
        }

    };

    getDistributorProducts = async (_token, _storeId, _count) => {

        try {

            let tempRes = await this.contactElasticServer(_token, '/open-search/api/v1/search/product-search-by-distributorids', {
                "StoreIds": [parseInt(_storeId)],
                "Count": _count * 5,
            });
            let result = tempRes
                .filter((item) => {
                    return item.DoNotShowToRetailer === false && item.ProductLock != true;
                })
                .sort((a, b) => a.Priority - b.Priority);
            result = result.slice(0, _count)
            return result;
        } catch (e) {
            return [];
        }

    };

    contactElasticServer = async (_token, _endPoint, _body = {}) => {

        const axiosConfig = {
            timeout: 8000,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': _token
            }
        };

        try {
            const response = await axios.post(process.env.ELASTIC_API_BASE + _endPoint, _body, axiosConfig);
            return response.data.data;
        } catch (error) {
            /* We will silently fail it */
            return []
        }

    };

}