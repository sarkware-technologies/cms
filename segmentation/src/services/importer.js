import { Worker } from 'worker_threads';
import MYDBM from "../utils/mysql.js";
import EM from "../utils/entity.js"
import Utils from "../utils/utils.js";

import OrderImporter from "../importers/orders-import.js";


export default class ImporterService {

    constructor() {    

    }

    startOrderImport = () => {

    };

    stopOrderImport = () => {

    };

    statusOrderImport = () => {

    };

    purgeOrderMaster = () => {

    };

    startRetailerImport = () => {

    };

    stopRetailerImport = () => {

    };

    statusRetailerImport = () => {
        
    };

    purgeRetailerMaster = () => {
        
    };

    startStoreImport = () => {

    };

    stopStoreImport = () => {

    };

    statusStoreImport = () => {
        
    };

    purgeStoreMaster = () => {
        
    };

}