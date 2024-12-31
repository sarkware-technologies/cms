
import CmsRedisClient from "../utils/cms-redis.js";
import Retailer from "../models/retailer.js";
import RetailerMaster from "../models/retailer-master.js";
import SegmentRetailerModel from "../models/segment-retailer.js";
import SponsoredProductModel from "../models/sponsored-product.js";
import SponsoredProductPerformanceModel from "../models/sponsored-product-performance.js";
import MYDBM from "../utils/mysql.js";

export default class SponsoredProductService {

    constructor() {
        this.redisClient = CmsRedisClient.getInstance();
    }

    getSponsoredProducts = async (_req) => {
        try {

            const user = _req.user;
            if (!user) {
                throw new Error("Invalid token");
            }

            const search = _req.query.search;
            if (!search) {
                throw new Error("Search key is empty");
            }

            let retailerId = null;
            let regionName = null;
            let cmsRetailer = null;
            let sponsoredProducts = [];
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
            cmsRetailer = await RetailerMaster.findOne({ RetailerId: retailerId }).lean();

            if (!cmsRetailer) {
                throw new Error(`The retailer ${retailerId} is no found on CMS Retailer Master collection`);
            }

            const retailerSegments = await this.determineSegments(cmsRetailer._id);
            if (retailerSegments) {

                const currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0);

                // const _sps = await this.redisClient.getAll("pharmarack_cms_sponsored_products");
                const _sps = await SponsoredProductModel.find({ 
                    status: true, 
                    keywords: search,
                    validFrom: { $lte: currentDate },
                    validUpto: { $gte: currentDate }                    
                });

                if (_sps) {

                    // const sKeys = Object.keys(_sps);
                    // for (let i = 0; i <  _sps.length;  i++) {

                    _sps.forEach(async (e) => {
                        if (this.evaluateSegmentRule(e.segments, retailerSegments)) {

                            sponsoredProducts.push({
                                "ProductName": e.productName,
                                "PTR": e.ptr,
                                "MRP": e.mrp,
                                "MDMProductCode": e.mdmProductCode,
                                "Keyword": search,
                                "SponsoredProduct": e._id,
                                // "SponsoredProductdetails": e
                            });

                            await SponsoredProductPerformanceModel.findOneAndUpdate(
                                { sponsoredProduct: e._id, keyword: search },
                                { $inc: { impression: 1 } },
                                { new: true, upsert: true }
                            );

                        }

                    })

                    // }

                }

            }

            return {
                "success": true,
                "StatusCode": 200,
                "data": sponsoredProducts,
                "message": "Group search mapped result",
                "uuid": "1df1e469-948a-4dca-abed-c828ba1a16b3",
            };

        } catch (e) {
            console.log(e);
            throw e;
        }

    };

    updateSponsoredProductPerformance = async (_req) => {

        try {
            const { body } = _req;
            if (!body) {
                throw new Error("Request body is empty");
            }

            const { sponsoredProduct, keyword, event, qty } = body;

            if (!sponsoredProduct || !keyword) {
                throw new Error("Missing required fields: sponsoredProduct or keyword");
            }

            if (event === 1) {
                // Cart event
                await SponsoredProductPerformanceModel.findOneAndUpdate(
                    { sponsoredProduct, keyword },
                    { $inc: { addedToCart: 1 } },
                    { new: true, upsert: true }
                );
            } else if (event === 2) {
                // Order event
                const incrementFields = {
                    ordered: 1,
                    orderedQty: typeof qty === "number" ? qty : 1,
                };

                await SponsoredProductPerformanceModel.findOneAndUpdate(
                    { sponsoredProduct, keyword },
                    { $inc: incrementFields },
                    { new: true, upsert: true }
                );
            } else {
                throw new Error("Invalid event type. Event must be 1 (Cart) or 2 (Order).");
            }
        } catch (error) {
            console.error("Error updating sponsored product performance:", error.stack);
            throw error;
        }

    };


    evaluateSegmentRule = (_sponsoredSegments, _retailerSegments) => {

        try {

            // If segments is a string
            if (typeof _sponsoredSegments === "string") {
                return (_sponsoredSegments != "none");
            }

            // If segments is an array
            if (Array.isArray(_sponsoredSegments) && Array.isArray(_retailerSegments)) {

                const retailerSegmentSet = new Set(_retailerSegments);
                return _sponsoredSegments.some((segment) => retailerSegmentSet.has(segment));

            }

            return false;

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

}