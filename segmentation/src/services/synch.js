import EM from '../utils/entity.js';
import MYDBM from '../utils/mysql.js';
import QueueStatus from '../enums/queue-status.js';

export default class SynchService {

    constructor () {}

    addRetailer = async (_req) => {

        try {

            if (!_req.body) {
                throw new Error("Request body not found");
            }

            const {RetailerId} = _req.body;
            if (!RetailerId) {
                throw new Error("RetailerId parameter is missing");
            }

            const retailerQueueModel = await EM.getModel("cms_segment_retailer_queue");
            const retailerModel = await EM.getModel("cms_master_retailer");
            const retailer = await MYDBM.queryWithConditions(`
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
            , [RetailerId]);

            if (Array.isArray(retailer) && retailer.length == 1) {
                const retailerObj = retailerModel(
                    {
                        Address1: retailer[0].Address1, 
                        Address2: retailer[0].Address2, 
                        City: retailer[0].City, 
                        Email: retailer[0].Email, 
                        IsAuthorized: retailer[0].IsAuthorized, 
                        MobileNumber: retailer[0].MobileNumber, 
                        Pincode: retailer[0].Pincode, 
                        RegionId: retailer[0].RegionId, 
                        RetailerId: retailer[0].RetailerId, 
                        RetailerName: retailer[0].RetailerName, 
                        StateId: retailer[0].StateId 
                    }
                );
    
                await retailerObj.save();                  
                
                /* Add it to the queue */
                const retailerQueue = new retailerQueueModel({
                    retailerId: RetailerId,
                    queueStatus : QueueStatus.WAITING
                });
                await retailerQueue.save();
                
                return { status: true, message: "Retailer "+ retailer[0].RetailerName +" has been synched" };

            } else {
                throw new Error("Retailer not found for the RetailerId : "+ RetailerId);
            }

        } catch (e) {
            console.log(e);
            throw e;
        }

    };

    updateRetailer = async (_req) => {

        try {

            if (!_req.body) {
                throw new Error("Request body not found");
            }

            const {body} = _req.body;
            const {RetailerId} = body;

            if (!RetailerId) {
                throw new Error("RetailerId parameter is missing");
            }

            delete body["RetailerId"];            

            const retailerModel = await EM.getModel("cms_master_retailer");  
            const retailerQueueModel = await EM.getModel("cms_segment_retailer_queue");

            const retailer = await retailerModel.findOneAndUpdate(
                { RetailerId: RetailerId },
                { $set: { ...body } },
                { new: true }
            );

            /* Add it to the queue */
            const queue = await retailerQueueModel.findOne({
                retailerId: RetailerId,
                queueStatus : QueueStatus.WAITING
            }).lean();

            if (!queue) {
                const orderQueue = new retailerQueueModel({
                    retailerId: RetailerId,
                    queueStatus : QueueStatus.WAITING
                });
                await orderQueue.save();
            }

            if (retailer) {
                return { status: true, message: "Retailer "+ retailer.RetailerName +" has been updated" };
            } else {
                throw new Error("Retailer not found for the RetailerId : "+ RetailerId);
            }

        } catch (e) {
            console.log(e);
            throw e;
        }

    };

    deleteRetailer = async (_req) => {

        try {

            if (!_req.query.RetailerId) {
                throw new Error("RetailerId parameter is missing");
            }

            const retailerModel = await EM.getModel("cms_master_retailer");
            const retailer = await retailerModel.findOne({ RetailerId: _req.query.RetailerId }).lean();
            await retailerModel.deleteOne({ RetailerId: _req.query.RetailerId });

            return { status: true, message: "Retailer "+ retailer.RetailerName +" has been removed" };

        } catch (e) {
            console.log(e);
            throw e;
        }

    };

    addOrder = async (_req) => {

        try {

            if (!_req.body) {
                throw new Error("Request body not found");
            }

            const {OrderId} = _req.body;
            if (!OrderId) {
                throw new Error("OrderId parameter is missing");
            }

            const orderModel = await EM.getModel("cms_master_order");
            const orderItemModel = await EM.getModel("cms_master_order_item");            
            const retailerModel = await EM.getModel("cms_master_retailer"); 
            const storeModel = await EM.getModel("cms_master_store"); 
            const orderQueueModel = await EM.getModel("cms_segment_order_queue");  

            const orders = await MYDBM.queryWithConditions(`
                SELECT 
                    o.OrderId, 
                    od.OrderDetailId, 
                    o.PartyCode, 
                    o.StoreId, 
                    r.RetailerId, 
                    r.StateId,
                    r.RegionId,
                    r.City, 
                    r.Pincode,
                    o.OrderDate, 
                    o.OrderAmount,
                    o.CreatedBy,
                    o.IsUploaded,
                    o.UploadDate,
                    o.IsProcessed,
                    o.ProcessedDate, 
                    o.OrderSource,    
                    o.OrderPlacedBy, 
                    od.ProductCode, 
                    od.Quantity,      
                    od.ActualQuantityReceived, 
                    od.PTR,      
                    spr.CompanyCode,
                    spr.Company,
                    spr.Category, 
                    b.CompanyId,
                    b.BrandId,
                    b.Name as BrandName,
                    mspm.MDM_PRODUCT_CODE 
                FROM 
                    orders o
                INNER JOIN orderdetails od ON o.OrderId = od.OrderId
                INNER JOIN stores AS s ON o.StoreId = s.StoreId
                INNER JOIN storeparties AS sp ON o.StoreId = sp.StoreId AND o.PartyCode = sp.PartyCode             
                INNER JOIN storeproducts spr ON od.StoreId = spr.StoreId AND od.ProductCode = spr.ProductCode
                INNER JOIN retailerstoreparties rsp ON s.StoreId = rsp.StoreId AND ((o.PartyCode = rsp.PartyCode) OR ((o.PartyCode IS NULL) AND (rsp.PartyCode IS NULL)))
                INNER JOIN retailers r ON r.RetailerId = rsp.RetailerId 
                INNER JOIN users u ON o.CreatedBy = u.UserId
                LEFT JOIN productstoreproducts psp ON psp.storeid=o.StoreId AND psp.ProductCode=od.ProductCode
                LEFT JOIN products p ON p.ProductId = psp.ProductId
                LEFT JOIN brands b ON b.BrandId = p.BrandId 
                LEFT JOIN mdm_store_product_master mspm ON mspm.PRODUCT_CODE = od.ProductCode AND mspm.STOREID = o.StoreId
                WHERE o.OrderId=?;`
            , [OrderId]);

            if (Array.isArray(orders) && orders.length > 0) {

                const orderObj = new orderModel({
                    grandTotal: orders[0].OrderAmount,
                    isProcessed: orders[0].IsProcessed,
                    isUploaded: orders[0].IsUploaded,
                    orderDate: orders[0].OrderDate,
                    orderId: orders[0].OrderId,
                    orderSource: orders[0].OrderSource,
                    orderStatus: orders[0].IsProcessed ? "Processed" : (orders[0].IsUploaded ? "Uploaded" : "Placed"),
                    retailerId: orders[0].RetailerId,
                    storeId: orders[0].StoreId,
                    userId: orders[0].CreatedBy,
                    stateId: orders[0].StateId,
                    regionId: orders[0].RegionId,
                    city: orders[0].City,
                    pinCode: orders[0].Pincode,
                    retailer: null,
                    store: null
                });

                /* Get the retailer and store references asynchronously */
                const [retailerRecord, storeRecord] = await Promise.all([
                    retailerModel.findOne({ RetailerId: orderObj.RetailerId }).lean(),
                    storeModel.findOne({ storeId: orderObj.StoreId }).lean()
                ]);

                if (retailerRecord) orderObj.retailer = retailerRecord._id;
                if (storeRecord) orderObj.store = storeRecord._id;

                const order = await orderObj.save();

                if (order) {

                    const itemsObj = orders.map((_item) => ({                        
                        companyCode: _item.CompanyCode,
                        companyName: _item.Company,
                        companyId: _item.CompanyId,
                        itemId: _item.OrderDetailId,
                        mdmProductCode: _item.MDM_PRODUCT_CODE,
                        orderId: _item.OrderId,
                        orderedQty: _item.Quantity,
                        productCode: _item.ProductCode,
                        ptr: _item.PTR,
                        receivedQty: _item.ActualQuantityReceived,
                        order: order._id,
                        brandName: _item.BrandName,
                        brandId: _item.BrandId,
                        category: _item.Category                      
                    }));

                    await orderItemModel.insertMany(itemsObj, { ordered: false });

                    /* Add it to the queue */
                    const orderQueue = new orderQueueModel({
                        orderId: OrderId,
                        queueStatus : QueueStatus.WAITING
                    });
                    await orderQueue.save();

                    return { status: true, message: "Order "+ OrderId +" has been synched" }; 

                } else {
                    throw new Error("Error while synching OrderId : "+ OrderId);
                }

            } else {
                throw new Error("Order not found for the OrderId : "+ OrderId);
            }            

        } catch (e) {
            console.log(e);
            throw e;
        }

    };

    updateOrder = async (_req) => {

        try {

            if (!_req.body) {
                throw new Error("Request body not found");
            }

            const {body} = _req;
            const {OrderId} = body;

            if (!OrderId) {
                throw new Error("OrderId parameter is missing");
            }

            delete body["OrderId"];            

            const orderModel = await EM.getModel("cms_master_order");
            const orderQueueModel = await EM.getModel("cms_segment_order_queue");  

            const order = await orderModel.findOneAndUpdate(
                { orderId: OrderId },
                { $set: { ...body } },
                { new: true }
            );

            /* Add it to the queue */
            const queue = await orderQueueModel.findOne({
                orderId: OrderId,
                queueStatus : QueueStatus.WAITING
            }).lean();

            if (!queue) {
                const orderQueue = new orderQueueModel({
                    orderId: OrderId,
                    queueStatus : QueueStatus.WAITING
                });
                await orderQueue.save();
            }            

            if (order) {
                return { status: true, message: "Order "+ OrderId +" has been synched" };
            } else {
                throw new Error("Order not found for the OrderId : "+ OrderId);
            }

        } catch (e) {
            console.log(e);
            throw e;
        }

    };

}