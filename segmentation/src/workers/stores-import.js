import { parentPort, workerData } from "worker_threads";
import MDBM from "./mongo.js";
import MYDBM from "./mysql.js";
import EM from "./entity.js";
import ImportType from '../enums/importer-type.js';

async function processBatch(data) {

    const { batch, storeIds } = data;    

    try {

        await MDBM.connect();
        await MYDBM.connect(false);

        const storeBulkOps = [];        
        const chunkSize = 100;

        const storeModel = await EM.getModel("cms_master_store");        
        const importLogModel = await EM.getModel("cms_store_importer_logs");        
        const batchProgressModel = await EM.getModel("cms_background_task_progress");        
        const batchProgress = await batchProgressModel.findOne({ type: ImportType.STORE_IMPORTER }).lean();

        try {
            await batchProgressModel.findByIdAndUpdate(batchProgress._id, {
                $max: { currentBatch: batch }
            });
        } catch (e) {
            console.log(e.message);
        }

        const stores = await MYDBM.queryWithConditions(`
            select 
                s.StoreId, 
                s.StoreName, 
                s.StoreCode, 
                s.Status 
                from stores s 
            WHERE s.StoreId IN (?);`
        , [storeIds]);   

        for (let i = 0; i < stores.length; i += chunkSize) {

            const chunk = stores.slice(i, i + chunkSize);

            chunk.forEach((retailer) => {

                storeBulkOps.push({
                    Address1: retailer.Address1, 
                    Address2: retailer.Address2, 
                    City: retailer.City, 
                    Email: retailer.Email, 
                    IsAuthorized: retailer.IsAuthorized, 
                    MobileNumber: retailer.MobileNumber, 
                    Pincode: retailer.Pincode, 
                    RegionId: retailer.RegionId, 
                    RetailerId: retailer.RetailerId, 
                    RetailerName: retailer.RetailerName, 
                    StateId: retailer.StateId 
                }); 

            });

            try {
                await storeModel.insertMany(storeBulkOps, { ordered: false });                
            } catch (e) { 
                
                console.log(e);
                
                if (e.writeErrors) {
                    
                    /* Partial failure */

                    const errorLogs = e.writeErrors.map(error => ({                        
                        retailerId: error.getOperation().RetailerId,
                        retailerName: error.getOperation().retailerName,
                        message: error.errmsg || "Unknown error"                        
                    }));

                    try {
                        await importLogModel.insertMany(errorLogs, { ordered: false });
                    } catch (e) {
                        console.log("Error logging for import retailer itself failed for batch : "+ batch);
                    }

                } else {
                    
                    /* Complete failure */

                    const errorLogs = chunk.map(retailer => ({
                        retailerId: retailer.RetailerId,
                        retailerName: retailer.retailerName,
                        message: error.errmsg || "Unknown error" 
                    }));

                    try {
                        await importLogModel.insertMany(errorLogs, { ordered: false });
                    } catch (e) {
                        console.log("Error logging for import retailer itself failed for batch : "+ batch);
                    }

                }

            }

            storeBulkOps.length = 0;

        }

        try {
            await batchProgressModel.findByIdAndUpdate(batchProgress._id, {
                $inc: { completedBatch: 1, pendingBatch: -1 },
            });
        } catch (e) {
            console.log(e.message);
        }
        
        storeBulkOps.length = 0;

    } catch (e) {        
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