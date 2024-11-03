import { parentPort, workerData } from "worker_threads";
import MDBM from "./mongo.js";
import EM from "./entity.js";

async function processBatch(data) {

    const { batch, orderIds } = data;

    console.log(`Starting batch ${batch}`);

    let success = 0;
    let failed = 0;

    try {
        await MDBM.connect();

        const orderModel = await EM.getModel("cms_master_order");
        const orderItemModel = await EM.getModel("cms_master_order_item");
        const batchProgressModel = await EM.getModel("cms_scheduler_batch_progress");

        const batchProgress = await batchProgressModel.findOne({ type: "ORDER_IMPORTER" }).lean();

        // Create a promise to wait for the message from the main thread
        await new Promise((resolve, reject) => {
            parentPort.postMessage({
                type: "query",
                query: `
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
                WHERE o.OrderId IN (?);
                `,
                params: [orderIds],
            });

            parentPort.on("message", async (payload) => {

                if (payload.success && payload.type === "query") {
                    const orders = payload.result;
                    console.log(`Order result is received for ${batch}, total records : ${orders.length}`);
                    try {
                        // Process orders and bulk operations here
                        const groupedOrders = orders.reduce((acc, order) => {
                            const orderId = order.OrderId;
                            if (!acc[orderId]) acc[orderId] = [];
                            acc[orderId].push(order);
                            return acc;
                        }, {});

                        const orderBulkOps = [];
                        const orderIdMap = {};
                        const chunkSize = 100;
                        const orderIds = Object.keys(groupedOrders);

                        // Process chunks of orders for bulk operations
                        for (let i = 0; i < orderIds.length; i += chunkSize) {
                            const chunk = orderIds.slice(i, i + chunkSize);
                            chunk.forEach((orderId) => {
                                try {
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
                                    
                                } catch (error) {
                                    //console.error(`Failed to prepare order bulk operation for OrderId ${orderId}:`, error);
                                }
                            });
                
                            try {

                                const orderBulkResult = await orderModel.bulkWrite(orderBulkOps, { ordered: false });                                
                            
                                // Map each original orderId to its new MongoDB _id
                                Object.entries(orderBulkResult.upsertedIds).forEach(([index, mongoId]) => {
                                    // Convert the index to a number to safely access the array element
                                    try {
                                        const originalOrderId = orderBulkOps[index].updateOne.filter.orderId;
                                        orderIdMap[originalOrderId] = mongoId;
                                    } catch (e) {
                                        //console.log(e);
                                    }                                    
                                });

                                orderBulkOps.length = 0; // Clear operations after execution

                            } catch (error) {
                                console.error("Bulk write for orders failed:", error);
                                failed += chunk.length;
                            }
                
                        }

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
                                success += bulkRes.result.length;
                            } catch (error) {
                                failed += chunk.length;
                            }
                        }
                
                        await batchProgressModel.findByIdAndUpdate(batchProgress._id, {
                            $inc: { completedBatch: 1, pendingBatch: -1 },
                        });

                        resolve(); // Resolve the promise when processing is complete
                    } catch (error) {
                        reject(error); // Reject if there's an error in processing
                    }
                }
            });

            // Error handling for message processing
            parentPort.on("error", (error) => {
                console.error("Error in message handling:", error);
                reject(error);
            });
        });

    } catch (error) {
        console.error("Unexpected error in processBatch:", error);
    } finally {
        // Release resources
        await MDBM.close();

        // Trigger garbage collection to clear memory
        if (global.gc) global.gc();

        // Notify the main thread of completion
        parentPort.postMessage({
            type: "completed",
            batch: workerData.batch
        });
    }
}

processBatch(workerData);