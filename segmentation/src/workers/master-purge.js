const purgeOrders = async () => {

    try {
        const orderModels = [
            await EM.getModel("cms_master_order"),
            await EM.getModel("cms_master_order_item"),
        ];
        const logModels = [
            await EM.getModel("cms_order_importer_log"),
            await EM.getModel("cms_order_item_importer_log"),
        ];

        await Promise.all([
            ...orderModels.map((model) => model.deleteMany({})),
            ...logModels.map((model) => model.deleteMany({})),
        ]);

        const batchProgressModel = await EM.getModel("cms_importer_task_status");
        await batchProgressModel.deleteOne({ type: ImportType.ORDER_IMPORTER });

        console.log("Order purge completed successfully.");
    } catch (e) {
        console.error("Error during order purge:", e);
    }

};

const purgeRetailers = async () => {

    try {
        const retailerModel = await EM.getModel("cms_master_retailer");
        const logModel = await EM.getModel("cms_retailer_importer_logs");

        await Promise.all([
            retailerModel.deleteMany({}),
            logModel.deleteMany({}),
        ]);

        const batchProgressModel = await EM.getModel("cms_importer_task_status");
        await batchProgressModel.deleteOne({ type: ImportType.RETAILER_IMPORTER });

        console.log("Retailer purge completed successfully.");
    } catch (e) {
        console.error("Error during retailer purge:", e);
    }

};

const purgeStores = async () => {

    try {
        const storeModel = await EM.getModel("cms_master_store");
        const logModel = await EM.getModel("cms_store_importer_logs");

        await Promise.all([
            storeModel.deleteMany({}),
            logModel.deleteMany({}),
        ]);

        const batchProgressModel = await EM.getModel("cms_importer_task_status");
        await batchProgressModel.deleteOne({ type: ImportType.STORE_IMPORTER });

        console.log("Store purge completed successfully.");
    } catch (e) {
        console.error("Error during store purge:", e);
    }

};

const closeDatabase = async () => {

    try {
        await MDBM.close();
        console.log("Database connection closed.");
    } catch (closeError) {
        console.error("Error during database cleanup:", closeError);
    }

};

const taskMap = {
    ORDER: purgeOrders,
    RETAILER: purgeRetailers,
    STORE: purgeStores,
};

const processBatch = async (data) => {

    try {
        
        await MDBM.connect();
        const { task } = data;
        const taskFunction = taskMap[task];

        if (taskFunction) {
            await taskFunction();
        } else {
            console.error(`Unknown task type: ${task}`);
        }

    } catch (e) {
        console.error("Error during task processing:", e);
    } finally {
        await closeDatabase();
        process.exit(0);
    }

};

processBatch(workerData);