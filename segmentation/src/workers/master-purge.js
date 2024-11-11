import { workerData } from "worker_threads";
import MDBM from "../utils/mongo.js";
import EM from "../utils/entity.js";
import ImportType from "../enums/importer-type.js";

const processBatch = async (data) => {
    const { task } = data;
    
    if (task === "ORDER") {
        await purgeOrders();
    } else if (task === "RETAILER") {
        await purgeRetailers();
    } else if (task === "STORE") {
        await purgeStores();
    } else {
        console.error(`Unknown task type: ${task}`);
    }
};

const purgeOrders = async () => {
    try {
        await MDBM.connect();

        const orderModel = await EM.getModel("cms_master_order");
        const orderItemModel = await EM.getModel("cms_master_order_item"); 
        const orderLogModel = await EM.getModel("cms_order_importer_log");
        const orderItemLogModel = await EM.getModel("cms_order_item_importer_log");        
        const batchProgressModel = await EM.getModel("cms_background_task_progress");

        console.log("Deleting all orders and related logs...");
        await orderItemModel.deleteMany({});
        await orderModel.deleteMany({});
        await orderItemLogModel.deleteMany({});
        await orderLogModel.deleteMany({});
        await batchProgressModel.deleteOne({ type: ImportType.ORDER_IMPORTER });

        console.log("Order purge completed successfully.");
    } catch (e) {
        console.error("Error during order purge:", e);
    } finally {
        await closeDatabase();
    }
};

const purgeRetailers = async () => {
    try {
        await MDBM.connect();

        const retailerModel = await EM.getModel("cms_master_retailer");
        const importLogModel = await EM.getModel("cms_retailer_importer_logs");   
        const batchProgressModel = await EM.getModel("cms_background_task_progress");

        console.log("Deleting all retailers and related logs...");
        await retailerModel.deleteMany({});
        await importLogModel.deleteMany({});
        await batchProgressModel.deleteOne({ type: ImportType.RETAILER_IMPORTER });

        console.log("Retailer purge completed successfully.");
    } catch (e) {
        console.error("Error during retailer purge:", e);
    } finally {
        await closeDatabase();
    }
};

const purgeStores = async () => {
    try {
        await MDBM.connect();

        const storeModel = await EM.getModel("cms_master_store");
        const importLogModel = await EM.getModel("cms_store_importer_logs");    
        const batchProgressModel = await EM.getModel("cms_background_task_progress");

        console.log("Deleting all stores and related logs...");
        await storeModel.deleteMany({});
        await importLogModel.deleteMany({});
        await batchProgressModel.deleteOne({ type: ImportType.STORE_IMPORTER });

        console.log("Store purge completed successfully.");
    } catch (e) {
        console.error("Error during store purge:", e);
    } finally {
        await closeDatabase();
    }
};

const closeDatabase = async () => {
    try {
        await MDBM.close();
        console.log("Database connection closed.");
    } catch (closeError) {
        console.error("Error during database cleanup:", closeError);
    } finally {
        process.exit(0); 
    }
};

processBatch(workerData);