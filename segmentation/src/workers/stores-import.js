import { workerData } from "worker_threads";
import MDBM from "../utils/mongo.js";
import MYDBM from "../utils/mysql.js";
import EM from "../utils/entity.js";
import ImportType from '../enums/importer-type.js';

async function processBatch(data) {

    const models = {};
    const { batch, storeIds, chunkSize } = data;    

    try {

        await MDBM.connect();
        await MYDBM.connect(false);

        const modelNames = [
            "cms_master_store",
            "cms_store_importer_logs",
            "cms_importer_task_status"
        ];

        models = Object.fromEntries(
            await Promise.all(
                modelNames.map(async name => [name, await EM.getModel(name)])
            )
        );  

        const batchProgress = await models.cms_importer_task_status.findOne({ type: ImportType.STORE_IMPORTER }).lean();

        try {
            await models.cms_importer_task_status.findByIdAndUpdate(batchProgress._id, {
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

            const storeBulkOps = [];       
            const chunk = stores.slice(i, i + chunkSize);

            chunk.forEach((store) => {

                storeBulkOps.push({                    
                    isAuthorized: store.Status == "Active" ? true : false,                     
                    status: store.Status, 
                    storeId: store.StoreId, 
                    storeName: store.StoreName, 
                    storeCode: store.StoreCode 
                }); 

            });

            try {
                await models.cms_master_store.insertMany(storeBulkOps, { ordered: false });                
            } catch (e) { 
                
                if (e.writeErrors) {
                    
                    /* Partial failure */

                    const errorLogs = e.writeErrors.map(error => ({
                        storeId: error.err.op.StoreId, 
                        storeName: error.err.op.storeName,
                        message: error.err.errmsg || "Unknown error"                        
                    }));

                    try {
                        await models.cms_store_importer_logs.insertMany(errorLogs, { ordered: false });
                    } catch (logError) {
                        console.log("Error logging for import store itself failed for batch:", batch);
                    }

                } else {
                    
                    /* Complete failure */

                    const errorLogs = chunk.map(store => ({
                        storeId: store.storeId,
                        storeName: store.storeName,
                        message: e.message || "Unknown error" 
                    }));

                    try {
                        await models.cms_store_importer_logs.insertMany(errorLogs, { ordered: false });
                    } catch (e) {
                        console.log("Error logging for import store itself failed for batch : "+ batch);
                    }

                }

            }

        }

        try {
            await models.cms_importer_task_status.findByIdAndUpdate(batchProgress._id, {
                $inc: { completedBatch: 1, pendingBatch: -1 },
            });
        } catch (e) {
            console.log(e.message);
        }        

    } catch (e) {        
        console.log(e);
    } finally {

        try {

            await Promise.all([MDBM.close(), MYDBM.close()]);
            process.exit(0);

        } catch (closeError) {
            console.error("Error during cleanup:", closeError);
        }        

    }
}

processBatch(workerData);