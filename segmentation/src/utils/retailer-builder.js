import EM from "./entity.js";
import SegmentGeography from "../enums/segment-geography.js";
import SegmentRetailerStatus from "../enums/segment-retailer-status.js";
import SegmentStoreStatus from "../enums/segment-store-status.js";

export default class RetailerBuilder {

    constructor() {
        this.models = {};
        this.retailerId = null;
    }

    init = async () => {

        try {
    
            const modelNames = [
                "cms_segment",      
                "cms_segment_rule",      
                "cms_master_retailer",            
                "cms_segment_retailer",
                "cms_segment_blacklisted_retailer"
            ];
    
            this.models = Object.fromEntries(
                await Promise.all(
                    modelNames.map(async name => [name, await EM.getModel(name)])
                )
            );                     
    
        } catch (error) {
            console.error("Error initializing models:", error);
            throw error;
        }
    
    };

    checkRetailerMaster = async () => {

        try {
    
            let retailer = await this.models.cms_master_retailer.findOne({ RetailerId: this.retailerId }).lean();
            if (!retailer) {
    
                const results = await MYDBM.queryWithConditions(`
                    select 
                        r.Address1, 
                        r.Address2, 
                        r.City, 
                        r.Email, 
                        r.IsAuthorized, 
                        r.MobileNumber, 
                        r.Pincode, 
                        r.RegionId, 
                        r.RetailerId, 
                        r.RetailerName, 
                        r.StateId 
                        from retailers r 
                    WHERE r.RetailerId=?;`
                , [this.retailerId]);
        
                if (Array.isArray(results) && results.length == 1) {
        
                    const retailerObj = new this.models.cms_master_retailer(
                        {
                            Address1: results[0].Address1, 
                            Address2: results[0].Address2, 
                            City: results[0].City, 
                            Email: results[0].Email, 
                            IsAuthorized: results[0].IsAuthorized, 
                            MobileNumber: results[0].MobileNumber, 
                            Pincode: results[0].Pincode, 
                            RegionId: results[0].RegionId, 
                            RetailerId: results[0].RetailerId, 
                            RetailerName: results[0].RetailerName, 
                            StateId: results[0].StateId 
                        }
                    );
        
                    retailer = await retailerObj.save();                 
                    retailer = retailer.toObject();
        
                }
            }

            return retailer;
    
        } catch (e) {
            console.log(e);
            return null;
        }    
    
    };

    addRetailerToSegment = async (_segmentId) => {

        try {
    
            /* Check whether this retailer is blacklisted or not */
            const isBlacklisted = await this.models.cms_segment_blacklisted_retailer.findOne({
                retailer: this.retailerId,
                segment: _segmentId
            }).lean();
    
            if (isBlacklisted) {
                /* No need to go further */
                console.log(`Retailer ${this.retailerId} is blacklisted for segment ${_segmentId}.`);
                return;
            }
    
            /* Check whether the retailer is already mapped to the segment */
            const alreadyMapped = await this.models.cms_segment_retailer.findOne({
                retailer: this.retailerId,
                segment: _segmentId
            }).lean();
    
            if (alreadyMapped) {
                /* No need to go further */
                console.log(`Retailer ${this.retailerId} is already mapped to segment ${_segmentId}.`);
                return;
            }
    
            /* Ok, good to mapping */
            const mapping = await new this.models.cms_segment_retailer({
                retailer: this.retailerId,
                segment: _segmentId  
            });
    
            await mapping.save();
    
        } catch (e) {
            console.log(e);
        }
    
    };

    isOpenSegment = (_segment) => {
        
        if (_segment.fromDate || _segment.toDate) {
            return false;
        }
    
        if (
            (_segment.geography === SegmentGeography.STATE && Array.isArray(_segment.states) && _segment.states.length > 0) ||
            (_segment.geography === SegmentGeography.REGION && Array.isArray(_segment.regions) && _segment.regions.length > 0)
        ) {
            return false;
        }
    
        if ((Array.isArray(_segment.orderStatus) && _segment.orderStatus.length > 0) || 
            (Array.isArray(_segment.excludedStores) && _segment.excludedStores.length > 0)) {
            return false;
        }
    
        if (_segment.retailerStatus === SegmentRetailerStatus.AUTHORIZED || 
            _segment.storeStatus === SegmentStoreStatus.AUTHORIZED) {
            return false;
        }
    
        return true;
        
    };    

    mapSegments = async (_retailerId, _isNew) => {

        this.retailerId = _retailerId;

        try {

            await this.init();

            /**
             * 
             * Retrive the original retailer from the mongo
             * 
             */
            const retailer = await this.checkRetailerMaster();
    
            if (retailer) {
                const segments = await this.models.cms_segment.find({ status: true }).lean();
                for (let i = 0; i < segments.length; i++) {
                    try {

                        const segmentRules = await this.models.cms_segment_rule.find({ segment: segments[i]._id }).lean();
                        if(segmentRules.length == 0 && this.isOpenSegment(segments[i])) {
                            await this.addRetailerToSegment(segments[i]._id);
                        }
                    } catch (e) {
                        console.log(e);
                    }                
                }
            } else {
                throw new Error("Retailer not found for Id : "+ _retailerId);
            }

        } catch (e) {
            console.log(e);
        }

    };

}