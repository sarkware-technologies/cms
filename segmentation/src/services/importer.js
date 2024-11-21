import { fork } from 'child_process';
import { Worker } from 'worker_threads';
import EM from "../utils/entity.js";
import Utils from '../utils/utils.js';
import ImportType from '../enums/importer-type.js';

export default class ImporterService {

    constructor() {    

        this.orderImporterProcess = null;
        this.retailerImporterProcess = null;
        this.storeImporterProcess = null;

    }

    list = async () => {

        try {

            const importerStatusModel = await EM.getModel("cms_importer_task_status");
            const orderImporterStatus = await importerStatusModel.findOne({ type: ImportType.ORDER_IMPORTER }).lean();
            const storeImporterStatus = await importerStatusModel.findOne({ type: ImportType.STORE_IMPORTER }).lean();
            const retailerImporterStatus = await importerStatusModel.findOne({ type: ImportType.RETAILER_IMPORTER }).lean();

            const importers = [
                {
                    title: "Order Importer",
                    type: ImportType.ORDER_IMPORTER,
                    lastRunning: (orderImporterStatus ? (orderImporterStatus.endTime ? orderImporterStatus.endTime : "None") : "None"),
                    status: (orderImporterStatus ? (orderImporterStatus.status ? "Running" : "Free") : "Free")
                },
                {
                    title: "Store Importer",
                    type: ImportType.STORE_IMPORTER,
                    lastRunning: (storeImporterStatus ? (storeImporterStatus.endTime ? storeImporterStatus.endTime : "None") : "None"),
                    status: (storeImporterStatus ? (storeImporterStatus.status ? "Running" : "Free") : "Free")
                },
                {
                    title: "Retailer Importer",
                    type: ImportType.RETAILER_IMPORTER,
                    lastRunning: (retailerImporterStatus ? (retailerImporterStatus.endTime ? retailerImporterStatus.endTime : "None") : "None"),
                    status: (retailerImporterStatus ? (retailerImporterStatus.status ? "Running" : "Free") : "Free")
                }
            ];

            return Utils.response(importers.length, 1, importers);

        } catch (e) {
            throw e;
        }

    };

    startImport = async(req) => {

        try {

            if (!ImportType[req.query.type]) {
                throw new Error("Unknown importer type");
            }

            if (await this.checkImporterStatus(req.query.type)) {
                return { status: true, message: "Importer process is already running" };
            }

            if (req.body) {
                await this.persistBatchOptions(req.body);
            }

            if (req.query.type == ImportType.ORDER_IMPORTER) {

                if (!this.orderImporterProcess) {
                    this.orderImporterProcess = fork('./src/importers/order-process.js');        
                    
                    this.orderImporterProcess.once('exit', (code) => {
                        console.log(`OrderImporter process exited with code ${code}`);
                        this.orderImporterProcess = null;
                    });
    
                    this.orderImporterProcess.once('error', (error) => {
                        console.error(`Error in OrderImporter process: ${error}`);
                        this.orderImporterProcess = null;
                    });
                }
    
                this.orderImporterProcess.send({ command: 'start' });

            } else if (req.query.type == ImportType.RETAILER_IMPORTER) {

                if (!this.retailerImporterProcess) {
                    this.retailerImporterProcess = fork('./src/importers/retailer-process.js');
                    
                    this.retailerImporterProcess.once('exit', (code) => {
                        console.log(`RetailerImporter process exited with code ${code}`);
                        this.retailerImporterProcess = null;
                    });
    
                    this.retailerImporterProcess.once('error', (error) => {
                        console.error(`Error in RetailerImporter process: ${error}`);
                        this.retailerImporterProcess = null;
                    });
                }
    
                this.retailerImporterProcess.send({ command: 'start' });

            } else {

                if (!this.storeImporterProcess) {
                    this.storeImporterProcess = fork('./src/importers/store-process.js');        
                    
                    this.storeImporterProcess.once('exit', (code) => {
                        console.log(`StoreImporter process exited with code ${code}`);
                        this.storeImporterProcess = null;
                    });
    
                    this.storeImporterProcess.once('error', (error) => {
                        console.error(`Error in StoreImporter process: ${error}`);
                        this.storeImporterProcess = null;
                    });
                }
    
                this.storeImporterProcess.send({ command: 'start' });

            }
            
            return { status: true, message: "Importer process started" };

        } catch (e) {

        }

    };

    stopImport = async(req) => {

        try {

        } catch (e) {

        }

    };

    statusImport = async(req) => {

        try {

        } catch (e) {

        }

    };



