import { parentPort, workerData } from "worker_threads";
import MDBM from "../utils/mongo.js";
import MYDBM from "../utils/mysql.js";
import EM from "../utils/entity.js";
import ImportType from '../enums/importer-type.js';

async function processBatch(data) {

    const { batch, orderIds } = data;

    try {

        await MDBM.connect();
        await MYDBM.connect(false);

        const orderModel = await EM.getModel("cms_master_order");
        const orderItemModel = await EM.getModel("cms_master_order_item");
        const orderLogModel = await EM.getModel("cms_order_importer_log");
        const orderItemLogModel = await EM.getModel("cms_order_item_importer_log");
        const batchProgressModel = await EM.getModel("cms_background_task_progress");
        const retailerModel = await EM.getModel("cms_master_retailer"); 
        const storeModel = await EM.getModel("cms_master_store");       

        const batchProgress = await batchProgressModel.findOne({ type: ImportType.ORDER_IMPORTER }).lean();

        try {
            await batchProgressModel.findByIdAndUpdate(batchProgress._id, {
                $max: { currentBatch: batch }
            });
        } catch (e) {
            console.log(e.message);
        }

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
                b.Name as Brand,
                mspm.MDM_PRODUCT_CODE 
            FROM 
                orders o
            INNER JOIN orderdetails od ON o.OrderId = od.OrderId
            INNER JOIN stores AS s ON o.StoreId = s.StoreId
            INNER JOIN storeparties AS sp ON o.StoreId = sp.StoreId AND o.PartyCode = sp.PartyCode
            INNER JOIN productstoreproducts psp ON psp.storeid=o.StoreId AND psp.ProductCode=od.ProductCode
            INNER JOIN products p ON p.ProductId = psp.ProductId             
            INNER JOIN storeproducts spr ON od.StoreId = spr.StoreId AND od.ProductCode = spr.ProductCode
            INNER JOIN retailerstoreparties rsp ON s.StoreId = rsp.StoreId AND ((o.PartyCode = rsp.PartyCode) OR ((o.PartyCode IS NULL) AND (rsp.PartyCode IS NULL)))
            INNER JOIN retailers r ON r.RetailerId = rsp.RetailerId 
            INNER JOIN users u ON o.CreatedBy = u.UserId
            LEFT JOIN brands b ON b.BrandId = p.BrandId 
            LEFT JOIN mdm_store_product_master mspm ON mspm.PRODUCT_CODE = od.ProductCode AND mspm.STOREID = o.StoreId
            WHERE o.OrderId IN (?);`
        , [orderIds]);        
        
        let groupedOrders = orders.reduce((acc, order) => {
            const orderId = order.OrderId;
            if (!acc[orderId]) acc[orderId] = [];
            acc[orderId].push(order);
            return acc;
        }, {});

        const orderBulkOps = [];
        const orderIdMap = {};
        const chunkSize = 100;
        const oIds = Object.keys(groupedOrders);

        /* Process Orders in chunk */
        for (let i = 0; i < oIds.length; i += chunkSize) {
            
            const chunk = oIds.slice(i, i + chunkSize);
            const orderBulkOps = [];  // Clear operations for each chunk

            for (const orderId of chunk) {
                const orderData = groupedOrders[orderId][0];
                const orderObj = {
                    grandTotal: orderData.OrderAmount,
                    isProcessed: orderData.IsProcessed,
                    isUploaded: orderData.IsUploaded,
                    orderDate: orderData.OrderDate,
                    orderId: orderData.OrderId,
                    orderSource: orderData.OrderSource,
                    orderStatus: orderData.IsProcessed ? "Processed" : (orderData.IsUploaded ? "Uploaded" : "Placed"),
                    retailerId: orderData.RetailerId,
                    storeId: orderData.StoreId,
                    userId: orderData.CreatedBy,
                    stateId: orderData.StateId,
                    regionId: orderData.RegionId,
                    city: orderData.City,
                    pinCode: orderData.Pincode,
                    retailer: null,
                    store: null
                };

                /* Get the retailer and store references asynchronously */
                const [retailerRecord, storeRecord] = await Promise.all([
                    retailerModel.findOne({ RetailerId: orderData.RetailerId }).lean(),
                    storeModel.findOne({ storeId: orderData.StoreId }).lean()
                ]);

                if (retailerRecord) orderObj.retailer = retailerRecord._id;
                if (storeRecord) orderObj.store = storeRecord._id;

                orderBulkOps.push(orderObj);
            }

            try {
                /* Insert bulk orders */
                const insertResponse = await orderModel.insertMany(orderBulkOps, { ordered: false });

                /* Map each original orderId to its new MongoDB _id */
                insertResponse.forEach((doc, index) => {
                    try {
                        const originalOrderId = orderBulkOps[index].orderId;
                        orderIdMap[originalOrderId] = doc._id;
                    } catch (e) {
                        /* Safe to ignore */
                    }
                });

            } catch (e) {
                /* Handle partial and full failures */
                const errorLogs = [];

                if (e.writeErrors) {
                    /* Partial failure */
                    errorLogs.push(...e.writeErrors.map(error => ({
                        orderId: error.err.op.orderId,
                        message: error.err.errmsg || "Unknown error"
                    })));
                } else {
                    /* Complete failure */
                    errorLogs.push(...chunk.map(order => ({
                        orderId: order.orderId,
                        message: e.message || "Unknown error"
                    })));
                }

                try {
                    await orderLogModel.insertMany(errorLogs, { ordered: false });
                } catch (logError) {
                    console.log("Error logging for import order itself failed for batch:", batch);
                }
            }
        }

        /* Process Order Items in chunk */
        const allOrderItems = Object.values(groupedOrders).flatMap((group) => 

            group.map((_item) => {
                if (!orderIdMap[_item.OrderId]) {
                    return null;
                }
                return {
                    companyCode: _item.CompanyCode,
                    companyName: _item.Company,
                    itemId: _item.OrderDetailId,
                    mdmProductCode: _item.MDM_PRODUCT_CODE,
                    orderId: _item.OrderId,
                    orderedQty: _item.Quantity,
                    productCode: _item.ProductCode,
                    ptr: _item.PTR,
                    receivedQty: _item.ActualQuantityReceived,
                    order: orderIdMap[_item.OrderId],
                    brand: _item.Brand
                }
            })

        ).filter(Boolean);

        for (let i = 0; i < allOrderItems.length; i += chunkSize) {

            const chunk = allOrderItems.slice(i, i + chunkSize);

            try {
                await orderItemModel.insertMany(chunk, { ordered: false });
            } catch (e) {
                
                if (e.writeErrors) {
                    
                    /* Partial failure */

                    const errorLogs = e.writeErrors.map(error => ({
                        itemId: error.err.op.itemId,                         
                        message: error.err.errmsg || "Unknown error"                        
                    }));

                    try {
                        await orderItemLogModel.insertMany(errorLogs, { ordered: false });
                    } catch (logError) {
                        console.log("Error logging for import order item itself failed for batch:", batch);
                    }

                } else {
                    
                    /* Complete failure */

                    const errorLogs = chunk.map(orderItem => ({
                        itemId: orderItem.itemId,
                        message: e.message || "Unknown error" 
                    }));

                    try {
                        await orderItemLogModel.insertMany(errorLogs, { ordered: false });
                    } catch (e) {
                        console.log("Error logging for import order item itself failed for batch : "+ batch);
                    }

                }

            }

        }

        try {
            await batchProgressModel.findByIdAndUpdate(batchProgress._id, {
                $inc: { completedBatch: 1, pendingBatch: -1 },
            });
        } catch (e) {
            console.log(e.message);
        }

        groupedOrders = null;
        orderBulkOps.length = 0;
        allOrderItems.length = 0;

    } catch (e) {        
        /* Job is failed */
        console.log(e);
    } finally {

        try {
            await MDBM.close();
            await MYDBM.close();
        } catch (closeError) {
            console.error("Error during cleanup:", closeError);
        }
        
        process.exit(0);

    }
}

processBatch(workerData);