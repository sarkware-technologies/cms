import { fork } from 'child_process';
import { Worker } from 'worker_threads';
import EM from "../utils/entity.js";
import ImportType from '../enums/importer-type.js';

export default class ImporterService {

    constructor() {    
        this.orderImporterProcess = null;
        this.retailerImporterProcess = null;
        this.storeImporterProcess = null;
    }

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
            const batchProgressModel = await EM.getModel("cms_background_task_progress");
            return await batchProgressModel.findOne({ type: ImportType.ORDER_IMPORTER }).lean();
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
            const batchProgressModel = await EM.getModel("cms_background_task_progress");
            return await batchProgressModel.findOne({ type: ImportType.RETAILER_IMPORTER }).lean();
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
            const batchProgressModel = await EM.getModel("cms_background_task_progress");
            return await batchProgressModel.findOne({ type: ImportType.STORE_IMPORTER }).lean();
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

    persistBatchOptions = async (_body) => {

        try {
                
            const {
                chunk_size,
                batch_type,
                max_thread,
                record_ids_per_batch,
                records_per_batch
            } = _body;

            if (chunk_size && batch_type && max_thread && record_ids_per_batch && records_per_batch) {                
                
                const batchOptionModel = await EM.getModel("cms_batch_options");
                const batchOption = new batchOptionModel({
                    chunk_size,
                    batch_type,
                    max_thread,
                    record_ids_per_batch,
                    records_per_batch
                });
                await batchOption.save();                

            }

        } catch (e) {
            console.log(e);
        }

    };

    checkImporterStatus = async (_type) => {

        try {

            const batchProgressModel = await EM.getModel("cms_background_task_progress");
            const batchProgress = await batchProgressModel.findOne({ type: _type }).lean();

            return batchProgress.status;

        } catch (e) {
            return false;
        }

    };

}