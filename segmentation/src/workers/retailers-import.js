import { parentPort, workerData } from "worker_threads";
import MDBM from "./mongo.js";
import MYDBM from "./mysql.js";
import EM from "./entity.js";
import ImportType from '../enums/importer-type.js';

async function processBatch(data) {

    const { batch, retailerIds } = data;    

    try {

        await MDBM.connect();
        await MYDBM.connect(false);

        const retailerBulkOps = [];        
        const chunkSize = 100;

        const retailerModel = await EM.getModel("cms_master_retailer");        
        const importLogModel = await EM.getModel("cms_retailer_importer_logs");        
        const batchProgressModel = await EM.getModel("cms_background_task_progress");        
        const batchProgress = await batchProgressModel.findOne({ type: ImportType.RETAILER_IMPORTER }).lean();

        try {
            await batchProgressModel.findByIdAndUpdate(batchProgress._id, {
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

        for (let i = 0; i < retailers.length; i += chunkSize) {

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
                await retailerModel.insertMany(retailerBulkOps, { ordered: false });                
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

            retailerBulkOps.length = 0;

        }

        try {
            await batchProgressModel.findByIdAndUpdate(batchProgress._id, {
                $inc: { completedBatch: 1, pendingBatch: -1 },
            });
        } catch (e) {
            console.log(e.message);
        }
        
        retailerBulkOps.length = 0;

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