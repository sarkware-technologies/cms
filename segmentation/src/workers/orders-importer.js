import { parentPort, workerData } from "worker_threads";
import MDBM from "./mongo.js";
import MYDBM from "./mysql.js";
import EM from "./entity.js";
import ImportType from '../enums/importer-type.js';

async function processBatch(data) {

    const { batch, orderIds } = data;

    let orderSuccess = 0;
    let orderItemSuccess = 0;
    let orderFailed = 0;
    let orderItemFailed = 0;

    try {

        await MDBM.connect();
        await MYDBM.connect(false);

        const orderModel = await EM.getModel("cms_master_order");
        const orderItemModel = await EM.getModel("cms_master_order_item");
        const batchProgressModel = await EM.getModel("cms_background_task_progress");

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
                mspm.MDM_PRODUCT_CODE 
            FROM 
                orders o
            INNER JOIN orderdetails od ON o.OrderId = od.OrderId
            INNER JOIN stores AS s ON o.StoreId = s.StoreId
            INNER JOIN storeparties AS sp ON o.StoreId = sp.StoreId AND o.PartyCode = sp.PartyCode
            LEFT JOIN storeproducts spr ON od.StoreId = spr.StoreId AND od.ProductCode = spr.ProductCode
            INNER JOIN retailerstoreparties rsp ON s.StoreId = rsp.StoreId AND ((o.PartyCode = rsp.PartyCode) OR ((o.PartyCode IS NULL) AND (rsp.PartyCode IS NULL)))
            INNER JOIN retailers r ON r.RetailerId = rsp.RetailerId 
            INNER JOIN users u ON o.CreatedBy = u.UserId
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

            chunk.forEach((orderId) => {
                
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
                    pinCode: orderData.Pincode
                };

                orderBulkOps.push({
                    updateOne: {
                        filter: { orderId: orderObj.orderId },
                        update: orderObj,
                        upsert: true,
                    },
                });                    
                
            });

            try {

                const orderBulkResult = await orderModel.bulkWrite(orderBulkOps, { ordered: false });                                
            
                /* Increment order success counter */
                const successfulOps = orderBulkResult.upsertedCount + orderBulkResult.modifiedCount;
                orderSuccess += successfulOps;

                /* Increment order failed counter */
                const writeErrors = orderBulkResult.getWriteErrors();
                orderFailed += writeErrors.length;

                /* Map each original orderId to its new MongoDB _id */
                Object.entries(orderBulkResult.upsertedIds).forEach(([index, mongoId]) => {                    
                    try {
                        const originalOrderId = orderBulkOps[index].updateOne.filter.orderId;
                        orderIdMap[originalOrderId] = mongoId;
                    } catch (e) {
                        /* Safe to Ignore */
                    }                                    
                });

                orderBulkOps.length = 0; // Clear operations after execution

            } catch (e) {                
                orderFailed += chunk.length;
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
                }
            })

        ).filter(Boolean);

        for (let i = 0; i < allOrderItems.length; i += chunkSize) {

            let bulkRes = null;
            const chunk = allOrderItems.slice(i, i + chunkSize);

            try {

                bulkRes = await orderItemModel.insertMany(chunk, { ordered: false });
                orderItemSuccess += bulkRes.insertedIds ? Object.keys(bulkRes.insertedIds).length : 0;

            } catch (e) {
                if (e.writeErrors) {
                    /* For partial success */
                    orderItemSuccess += chunk.length - e.writeErrors.length;
                    orderItemFailed += e.writeErrors.length;
                } else {
                    /* Complete failure */
                    orderItemFailed += chunk.length;
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