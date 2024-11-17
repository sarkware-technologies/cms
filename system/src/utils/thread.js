import { parentPort, workerData } from "worker_threads";
import XlsManager from "./xls-manager.js";
import OfferManager from "./offer-manager.js";
import VersionToggler from "./version-update.js";

const {file, user} = workerData;
const xlsManager = new XlsManager(parentPort);
const offerManager = new OfferManager(parentPort);
const versionManager = new VersionToggler(parentPort);

parentPort.on("message", (message) => {

    if (message.action === "component") {
        xlsManager.processUpload(file, user);
    } else if (message.action === "offer") {
        offerManager.processUpload(file, user);
    } else if (message.action === "version_update") {
        versionManager.processUpdate(file, user);
    }

});