    startOrderImport = async (req) => {

        try {

            if (await this.checkImporterStatus(ImportType.ORDER_IMPORTER)) {
                return { status: true, message: "Order importer process is already running" };
            }

            if (req.body) {
                await this.persistBatchOptions(req.body);
            }

            if (!this.orderImporterProcess) {
                this.orderImporterProcess = fork('./src/importers/order-process.js');        
                
                this.orderImporterProcess.once('exit', (code) => {
                    console.log(`OrderImporter process exited with code ${code}`);
                    this.orderImporterProcess = null;
                });

                this.orderImporterProcess.once('error', (error) => {
                    console.error(`Error in OrderImporter process: ${error}`);
                    this.orderImporterProcess = null;
                });
            }

            this.orderImporterProcess.send({ command: 'start' });
            return { status: true, message: "Order importer process started" };

        } catch (e) {
            throw e;
        }

    };

    stopOrderImport = async (req) => {
        try {
            if (this.orderImporterProcess) {
                this.orderImporterProcess.send({ command: 'stop' });
            } else {
                throw new Error("Order process is not found");
            }
            return { status: true, message: "Order importer process stopped" };
        } catch (e) {
            throw e;
        }
    };

    statusOrderImport = async (req) => {
        try {

            const batchProgressModel = await EM.getModel("cms_importer_task_status");
            const progressStatus = await batchProgressModel.findOne({ type: ImportType.ORDER_IMPORTER }).lean();

            if (progressStatus) {
                return { status: true, progressStatus };
            }

            return { status: false, message: "No status found" };

        } catch (e) {
            throw e;
        }
    };

    purgeOrderMaster = async (req) => {
        try {
            const worker = new Worker('./src/workers/master-purge.js', {
                workerData: { task: "ORDER" }
            });
    
            worker.once('exit', (code) => {         
                console.log(`Order purge worker exited with code ${code}`);
            });

            worker.once('error', (error) => {
                console.error(`Error in Order purge worker: ${error}`);
            });
            
            return { status: true, message: "Order master purging process started" };
        } catch (e) {
            throw e;
        }
    };

