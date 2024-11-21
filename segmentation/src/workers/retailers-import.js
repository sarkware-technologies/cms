import { parentPort, workerData } from "worker_threads";
import MDBM from "../utils/mongo.js";
import MYDBM from "../utils/mysql.js";
import EM from "../utils/entity.js";
import ImportType from '../enums/importer-type.js';

async function processBatch(data) {

    const { batch, retailerIds, chunkSize } = data;

    try {

        await MDBM.connect();
        await MYDBM.connect(false);       
        
        const modelNames = [
            "cms_master_retailer",
            "cms_retailer_importer_logs",
            "cms_importer_task_status"
        ];

        const models = Object.fromEntries(
            await Promise.all(
                modelNames.map(async name => [name, await EM.getModel(name)])
            )
        ); 

        const batchProgress = await models.cms_importer_task_status.findOne({ type: ImportType.RETAILER_IMPORTER }).lean();

        try {
            await models.cms_importer_task_status.findByIdAndUpdate(batchProgress._id, {
                $max: { currentBatch: batch }
            });
        } catch (e) {
            console.log(e.message);
        }

        const retailers = await MYDBM.queryWithConditions(`
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
            WHERE r.RetailerId IN (?);`
        , [retailerIds]); 
        
        console.log("Fetched retailerfs count : "+ retailers.length);

        for (let i = 0; i < retailers.length; i += chunkSize) {

            const retailerBulkOps = [];            
            const chunk = retailers.slice(i, i + chunkSize);            

            chunk.forEach((retailer) => {

                retailerBulkOps.push({
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
                await models.cms_master_retailer.insertMany(retailerBulkOps, { ordered: false });                
            } catch (e) { 
                
                if (e.writeErrors) {
                    
                    /* Partial failure */

                    const errorLogs = e.writeErrors.map(error => ({
                        retailerId: error.err.op.RetailerId, 
                        retailerName: error.err.op.RetailerName,
                        message: error.err.errmsg || "Unknown error"                        
                    }));

                    try {
                        await models.cms_retailer_importer_logs.insertMany(errorLogs, { ordered: false });
                    } catch (logError) {
                        console.log("Error logging for import retailer itself failed for batch:", batch);
                    }

                } else {
                    
                    /* Complete failure */

                    const errorLogs = chunk.map(retailer => ({
                        retailerId: retailer.RetailerId,
                        retailerName: retailer.retailerName,
                        message: e.message || "Unknown error" 
                    }));

                    try {
                        await models.cms_retailer_importer_logs.insertMany(errorLogs, { ordered: false });
                    } catch (e) {
                        console.log("Error logging for import retailer itself failed for batch : "+ batch);
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