    orderHistory = async (_req) => {

        try {

            const importerLogModel = await EM.getModel("cms_importer_log");
            const page = parseInt(_req.query.page) || 1;
            const skip = (page - 1) * parseInt(process.env.PAGE_SIZE);
            const limit = parseInt(process.env.PAGE_SIZE);

            const _count = await importerLogModel.countDocuments({ importerType: ImportType.ORDER_IMPORTER });
            const logs = await importerLogModel.find({ importerType: ImportType.ORDER_IMPORTER }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

            return Utils.response(_count, page, logs);

        } catch (e) {
            throw e;
        }

    };

    startRetailerImport = async (req) => {
        
        try {

            if (await this.checkImporterStatus(ImportType.RETAILER_IMPORTER)) {
                return { status: true, message: "Retailer importer process is already running" };
            }

            if (req.body) {
                await this.persistBatchOptions(req.body);
            }

            if (!this.retailerImporterProcess) {
                this.retailerImporterProcess = fork('./src/importers/retailer-process.js');
                
                this.retailerImporterProcess.once('exit', (code) => {
                    console.log(`RetailerImporter process exited with code ${code}`);
                    this.retailerImporterProcess = null;
                });

                this.retailerImporterProcess.once('error', (error) => {
                    console.error(`Error in RetailerImporter process: ${error}`);
                    this.retailerImporterProcess = null;
                });
            }

            this.retailerImporterProcess.send({ command: 'start' });
            return { status: true, message: "Retailer importer process started" };

        } catch (e) {
            throw e;
        }

    };

    stopRetailerImport = async (req) => {
        try {
            if (this.retailerImporterProcess) {
                this.retailerImporterProcess.send({ command: 'stop' });
            } else {
                throw new Error("Retailer process is not found");
            }
            return { status: true, message: "Retailer importer process stopped" };
        } catch (e) {
            throw e;
        }
    };

    statusRetailerImport = async (req) => {

        try {

            const batchProgressModel = await EM.getModel("cms_importer_task_status");
            const progressStatus = await batchProgressModel.findOne({ type: ImportType.RETAILER_IMPORTER }).lean();

            if (progressStatus) {
                return { status: true, progressStatus };
            }

            return { status: false, message: "No status found" };

        } catch (e) {
            throw e;
        }

    };

    purgeRetailerMaster = async (req) => {
        try {
            const worker = new Worker('./src/workers/master-purge.js', {
                workerData: { task: "RETAILER" }
            });
    
            worker.once('exit', (code) => {         
                console.log(`Retailer purge worker exited with code ${code}`);
            });

            worker.once('error', (error) => {
                console.error(`Error in Retailer purge worker: ${error}`);
            });

            return { status: true, message: "Retailer master purging process started" };
        } catch (e) {
            throw e;
        }
    };

    retailerHistory = async (_req) => {

        try {

            const importerLogModel = await EM.getModel("cms_importer_log");
            const page = parseInt(_req.query.page) || 1;
            const skip = (page - 1) * parseInt(process.env.PAGE_SIZE);
            const limit = parseInt(process.env.PAGE_SIZE);

            const _count = await importerLogModel.countDocuments({ importerType: ImportType.RETAILER_IMPORTER });
            const logs = await importerLogModel.find({ importerType: ImportType.RETAILER_IMPORTER }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

            return Utils.response(_count, page, logs);

        } catch (e) {
            throw e;
        }

    };

    startStoreImport = async (req) => {

        try {

            if (await this.checkImporterStatus(ImportType.STORE_IMPORTER)) {
                return { status: true, message: "Store importer process is already running" };
            }

            if (req.body) {
                await this.persistBatchOptions(req.body);
            }

            if (!this.storeImporterProcess) {
                this.storeImporterProcess = fork('./src/importers/store-process.js');        
                
                this.storeImporterProcess.once('exit', (code) => {
                    console.log(`StoreImporter process exited with code ${code}`);
                    this.storeImporterProcess = null;
                });

                this.storeImporterProcess.once('error', (error) => {
                    console.error(`Error in StoreImporter process: ${error}`);
                    this.storeImporterProcess = null;
                });
            }

            this.storeImporterProcess.send({ command: 'start' });
            return { status: true, message: "Store importer process started" };

        } catch (e) {
            throw e;
        }

    };

    stopStoreImport = async (req) => {
        try {
            if (this.storeImporterProcess) {
                this.storeImporterProcess.send({ command: 'stop' });
            } else {
                throw new Error("Store process is not found");
            }
            return { status: true, message: "Store importer process stopped" };
        } catch (e) {
            throw e;
        }
    };

    statusStoreImport = async (req) => {

        try {

            const batchProgressModel = await EM.getModel("cms_importer_task_status");
            const progressStatus = await batchProgressModel.findOne({ type: ImportType.STORE_IMPORTER }).lean();

            if (progressStatus) {
                return { status: true, progressStatus };
            }

            return { status: false, message: "No status found" };

        } catch (e) {
            throw e;
        }

    };

    purgeStoreMaster = async (req) => {
        try {
            const worker = new Worker('./src/workers/master-purge.js', {
                workerData: { task: "STORE" }
            });
    
            worker.once('exit', (code) => {         
                console.log(`Store purge worker exited with code ${code}`);
            });

            worker.once('error', (error) => {
                console.error(`Error in Store purge worker: ${error}`);
            });

            return { status: true, message: "Store master purging process started" };
        } catch (e) {
            throw e;
        }
    };

    storeHistory = async (_req) => {

        try {

            const importerLogModel = await EM.getModel("cms_importer_log");
            const page = parseInt(_req.query.page) || 1;
            const skip = (page - 1) * parseInt(process.env.PAGE_SIZE);
            const limit = parseInt(process.env.PAGE_SIZE);

            const _count = await importerLogModel.countDocuments({ importerType: ImportType.STORE_IMPORTER });
            const logs = await importerLogModel.find({ importerType: ImportType.STORE_IMPORTER }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

            return Utils.response(_count, page, logs);

        } catch (e) {
            throw e;
        }

    };

    persistBatchOptions = async (_body) => {

        try {
                
            const {
                chunkSize,
                batchType,
                maxThread,
                recordIdsPerBatch,
                recordsPerBatch
            } = _body;

            if (chunkSize && batchType && maxThread && recordIdsPerBatch && recordsPerBatch) {                
                
                const batchOptionModel = await EM.getModel("cms_importer_batch_options");
                await batchOptionModel.findOneAndUpdate(
                    { batchType },
                    {            
                        chunkSize,
                        batchType,
                        maxThread,
                        recordIdsPerBatch,
                        recordsPerBatch
                    },
                    { upsert: true, new: true }
                );               

            }

        } catch (e) {
            console.log(e);
        }

    };

    checkImporterStatus = async (_type) => {

        try {

            const batchProgressModel = await EM.getModel("cms_importer_task_status");
            const batchProgress = await batchProgressModel.findOne({ type: _type }).lean();

            return batchProgress.status;

        } catch (e) {
            return false;
        }

    };

}