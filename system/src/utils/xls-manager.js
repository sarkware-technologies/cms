import dotenv from "dotenv";
dotenv.config();

import moment from "moment";
import fs from "fs";
import ExcelJS from 'exceljs';
import readXlsxFile from "read-excel-file/node";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

import DBM from "./mongo.js";
import EM from './entity.js';

/**
 * 
 * row[0]       = COMPONENT TYPE
 * row[1]       = COMPONENT SUB TYPE
 * row[2]       = COMPONENT UID
 * row[3]       = TITLE
 * row[4]       = SUB TITLE  
 * row[5]       = PRIORITY
 * row[6]       = MOBILE ASSET
 * row[7]       = WEB ASSET
 * row[8]       = TARGET TYPE
 * row[9]       = TARGET URL 
 * row[10]      = FLY_CAMPAIGN ID
 * row[11]      = START DATE
 * row[12]      = END DATE
 * row[13]      = RULE TYPE
 * row[14]      = INCLUDE
 * row[15]      = EXCLUDE
 * row[16]      = PAGE
 * row[17]      = POSITION 
 * row[18]      = STATUS
 * 
 */
export default class XlsManager {

    constructor (_parentPort) {
        
        this.parentPort = _parentPort;
        this.uploadId = null;    

        this.uploadModel = null;
        this.uploadComponentModel = null;
        this.pageModel = null;
        this.componentModel = null;
        this.componentTypeModel = null;
        this.pageComponentMappingModel = null;        

        this.rowIndex = 0;
        this.rowKey = "";
        this.currentRow = [];
        this.allRows = [];

        this.validationMessage = "";
        
        this.succeed = 0;
        this.failed = 0;
        this.updated = 0;

        this.failedSummary = {};
        this.componentTypes = [];

        this.currentType = {};
        this.currentTypeConfig = {};

        this.currentStartDate = null;
        this.currentEndDate = null;

        this.currentCID = null;        

        /* It could be either "fresh" or "incremental" */
        this.uploadMode = "fresh";

        this.isUpdate = false;

        this.s3Client = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY,
                secretAccessKey: process.env.AWS_SECRET_KEY
            },
        });

    }

    processUpload = async (_file, _user) => {

        try {

            await DBM.connect();
            await EM.reloadEntityCache();

            this.pageModel = await EM.getModel("page");
            if (!this.pageModel) {                
                this.parentPort.postMessage({ error: "Page model not found" });
                return;
            }            

            this.uploadModel = await EM.getModel("upload");
            if (!this.uploadModel) {                
                this.parentPort.postMessage({ error: "Upload model not found" });
                return;
            }            

            this.componentModel = await EM.getModel("component");
            if (!this.componentModel) {                
                this.parentPort.postMessage({ error: "Component model not found" });
                return;
            };

            this.componentTypeModel = await EM.getModel("component_type");
            if (!this.componentTypeModel) {                
                this.parentPort.postMessage({ error: "Component type model not found" });
                return;
            };

            this.componentTypes = await this.componentTypeModel.find({}).lean();
            if (!this.componentTypes && !Array.isArray(this.componentTypes)) {
                this.parentPort.postMessage({ error: "Prepare component type list operation failed" });
                return;
            }

            this.uploadComponentModel = await EM.getModel("uploaded_component");
            if (!this.uploadComponentModel) {
                this.parentPort.postMessage({ error: "Upload component model not found" });
                return;
            }

            this.pageComponentMappingModel = await EM.getModel("page_component_mapping");
            if (!this.pageComponentMappingModel) {
                this.parentPort.postMessage({ error: "Page component mapping model not found" });
                return;
            } 

            const params = {
                Bucket: process.env.AWS_BUCKET,
                Key: process.env.AWS_BUCKET_EXCEL_FOLDER +"/"+ _file.originalname,
                Body: _file.buffer,
                ContentType: _file.mimetype,
                ACL: 'public-read', 
            };

            const command = new PutObjectCommand(params);
            await this.s3Client.send(command);            
            const publicUrl = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_BUCKET_EXCEL_FOLDER}/${_file.originalname}`;

            /* Check the file name, whether it is new or incremental */
            fs.writeFileSync('temp.xlsx', _file.buffer);
            
            //this.allRows = await this.readExcelFileToArray('temp.xlsx');
            this.allRows = await readXlsxFile('temp.xlsx');

            fs.unlinkSync('temp.xlsx');

            /* Before that check the file already uploaded */
            let uploadObj = await this.uploadModel.findOne({file: _file.originalname}).lean();
            if (uploadObj) {

                this.uploadId = uploadObj._id;
                /* Increase the reupload count */
                let reuploadCount = uploadObj["re_uploaded"]; 
                reuploadCount = !isNaN(reuploadCount) ? reuploadCount : 0;
                reuploadCount++;
                await this.uploadModel.findByIdAndUpdate(this.uploadId, { $set: { re_uploaded: reuploadCount } }, {runValidators: true, new: true });

            } else { 
                uploadObj = new this.uploadModel({
                    file: _file.originalname,
                    url: publicUrl,
                    upload_date: Date.now(),
                    succeed: 0,
                    failed: 0,
                    updated: 0,
                    total: (this.allRows.length - 1),
                    re_uploaded: 0,
                    uploader: _user,
                    note: "Import process started"
                });
                const _uploadRecord = await uploadObj.save();
                this.uploadId = _uploadRecord._id;
            }

            let dateRangeCheck = null;

            /* Start with index 1 - needs to skip header */
            for (this.rowIndex = 1; this.rowIndex < this.allRows.length; this.rowIndex++) {

                this.currentCID = null;
                this.isUpdate = false;
                this.currentRow = this.allRows[this.rowIndex];
                this.rowKey = this.currentRow[2];

                if (!this.rowKey) {
                    this.failed++;
                    this.failedSummary["row_"+ this.rowIndex] = "Unique name not found";                                        
                    continue;
                }

                if (await this.assertComponent(this.currentRow)) {

                    this.currentType = this.getComponentType(this.currentRow[0]);
                    if (!this.currentType) {
                        this.failed++;
                        this.failedSummary["row_"+ this.rowIndex] = "Invalid component type"; 
                        continue;
                    }

                    this.currentTypeConfig = this.getDefaultConfiguration(this.currentRow[0]);

                    this.currentStartDate = moment(this.currentRow[11], 'DD-MM-YYYY').startOf('day');
                    this.currentEndDate = moment(this.currentRow[12], 'DD-MM-YYYY').startOf('day');

                    if (!this.currentStartDate.isValid()) {
                        this.failed++;
                        this.failedSummary["row_"+ this.rowIndex] = "Invalid start date"; 
                        continue;
                    }

                    if (!this.currentEndDate.isValid()) {
                        this.failed++;
                        this.failedSummary["row_"+ this.rowIndex] = "Invalid end date"; 
                        continue;
                    }

                    dateRangeCheck = this.validateStartEndDate();
                    if (dateRangeCheck && !dateRangeCheck[0]) {
                        this.failed++;
                        this.failedSummary["row_"+ this.rowIndex] = dateRangeCheck[1]; 
                        continue;
                    }                    

                    if (this.currentRow[0].trim() == "carousel") {
                        await this.processCarousel();               
                    } else if (this.currentRow[0].trim() == "top_widget") {
                        await this.processTopWidget();
                        /* Map the component to pages */
                        if (this.currentCID) {
                            await this.mapComponentPages();
                        }
                    } else if (this.currentRow[0].trim() == "card") {
                        await this.processCardWidget();
                    } else if (this.currentRow[0].trim() == "reward") {
                        await this.processReward();
                        /* Map the component to pages */
                        if (this.currentCID) {
                            await this.mapComponentPages();
                        }
                    } else if (this.currentRow[0].trim() == "feedback") {
                        await this.processFeedBack();
                        /* Map the component to pages */
                        if (this.currentCID) {
                            await this.mapComponentPages();
                        }
                    } else if (this.currentRow[0].trim() == "product_offer") {
                        await this.processProductWidget();
                    } else if (this.currentRow[0].trim() == "image") {
                        await this.processImage();
                        /* Map the component to pages */
                        if (this.currentCID) {
                            await this.mapComponentPages();
                        }
                    } else if (this.currentRow[0].trim() == "video") {
                        await this.processVideo();
                        /* Map the component to pages */
                        if (this.currentCID) {
                            await this.mapComponentPages();
                        }
                    } else if (this.currentRow[0].trim() == "crm_bar") {
                        await this.processCrmBar();                        
                    } else if (this.currentRow[0].trim() == "notification") {
                        await this.processNotification();
                        /* Map the component to pages */
                        if (this.currentCID) {
                            await this.mapComponentPages();
                        }
                    } else {
                        /* Unknown type */
                        this.failed++;
                        this.failedSummary["row_"+ this.rowIndex] = "Unknown component type : "+ this.currentRow[0];                                            
                    }                    

                } else {
                    this.failed++;
                    this.failedSummary["row_"+ this.rowIndex] = this.validationMessage;                                        
                }

                if (this.isUpdate) {
                    this.updated++;                
                } else {
                    this.succeed++;                
                }                

            }

        } catch (_e) {

            /* Store the exception message on the upload record] */
            if (this.uploadId && this.uploadModel) {
                await this.uploadModel.findByIdAndUpdate(this.uploadId, { $set: { error_summary: this.failedSummary, succeed: this.succeed, failed: this.failed, updated: this.updated, note: _e.message } }, {runValidators: true, new: true });
            }

            this.parentPort.postMessage({ error: _e.message }); 

        }

        if (this.uploadId && this.uploadModel) {
            await this.uploadModel.findByIdAndUpdate(this.uploadId, { $set: { error_summary: this.failedSummary, succeed: this.succeed, failed: this.failed, updated: this.updated, note: "Import process completed" } }, {runValidators: true, new: true });
        }

        /* Update the summary */
        this.parentPort.postMessage({ message: "Import process completed" });                     

    };

    getProgress = async () => {
        return {
            succeed: this.succeed,
            failed: this.failed,
            updated: this.updated            
        };
    };

    processCrmBar = async () => {

        try {

            const items = this.getChildItems(this.currentRow[2]);            
            let crmConfig = JSON.parse(JSON.stringify(this.currentTypeConfig));

            /* Determine the start & end date of this carousel */
            const [startDate, endDate] = await this.determineParentStartEndDate(items);

            if (!startDate) {
                this.failed++;
                this.failedSummary["row_"+ this.rowIndex] = "Invalid start date (CRM Parent Component)";                 
                return;
            }

            if (!endDate) {
                this.failed++;
                this.failedSummary["row_"+ this.rowIndex] = "Invalid end date (CRM Parent Component)";                 
                return;
            }

            /* Register parent component */
            let payload = {};
            payload["title"] = items[0][3] ? items[0][3] : items[0][2];
            payload["sub_title"] = items[0][4];
            payload["handle"] = items[0][2];
            payload["type"] = this.currentType._id;            
            payload["status"] = items[0][18] == 1 ? true : false;
            payload["start_date"] = startDate;
            payload["end_date"] = endDate;
            payload["configuration"] = {};
                        
            let crm = await this.componentModel.findOne({handle: payload["handle"]}).lean(); 

            if (crm) { 
                
                this.isUpdate = true;               
                crmConfig = crm.configuration;                                                  

                if (typeof crmConfig == 'string') {
                    try {
                        crmConfig = JSON.parse(crmConfig);
                    } catch (_e) {
                        crmConfig = JSON.parse(JSON.stringify(this.currentTypeConfig)); 
                    }                    
                }
                await this.componentModel.findByIdAndUpdate(crm._id, { $set: { ...payload } }, {runValidators: true, new: true });
            } else {
                const crmObj = new this.componentModel(payload);
                crm = await crmObj.save();                             
            }

            this.currentCID = crm._id;        
            await this.mapComponentPages();

            /* Register child component */

            if (crm) {  

                if (!this.isUpdate) {
                    const ucObj = new this.uploadComponentModel({
                        upload: this.uploadId,
                        component: crm._id
                    });
                    await ucObj.save();
                }                
                
                let childrens = [];
                let crmItem = null;
                let crmItemObj = null;
                let dateRangeCheck = [];
                const crmItemType = this.getComponentType("crm_bar_item");
                
                for (let i = 0; i < items.length; i++) {

                    this.currentRow = this.allRows[this.rowIndex];

                    if (await this.assertComponent(this.currentRow)) {

                        this.currentStartDate = moment(items[i][11], 'DD-MM-YYYY').startOf('day');
                        this.currentEndDate = moment(items[i][12], 'DD-MM-YYYY').startOf('day');

                        if (!this.currentStartDate.isValid()) {
                            this.failed++;
                            this.failedSummary["row_"+ this.rowIndex] = "Invalid start date";
                            continue;
                        }

                        if (!this.currentEndDate.isValid()) {
                            this.failed++;
                            this.failedSummary["row_"+ this.rowIndex] = "Invalid end date";
                            continue;
                        }

                        dateRangeCheck = this.validateStartEndDate();
                        if (dateRangeCheck && !dateRangeCheck[0]) {
                            this.failed++;
                            this.failedSummary["row_"+ this.rowIndex] = dateRangeCheck[1]; 
                            continue;
                        }

                        payload = {};
                        payload["parent"] = crm._id;
                        payload["title"] = items[i][3] ? (items[i][3] +" - "+ (i + 1)) : (items[i][2] +" - "+ (i + 1));
                        payload["sub_title"] = items[i][4];
                        payload["handle"] = items[i][2] +"_"+ (i + 1);
                        payload["type"] = crmItemType._id;                        
                        payload["status"] = items[i][18] == 1 ? true : false;
                        payload["start_date"] = this.currentStartDate.toDate();
                        payload["end_date"] = this.currentEndDate.toDate();
                        
                        payload["configuration"] = {
                            label: "",                            
                            asset_url: items[i][6],
                            link_type: items[i][8],
                            link_to: items[i][9],                            
                            options: {}
                        };

                        crmItem = await this.componentModel.findOne({handle:  payload["handle"]}).lean();
                        if (crmItem) {                
                            await this.componentModel.findByIdAndUpdate(crmItem._id, { $set: { ...payload } }, {runValidators: true, new: true });
                            if (i > 0) {
                                this.updated++;
                            }
                        } else {
                            crmItemObj = new this.componentModel(payload); 
                            crmItem = await crmItemObj.save();
                            if (i > 0) {
                                this.succeed++;
                            }
                        }                        

                        if (crmItem) {
                            childrens.push(crmItem._id);
                            await this.prepareComponentMappingRule(crmItem._id);
                        }

                    } else {
                        this.failed++;
                        this.failedSummary["row_"+ this.rowIndex] = this.validationMessage;                                            
                    }

                    /* Increase the global row index */
                    if (i > 0) {
                        this.rowIndex++;
                    }

                }

                crmConfig["sequence"] = childrens;
                await this.componentModel.findByIdAndUpdate(crm._id, { $set: { configuration: crmConfig } }, {runValidators: true, new: true });

            } else {
                this.failed++;
                this.failedSummary["row_"+ this.rowIndex] = "Unexpected reason, component failed to create";   
            }

        } catch (_e) { 
            this.failed++;
            this.failedSummary["row_"+ this.rowIndex] = _e.message;                                
        }
        
    }; 

    processCarousel = async () => {

        try {
            
            const items = this.getChildItems(this.currentRow[2]);            
            let carouselConfig = JSON.parse(JSON.stringify(this.currentTypeConfig));

            /* Determine the start & end date of this carousel */
            const [startDate, endDate] = await this.determineParentStartEndDate(items);

            if (!startDate) {
                this.failed++;
                this.failedSummary["row_"+ this.rowIndex] = "Invalid start date (Carousel Parent Component)";                 
                return;
            }

            if (!endDate) {
                this.failed++;
                this.failedSummary["row_"+ this.rowIndex] = "Invalid end date (Carousel Parent Component)";                 
                return;
            }

            /* Register parent component */
            let payload = {};
            payload["title"] = items[0][3] ? items[0][3] : items[0][2];
            payload["sub_title"] = items[0][4];
            payload["handle"] = items[0][2];
            payload["type"] = this.currentType._id.toString();            
            payload["status"] = items[0][18] == 1 ? true : false;
            payload["start_date"] = startDate;
            payload["end_date"] = endDate;
            payload["configuration"] = {};  

            let carousel = await this.componentModel.findOne({handle: payload["handle"]}).lean();
            if (carousel) {

                this.isUpdate = true;
                carouselConfig = carousel.configuration;                                

                if (typeof carouselConfig == 'string') {
                    try {
                        carouselConfig = JSON.parse(carouselConfig);
                    } catch (_e) {
                        carouselConfig = JSON.parse(JSON.stringify(this.currentTypeConfig)); 
                    }                    
                }              
                await this.componentModel.findByIdAndUpdate(carousel._id, { $set: { ...payload } }, {runValidators: true, new: true });
            } else { 
                const carouselObj = new this.componentModel(payload);
                carousel = await carouselObj.save();                                
            }

            this.currentCID = carousel._id; 
            await this.mapComponentPages();

            /* Register child component */

            if (carousel) {  

                if (!this.isUpdate) {
                    const ucObj = new this.uploadComponentModel({
                        upload: this.uploadId,
                        component: carousel._id
                    });
                    await ucObj.save();
                }                
                
                let childrens = [];
                let carouselItem = null;
                let carouselItemObj = null;
                let dateRangeCheck = [];
                const carouselItemType = this.getComponentType("carousel_item");
                
                for (let i = 0; i < items.length; i++) {              

                    this.currentRow = this.allRows[this.rowIndex];

                    if (await this.assertComponent(items[i])) {

                        this.currentStartDate = moment(items[i][11], 'DD-MM-YYYY').startOf('day');
                        this.currentEndDate = moment(items[i][12], 'DD-MM-YYYY').startOf('day');

                        if (!this.currentStartDate.isValid()) {
                            this.failed++;
                            this.failedSummary["row_"+ this.rowIndex] = "Invalid start date";
                            continue;
                        }

                        if (!this.currentEndDate.isValid()) {
                            this.failed++;
                            this.failedSummary["row_"+ this.rowIndex] = "Invalid end date";
                            continue;
                        }

                        dateRangeCheck = this.validateStartEndDate();
                        if (dateRangeCheck && !dateRangeCheck[0]) {
                            this.failed++;
                            this.failedSummary["row_"+ this.rowIndex] = dateRangeCheck[1]; 
                            continue;
                        }

                        payload = {};
                        payload["parent"] = carousel._id.toString();
                        payload["title"] = items[i][3] ? (items[i][3] +" - "+ (i + 1)) : (items[i][2] +" - "+ (i + 1));
                        payload["sub_title"] = items[i][4];
                        payload["handle"] = items[i][2] +"_"+ (i + 1);
                        payload["type"] = carouselItemType._id.toString();                        
                        payload["status"] = items[i][18] == 1 ? true : false;
                        payload["start_date"] = this.currentStartDate.toDate();
                        payload["end_date"] = this.currentEndDate.toDate();
                        
                        payload["configuration"] = {
                            label: "",
                            asset_type: items[i][1],
                            web_asset_url: items[i][7],
                            mobile_asset_url: items[i][6],
                            link_type: items[i][8],
                            link_to: items[i][9],                            
                            options: {}
                        };

                        carouselItem = await this.componentModel.findOne({handle:  payload["handle"]}).lean();
                        if (carouselItem) {                
                            await this.componentModel.findByIdAndUpdate(carouselItem._id, { $set: { ...payload } }, {runValidators: true, new: true });
                            if (i > 0) {
                                this.updated++;                
                            }
                        } else {
                            carouselItemObj = new this.componentModel(payload); 
                            carouselItem = await carouselItemObj.save();
                            if (i > 0) {
                                this.succeed++;  
                            }                                          
                        } 

                        if (carouselItem) {
                            childrens.push(carouselItem._id);
                            await this.prepareComponentMappingRule(carouselItem._id);
                        }

                    } else {
                        this.failed++;
                        this.failedSummary["row_"+ this.rowIndex] = this.validationMessage;                                            
                    }

                    /* Increase the global row index */
                    if (i > 0) {
                        this.rowIndex++;
                    }

                }

                carouselConfig["sequence"] = childrens;
                await this.componentModel.findByIdAndUpdate(carousel._id, { $set: { configuration: carouselConfig } }, {runValidators: true, new: true });

            } else {
                this.failed++;
                this.failedSummary["row_"+ this.rowIndex] = "Unexpected reason, component failed to create";   
            }

        } catch (_e) {
            this.failed++;
            this.failedSummary["row_"+ this.rowIndex] = _e.message;                                
        }      

    }; 
    
    processCardWidget = async () => {

        try {

            const items = this.getChildItems(this.currentRow[2]);            
            let cardConfig = JSON.parse(JSON.stringify(this.currentTypeConfig));

            /* Determine the start & end date of this carousel */
            const [startDate, endDate] = await this.determineParentStartEndDate(items);

            if (!startDate) {
                this.failed++;
                this.failedSummary["row_"+ this.rowIndex] = "Invalid start date (Card Parent Component)";                 
                return;
            }

            if (!endDate) {
                this.failed++;
                this.failedSummary["row_"+ this.rowIndex] = "Invalid end date (Card Parent Component)";                 
                return;
            }
            
            /* Register parent component */
            let payload = {};
            payload["title"] = items[0][3] ? items[0][3] : items[0][2] ;
            payload["sub_title"] = items[0][4];
            payload["handle"] = items[0][2];
            payload["type"] = this.currentType._id;            
            payload["status"] = items[0][18] == 1 ? true : false;
            payload["start_date"] = startDate;
            payload["end_date"] = endDate;
            payload["configuration"] = {};

            let card = await this.componentModel.findOne({handle: payload["handle"]}).lean();
            if (card) { 

                this.isUpdate = true;
                cardConfig = card.configuration;                        

                if (typeof cardConfig == 'string') {
                    try {
                        cardConfig = JSON.parse(cardConfig);
                    } catch (_e) {
                        cardConfig = JSON.parse(JSON.stringify(this.currentTypeConfig)); 
                    }                    
                }                
                await this.componentModel.findByIdAndUpdate(card._id, { $set: { ...payload } }, {runValidators: true, new: true });
            } else {
                const cardObj = new this.componentModel(payload);
                card = await cardObj.save();                
            }  
            
            this.currentCID = card._id; 
            await this.mapComponentPages();

            /* Register child component */

            if (card) {
                
                if (!this.isUpdate) {
                    const ucObj = new this.uploadComponentModel({
                        upload: this.uploadId,
                        component: card._id
                    });
                    await ucObj.save();
                }                
                
                let childrens = [];
                let cardItem = null;
                let cardItemObj = null;
                let dateRangeCheck = [];
                const cardItemType = this.getComponentType("card_item");
                
                for (let i = 0; i < items.length; i++) {

                    this.currentRow = this.allRows[this.rowIndex];

                    if (await this.assertComponent(this.currentRow)) {

                        this.currentStartDate = moment(items[i][11], 'DD-MM-YYYY').startOf('day');
                        this.currentEndDate = moment(items[i][12], 'DD-MM-YYYY').startOf('day');

                        if (!this.currentStartDate.isValid()) {
                            this.failed++;
                            this.failedSummary["row_"+ this.rowIndex] = "Invalid start date";
                            continue;
                        }

                        if (!this.currentEndDate.isValid()) {
                            this.failed++;
                            this.failedSummary["row_"+ this.rowIndex] = "Invalid end date";
                            continue;
                        }

                        dateRangeCheck = this.validateStartEndDate();
                        if (dateRangeCheck && !dateRangeCheck[0]) {
                            this.failed++;
                            this.failedSummary["row_"+ this.rowIndex] = dateRangeCheck[1]; 
                            continue;
                        }

                        payload = {};
                        payload["parent"] = card._id;
                        payload["title"] = items[i][3] ? (items[i][3] +" - "+ (i + 1)) : (items[i][2] +" - "+ (i + 1));
                        payload["sub_title"] = items[i][4];
                        payload["handle"] = items[i][2] +"_"+ (i + 1);
                        payload["type"] = cardItemType._id;                        
                        payload["status"] = items[i][18] == 1 ? true : false;
                        payload["start_date"] = this.currentStartDate.toDate();
                        payload["end_date"] = this.currentEndDate.toDate();
                        
                        payload["configuration"] = {
                            label: "",                                           
                            asset_url: items[i][6],
                            link_type: items[i][8],
                            link_to: items[i][9],                            
                            options: {}
                        };

                        cardItem = await this.componentModel.findOne({handle:  payload["handle"]}).lean();
                        if (cardItem) {                
                            await this.componentModel.findByIdAndUpdate(cardItem._id, { $set: { ...payload } }, {runValidators: true, new: true });
                            if (i > 0) {
                                this.updated++;                
                            }
                        } else {
                            cardItemObj = new this.componentModel(payload); 
                            cardItem = await cardItemObj.save();
                            if (i > 0) {
                                this.succeed++;                
                            }
                        } 

                        if (cardItem) {
                            childrens.push(cardItem._id);
                            await this.prepareComponentMappingRule(cardItem._id);
                        }

                    } else {
                        this.failed++;
                        this.failedSummary["row_"+ this.rowIndex] = this.validationMessage;                                            
                    }

                    /* Increase the global row index */
                    if (i > 0) {
                        this.rowIndex++;
                    }

                }

                cardConfig["sequence"] = childrens;
                await this.componentModel.findByIdAndUpdate(card._id, { $set: { configuration: cardConfig } }, {runValidators: true, new: true });

            } else {
                this.failed++;
                this.failedSummary["row_"+ this.rowIndex] = "Unexpected reason, component failed to create";   
            }

        } catch (_e) {
            this.failed++;
            this.failedSummary["row_"+ this.rowIndex] = _e.message;                                
        } 

    };    

    processProductWidget = async () => {

        try {

            const items = this.getChildItems(this.currentRow[2]);            
            let productConfig = JSON.parse(JSON.stringify(this.currentTypeConfig));

            /* Determine the start & end date of this carousel */
            const [startDate, endDate] = await this.determineParentStartEndDate(items);

            if (!startDate) {
                this.failed++;
                this.failedSummary["row_"+ this.rowIndex] = "Invalid start date (Product Widget Parent Component)";                 
                return;
            }

            if (!endDate) {
                this.failed++;
                this.failedSummary["row_"+ this.rowIndex] = "Invalid end date (Product Widget Parent Component)";                 
                return;
            }

            /* Register parent component */
            let payload = {};
            payload["title"] = items[0][3] ? items[0][3] : items[0][2] +" - "+ this.rowIndex;
            payload["sub_title"] = items[0][4];
            payload["handle"] = items[0][2];
            payload["type"] = this.currentType._id;            
            payload["status"] = items[0][18] == 1 ? true : false;
            payload["start_date"] = startDate;
            payload["end_date"] = endDate;
            payload["configuration"] = {};

            let product = await this.componentModel.findOne({handle: payload["handle"]}).lean();
            if (product) {
                
                this.isUpdate = false;
                productConfig = product.configuration;                            

                if (typeof productConfig == 'string') {
                    try {
                        productConfig = JSON.parse(productConfig);
                    } catch (_e) {
                        productConfig = JSON.parse(JSON.stringify(this.currentTypeConfig)); 
                    }                    
                }                  
                await this.componentModel.findByIdAndUpdate(product._id, { $set: { ...payload } }, {runValidators: true, new: true });
            } else {
                const productObj = new this.componentModel(payload);
                product = await productObj.save();                   
            }           

            this.currentCID = product._id;
            await this.mapComponentPages();

            /* Register child component */

            if (product) {  

                if (!this.isUpdate) {
                    const ucObj = new this.uploadComponentModel({
                        upload: this.uploadId,
                        component: product._id
                    });
                    await ucObj.save();
                }                
                
                let childrens = [];
                let productItem = null;
                let productItemObj = null;
                let dateRangeCheck = [];
                const productItemType = this.getComponentType("product_offer_item");
                
                for (let i = 0; i < items.length; i++) {

                    this.currentRow = this.allRows[this.rowIndex];

                    if (await this.assertComponent(this.currentRow)) {

                        this.currentStartDate = moment(items[i][11], 'DD-MM-YYYY').startOf('day');
                        this.currentEndDate = moment(items[i][12], 'DD-MM-YYYY').startOf('day');

                        if (!this.currentStartDate.isValid()) {
                            this.failed++;
                            this.failedSummary["row_"+ this.rowIndex] = "Invalid start date";
                            continue;
                        }

                        if (!this.currentEndDate.isValid()) {
                            this.failed++;
                            this.failedSummary["row_"+ this.rowIndex] = "Invalid end date";
                            continue;
                        }

                        dateRangeCheck = this.validateStartEndDate();
                        if (dateRangeCheck && !dateRangeCheck[0]) {
                            this.failed++;
                            this.failedSummary["row_"+ this.rowIndex] = dateRangeCheck[1]; 
                            continue;
                        }

                        payload = {};
                        payload["parent"] = card._id;
                        payload["title"] = items[i][3] ? (items[i][3] +" - "+ (i + 1)) : (items[i][2] +" - "+ (i + 1));
                        payload["sub_title"] = items[i][4];
                        payload["handle"] = items[i][2] +"_"+ (i + 1);
                        payload["type"] = productItemType._id;                        
                        payload["status"] = items[i][18] == 1 ? true : false;
                        payload["start_date"] = this.currentStartDate.toDate();
                        payload["end_date"] = this.currentEndDate.toDate();
                        
                        payload["configuration"] = {
                            label: "",                                                 
                            sku: items[i][5],
                            asset_url: items[i][6],
                            link_type: items[i][8],
                            link_to: items[i][9],                            
                            options: {}
                        };

                        productItem = await this.componentModel.findOne({handle:  payload["handle"]}).lean();
                        if (productItem) {                
                            await this.componentModel.findByIdAndUpdate(productItem._id, { $set: { ...payload } }, {runValidators: true, new: true });
                            if (i > 0) {
                                this.updated++;                
                            }
                        } else {
                            productItemObj = new this.componentModel(payload); 
                            productItem = await productItemObj.save();
                            if (i > 0) {
                                this.succeed++;                
                            }
                        }

                        if (productItem) {
                            childrens.push(productItem._id);
                            await this.prepareComponentMappingRule(productItem._id);
                        }

                    } else {
                        this.failed++;
                        this.failedSummary["row_"+ this.rowIndex] = this.validationMessage;                                            
                    }

                    /* Increase the global row index */
                    if (i > 0) {
                        this.rowIndex++;
                    }

                }

                productConfig["sequence"] = childrens;
                await this.componentModel.findByIdAndUpdate(product._id, { $set: { configuration: productConfig } }, {runValidators: true, new: true });

            } else {
                this.failed++;
                this.failedSummary["row_"+ this.rowIndex] = "Unexpected reason, component failed to create";   
            }

        } catch (_e) {
            this.failed++;
            this.failedSummary["row_"+ this.rowIndex] = _e.message;                                
        }

    }; 

    processTopWidget = async () => {

        try {            

            let topWidgetConfig = JSON.parse(JSON.stringify(this.currentTypeConfig));
            
            let payload = {};
            payload["title"] = this.currentRow[3] ? this.currentRow[3] : this.currentRow[2] +" - "+ this.rowIndex;
            payload["sub_title"] = this.currentRow[4];
            payload["handle"] = this.currentRow[2];
            payload["type"] = this.currentType._id;            
            payload["status"] = this.currentRow[18] == 1 ? true : false;
            payload["start_date"] = this.currentStartDate.toDate();
            payload["end_date"] = this.currentEndDate.toDate();

            topWidgetConfig["type"] = this.currentRow[1];            
            payload["configuration"] = topWidgetConfig;

            let topWidget = await this.componentModel.findOne({handle: payload["handle"]}).lean();
            if (topWidget) {

                this.isUpdate = true;
                topWidgetConfig = topWidget.configuration;                

                if (typeof topWidgetConfig == 'string') {
                    try {
                        topWidgetConfig = JSON.parse(topWidgetConfig);
                    } catch (_e) {
                        topWidgetConfig = JSON.parse(JSON.stringify(this.currentTypeConfig)); 
                    }                    
                }  
                /* Needs to make sure it is from the xls */
                topWidgetConfig["type"] = this.currentRow[1]; 
                payload["configuration"] = topWidgetConfig;                
                await this.componentModel.findByIdAndUpdate(topWidget._id, { $set: { ...payload } }, {runValidators: true, new: true });
            } else {
                const topWidgetObj = new this.componentModel(payload);
                topWidget = await topWidgetObj.save();                
            }            

            this.currentCID = topWidget._id;

            if (!topWidget) {
                this.failed++;
                this.failedSummary["row_"+ this.rowIndex] = "Unexpected reason, component failed to create";  
            } else {
                if (!this.isUpdate) {
                    const ucObj = new this.uploadComponentModel({
                        upload: this.uploadId,
                        component: topWidget._id
                    });
                    await ucObj.save();
                }                
                await this.prepareComponentMappingRule(topWidget._id);
            } 

        } catch (_e) {
            this.failed++;
            this.failedSummary["row_"+ this.rowIndex] = _e.message;                                
        }  

    };  

    processReward = async () => {

        try {            

            let rewardWidgetConfig = JSON.parse(JSON.stringify(this.currentTypeConfig));
            
            let payload = {};
            payload["title"] = this.currentRow[3] ? this.currentRow[3] : this.currentRow[2] +" - "+ this.rowIndex;
            payload["sub_title"] = this.currentRow[4];
            payload["handle"] = this.currentRow[2];
            payload["type"] = this.currentType._id;            
            payload["status"] = this.currentRow[18] == 1 ? true : false;
            payload["start_date"] = this.currentStartDate.toDate();
            payload["end_date"] = this.currentEndDate.toDate();

            rewardWidgetConfig["type"] = this.currentRow[1];
            rewardWidgetConfig["flyy_camp_id"] = this.currentRow[10];            
            payload["configuration"] = rewardWidgetConfig;

            let rewardWidget = await this.componentModel.findOne({handle: payload["handle"]}).lean();
            if (rewardWidget) {
                
                this.isUpdate = true;
                rewardWidgetConfig = rewardWidget.configuration;                

                if (typeof rewardWidgetConfig == 'string') {
                    try {
                        rewardWidgetConfig = JSON.parse(rewardWidgetConfig);
                    } catch (_e) {
                        rewardWidgetConfig = JSON.parse(JSON.stringify(this.currentTypeConfig)); 
                    }                    
                }  
                /* Needs to make sure it is from the xls */
                rewardWidgetConfig["type"] = this.currentRow[1];
                rewardWidgetConfig["flyy_camp_id"] = this.currentRow[10];
                payload["configuration"] = rewardWidgetConfig;                
                await this.componentModel.findByIdAndUpdate(rewardWidget._id, { $set: { ...payload } }, {runValidators: true, new: true });
            } else {
                const rewardWidgetObj = new this.componentModel(payload);
                rewardWidget = await rewardWidgetObj.save();                
            } 

            this.currentCID = rewardWidget._id;

            if (!rewardWidget) {
                this.failed++;
                this.failedSummary["row_"+ this.rowIndex] = "Unexpected reason, component failed to create";  
            } else {
                if (!this.isUpdate) {
                    const ucObj = new this.uploadComponentModel({
                        upload: this.uploadId,
                        component: rewardWidget._id
                    });
                    await ucObj.save();
                }                
                await this.prepareComponentMappingRule(rewardWidget._id);
            } 

        } catch (_e) {
            this.failed++;
            this.failedSummary["row_"+ this.rowIndex] = _e.message;                                
        }  

    };

    processFeedBack = async () => {

        try {            

            let feedbackWidgetConfig = JSON.parse(JSON.stringify(this.currentTypeConfig));
            
            let payload = {};
            payload["title"] = this.currentRow[3] ? this.currentRow[3] : this.currentRow[2] +" - "+ this.rowIndex;
            payload["sub_title"] = this.currentRow[4];
            payload["handle"] = this.currentRow[2];
            payload["type"] = this.currentType._id;            
            payload["status"] = this.currentRow[18] == 1 ? true : false;
            payload["start_date"] = this.currentStartDate.toDate();
            payload["end_date"] = this.currentEndDate.toDate();
                      
            payload["configuration"] = feedbackWidgetConfig;

            let feedbackWidget = await this.componentModel.findOne({handle: payload["handle"]}).lean();
            if (feedbackWidget) {
                
                this.isUpdate = true;
                feedbackWidgetConfig = feedbackWidget.configuration;                

                if (typeof feedbackWidgetConfig == 'string') {
                    try {
                        feedbackWidgetConfig = JSON.parse(feedbackWidgetConfig);
                    } catch (_e) {
                        feedbackWidgetConfig = JSON.parse(JSON.stringify(this.currentTypeConfig)); 
                    }                    
                }                  
                payload["configuration"] = feedbackWidgetConfig;                
                await this.componentModel.findByIdAndUpdate(feedbackWidget._id, { $set: { ...payload } }, {runValidators: true, new: true });
            } else {
                const feedbackWidgetObj = new this.componentModel(payload);
                feedbackWidget = await feedbackWidgetObj.save();
            } 

            this.currentCID = feedbackWidget._id;

            if (!feedbackWidget) {
                this.failed++;
                this.failedSummary["row_"+ this.rowIndex] = "Unexpected reason, component failed to create";  
            } else {
                if (!this.isUpdate) {
                    const ucObj = new this.uploadComponentModel({
                        upload: this.uploadId,
                        component: feedbackWidget._id
                    });
                    await ucObj.save();
                }                
                await this.prepareComponentMappingRule(feedbackWidget._id);
            }  

        } catch (_e) {
            this.failed++;
            this.failedSummary["row_"+ this.rowIndex] = _e.message;                                
        }

    };

    processImage = async () => {

        try {            

            let imageWidgetConfig = JSON.parse(JSON.stringify(this.currentTypeConfig));
            
            let payload = {};
            payload["title"] = this.currentRow[3] ? this.currentRow[3] : this.currentRow[2] +" - "+ this.rowIndex;
            payload["sub_title"] = this.currentRow[4];
            payload["handle"] = this.currentRow[2];
            payload["type"] = this.currentType._id;            
            payload["status"] = this.currentRow[18] == 1 ? true : false;
            payload["start_date"] = this.currentStartDate.toDate();
            payload["end_date"] = this.currentEndDate.toDate();    

            imageWidgetConfig["web_asset_url"] = this.currentRow[7];
            imageWidgetConfig["mobile_asset_url"] = this.currentRow[6];
            imageWidgetConfig["link_type"] = this.currentRow[8];
            imageWidgetConfig["link_to"] = this.currentRow[9];

            payload["configuration"] = imageWidgetConfig;

            let imageWidget = await this.componentModel.findOne({handle: payload["handle"]}).lean();
            if (imageWidget) {

                this.isUpdate = true;                
                imageWidgetConfig = imageWidget.configuration;

                if (typeof imageWidgetConfig == 'string') {
                    try {
                        imageWidgetConfig = JSON.parse(imageWidgetConfig);
                    } catch (_e) {
                        imageWidgetConfig = JSON.parse(JSON.stringify(this.currentTypeConfig)); 
                    }                    
                }        
                imageWidgetConfig["web_asset_url"] = this.currentRow[7];
                imageWidgetConfig["mobile_asset_url"] = this.currentRow[6];
                imageWidgetConfig["link_type"] = this.currentRow[8];
                imageWidgetConfig["link_to"] = this.currentRow[9];          
                payload["configuration"] = imageWidgetConfig;                
                await this.componentModel.findByIdAndUpdate(imageWidget._id, { $set: { ...payload } }, {runValidators: true, new: true });
            } else {
                const imageWidgetObj = new this.componentModel(payload);
                imageWidget = await imageWidgetObj.save();
            } 

            this.currentCID = imageWidget._id;

            if (!imageWidget) {
                this.failed++;
                this.failedSummary["row_"+ this.rowIndex] = "Unexpected reason, component failed to create";  
            } else {
                if (!this.isUpdate) {
                    const ucObj = new this.uploadComponentModel({
                        upload: this.uploadId,
                        component: imageWidget._id
                    });
                    await ucObj.save();
                }                
                await this.prepareComponentMappingRule(imageWidget._id);
            } 

        } catch (_e) {
            this.failed++;
            this.failedSummary["row_"+ this.rowIndex] = _e.message;                                
        }

    };

    processVideo = async () => {

        try {            

            let videoWidgetConfig = JSON.parse(JSON.stringify(this.currentTypeConfig));
            
            let payload = {};
            payload["title"] = this.currentRow[3] ? this.currentRow[3] : this.currentRow[2] +" - "+ this.rowIndex;
            payload["sub_title"] = this.currentRow[4];
            payload["handle"] = this.currentRow[2];
            payload["type"] = this.currentType._id;            
            payload["status"] = this.currentRow[18] == 1 ? true : false;
            payload["start_date"] = this.currentStartDate.toDate();
            payload["end_date"] = this.currentEndDate.toDate();    
            
            videoWidgetConfig["asset_url"] = this.currentRow[6];          

            payload["configuration"] = videoWidgetConfig;

            let videoWidget = await this.componentModel.findOne({handle: payload["handle"]}).lean();
            if (videoWidget) {

                this.isUpdate = true;                
                videoWidgetConfig = videoWidget.configuration;

                if (typeof videoWidgetConfig == 'string') {
                    try {
                        videoWidgetConfig = JSON.parse(videoWidgetConfig);
                    } catch (_e) {
                        videoWidgetConfig = JSON.parse(JSON.stringify(this.currentTypeConfig)); 
                    }                    
                }      
                videoWidgetConfig["asset_url"] = this.currentRow[6];             
                payload["configuration"] = videoWidgetConfig;                
                await this.componentModel.findByIdAndUpdate(videoWidget._id, { $set: { ...payload } }, {runValidators: true, new: true });
            } else {
                const videoWidgetObj = new this.componentModel(payload);
                videoWidget = await videoWidgetObj.save();
            } 

            this.currentCID = videoWidget._id;

            if (!videoWidget) {
                this.failed++;
                this.failedSummary["row_"+ this.rowIndex] = "Unexpected reason, component failed to create";  
            } else {
                if (!this.isUpdate) {
                    const ucObj = new this.uploadComponentModel({
                        upload: this.uploadId,
                        component: videoWidget._id
                    });
                    await ucObj.save();
                }                
                await this.prepareComponentMappingRule(videoWidget._id);
            } 

        } catch (_e) {
            this.failed++;
            this.failedSummary["row_"+ this.rowIndex] = _e.message;                                
        }

    };

    processNotification = async () => {

        try {            

            let notificationWidgetConfig = JSON.parse(JSON.stringify(this.currentTypeConfig));

            let payload = {};
            payload["title"] = this.currentRow[3] ? this.currentRow[3] : this.currentRow[2] +" - "+ this.rowIndex;
            payload["sub_title"] = this.currentRow[4];
            payload["handle"] = this.currentRow[2];
            payload["type"] = this.currentType._id;            
            payload["status"] = this.currentRow[18] == 1 ? true : false;
            payload["start_date"] = this.currentStartDate.toDate();
            payload["end_date"] = this.currentEndDate.toDate();   

            notificationWidgetConfig["message"] = this.currentRow[3]; 
            payload["configuration"] = notificationWidgetConfig;

            let notificationWidget = await this.componentModel.findOne({handle: payload["handle"]}).lean();
            if (notificationWidget) {
                
                this.isUpdate = true;
                notificationWidgetConfig = notificationWidget.configuration;                

                if (typeof notificationWidgetConfig == 'string') {
                    try {
                        notificationWidgetConfig = JSON.parse(notificationWidgetConfig);
                    } catch (_e) {
                        notificationWidgetConfig = JSON.parse(JSON.stringify(this.currentTypeConfig)); 
                    }                    
                }      
                notificationWidgetConfig["message"] = this.currentRow[3];              
                payload["configuration"] = notificationWidgetConfig;                
                await this.componentModel.findByIdAndUpdate(notificationWidget._id, { $set: { ...payload } }, {runValidators: true, new: true });
            } else {
                const notificationWidgetObj = new this.componentModel(payload);
                notificationWidget = await notificationWidgetObj.save();
            }

            this.currentCID = notificationWidget._id;

            if (!notificationWidget) {
                this.failed++;
                this.failedSummary["row_"+ this.rowIndex] = "Unexpected reason, component failed to create";  
            } else {
                if (!this.isUpdate) {
                    const ucObj = new this.uploadComponentModel({
                        upload: this.uploadId,
                        component: notificationWidget._id
                    });
                    await ucObj.save();
                }                
                await this.prepareComponentMappingRule(notificationWidget._id);
            } 

        } catch (_e) {
            this.failed++;
            this.failedSummary["row_"+ this.rowIndex] = _e.message;   
        }

    };

    prepareComponentMappingRule = async (_compId) => {

        try {

            const ruleModel = await EM.getModel("rule");
            const groupRulesModel = await EM.getModel("rules_group");

            if (ruleModel && groupRulesModel) {

                /* First reset rules & group */
                await ruleModel.deleteMany({component: _compId});
                await groupRulesModel.deleteMany({component: _compId});

                let rule = null;
                let ruleObj = null;
                let rulePayload = null;

                let groupRuleObj = new groupRulesModel({
                    component: _compId,
                    rules: []
                });

                const groupRule = await groupRuleObj.save();
                if (groupRule) {

                    const ruleType = this.currentRow[13] ? this.currentRow[13] : 1;
                    const includeCell = this.currentRow[14] ? this.currentRow[14] : "";
                    const excludeCell = this.currentRow[15] ? this.currentRow[15] : "";

                    rulePayload = {
                        component: _compId,
                        type: ruleType,
                        match: {
                            countries: "none",
                            states: "none",
                            regions: "none",
                            retailers: "none"
                        },
                        segments: "none",                
                        distributors: "none",
                        companies: "none",
                        retailer_lookup: 2
                    }

                    if (includeCell) {

                        rulePayload["condition"] = 1;

                        if (includeCell.trim() == "all" || includeCell.trim() == "none") {
                            if (ruleType == 1) {
                                rulePayload["segments"] = includeCell.trim();
                            } else if (ruleType == 2) {
                                rulePayload["distributors"] = includeCell.trim();
                            } else {
                                rulePayload["companies"] = includeCell.trim();
                            }                            
                        } else {
                            if (includeCell) {                                
                                if (includeCell.indexOf(',') !== -1) {   
                                    if (ruleType == 1) {
                                        rulePayload["segments"] = includeCell.split(",");
                                    } else if (ruleType == 2) {
                                        rulePayload["distributors"] = includeCell.split(",");
                                    } else {
                                        rulePayload["companies"] = includeCell.split(",");
                                    }                                                                           
                                } else {
                                    if (ruleType == 1) {
                                        rulePayload["segments"] = [includeCell];
                                    } else if (ruleType == 2) {
                                        rulePayload["distributors"] = [includeCell];
                                    } else {
                                        rulePayload["companies"] = [includeCell];
                                    }                                    
                                }                            
                            }                        
                        }    
                        
                        ruleObj = new ruleModel(rulePayload);
                        rule = await ruleObj.save();

                        groupRuleObj = await groupRulesModel.findById(groupRule._id); 

                        groupRuleObj.rules = [];                       
                        groupRuleObj.rules.push(rule._id);

                        await groupRulesModel.updateOne(
                            { _id: groupRule._id },
                            { $set: { rules: groupRuleObj.rules } }
                        );

                    }   
                    
                    rulePayload = {
                        component: _compId,
                        type: ruleType,
                        match: {
                            countries: "none",
                            states: "none",
                            regions: "none",
                            retailers: "none"
                        },
                        segments: "none",                
                        distributors: "none",
                        companies: "none",
                        retailer_lookup: 2
                    }

                    if (excludeCell) {

                        rulePayload["condition"] = 2;
                        if (excludeCell == "all" || excludeCell == "none") {
                            if (ruleType == 1) {
                                rulePayload["segments"] = excludeCell;
                            } else if (ruleType == 2) {
                                rulePayload["distributors"] = excludeCell;
                            } else {
                                rulePayload["companies"] = excludeCell;
                            }                            
                        } else {
                            if (excludeCell) {                                
                                if (excludeCell.indexOf(',') !== -1) {    
                                    if (ruleType == 1) {
                                        rulePayload["segments"] = excludeCell.split(",");  
                                    } else if (ruleType == 2) {
                                        rulePayload["distributors"] = excludeCell.split(",");  
                                    } else {
                                        rulePayload["companies"] = excludeCell.split(",");  
                                    }                                                                                                     
                                } else {
                                    if (ruleType == 1) {
                                        rulePayload["segments"] = [excludeCell];
                                    } else if (ruleType == 2) {
                                        rulePayload["distributors"] = [excludeCell];
                                    } else {
                                        rulePayload["companies"] = [excludeCell];
                                    }                                    
                                }                                
                            }                        
                        }

                        ruleObj = new ruleModel(rulePayload);
                        rule = await ruleObj.save();
                        
                        ruleObj = new ruleModel(rulePayload);
                        rule = await ruleObj.save();

                        groupRuleObj = await groupRulesModel.findById(groupRule._id);                        

                        groupRuleObj.rules = [];                        
                        groupRuleObj.rules.push(rule._id);

                        await groupRulesModel.updateOne(
                            { _id: groupRule._id },
                            { $set: { rules: groupRuleObj.rules } }
                        );

                    }                    

                } else {
                    throw new Error("Unknown error - group rule creation failed");
                }

            } else {
                throw new Error("group or rules entity not found");
            }            

        } catch (_e) {
            throw new Error(_e);
        }

    };

    /**
     * 
     * Validate the ROW
     * 
     */
    assertComponent = async (_row) => {

        if (!_row) {
            return false;
        }

        /* Check type */
        if (!_row[0]) {
            this.validationMessage = "Component type is missing";
            return false;
        }

        /* Check handle */
        if (!_row[2]) {
            this.validationMessage = "Component UID is missing";
            return false;
        }
        
        /* Check start date */
        if (!_row[11]) {
            this.validationMessage = "Component start date is missing";
            return false;
        }

        /* Check end date */
        if (!_row[12]) {
            this.validationMessage = "Component end date is missing";
            return false;
        }

        /* Check end date */
        if (!_row[14]) {
            this.validationMessage = "Component rule is missing";
            return false;
        }

        /* Check page */
        if (!_row[16]) {
            this.validationMessage = "Component page mapping is missing";
            return false;
        }

        /* Check position */
        if (!_row[17]) {
            this.validationMessage = "Component position is missing";
            return false;
        }

        /**
         * 
         * Check for assets (mobile or web would do)
         * 
         */
        if (_row[0] == "carousel" || _row[0] == "product_offer" || _row[0] == "card") {
            if (!_row[6]) {
                /* Check incase web asset present */
                if (!_row[7]) {
                    this.validationMessage = "asset url is missing";
                    return false;
                }
            }
        }

        return true;

    };

    determineParentStartEndDate = async (_items) => {

        let startDate = null;
        let endDate = null;

        let tempStartDate = null;
        let tempEndDate = null;

        try {

            for (let i = 0; i < _items.length; i++) { 

                tempStartDate = moment(_items[i][11], 'DD-MM-YYYY').startOf('day');
                tempEndDate = moment(_items[i][12], 'DD-MM-YYYY').startOf('day');
                
                if (tempStartDate.isValid() && tempEndDate.isValid()) {

                    if (!startDate) {
                        startDate = tempStartDate;
                        endDate = tempEndDate;
                    } else {        
                        if (tempStartDate.isBefore(startDate)) {
                            startDate = tempStartDate;
                        }        
                        if (tempEndDate.isAfter(endDate)) {
                            endDate = tempEndDate;
                        }        
                    }

                } else {
                    return [tempStartDate.isValid(), tempEndDate.isValid()];
                }    
    
            }

            /* Before returning check start and end date is valid - start should be before end */
            if (startDate.isBefore(endDate)) {
                const today = moment().startOf('day');
                if (endDate.isBefore(today)) {            
                    return [null, null];           
                }
                return [startDate.toDate(), endDate.toDate()];
            } else {
                return [null, null];
            }

        } catch (_e) {            
            return [null, null];
        }
        
    };

    getComponentType = (_type) => {        

        for (let i = 0; i < this.componentTypes.length; i++) {
            if (_type == this.componentTypes[i].handle) {
                return this.componentTypes[i];
            }
        }
        
        return null;

    };

    getChildItems = (_handle) => {

        const childs = [];
        for (let i = 0; i < this.allRows.length; i++) {
            if (this.allRows[i][2] == _handle) {
                childs.push(this.allRows[i]); 
            }
        }

        return childs.sort((a, b) => b[5] - a[5]);

    };

    checkPosition = (_sequence, _typeId, _position) => {

        let count = 0;
        if (_sequence && Array.isArray(_sequence)) {            
            for (let i = 0; i < _sequence.length; i++) {
                if (_sequence[i].toString() == _typeId) {
                    count++;
                }
            }
        }
        return (count >= _position);

    };

    validateStartEndDate = () => {

        if (this.currentEndDate.isBefore(this.currentStartDate)) {
            return [false, "End date should be greater than or equal to Start date"];
        }

        const today = moment().startOf('day');
        if (this.currentEndDate.isBefore(today)) {            
            return [false, "End date should be greater than or equal to Today"];            
        }        

        return [true, true];

    };

    mapComponentPages = async () => {

        let page = null;
        let posType = {};
        let posFlaq = false;
        let mappingObj = null;
        let sequenceCount = 0;
        let typeOffset = 0;
        let mappingCount = 0;

        const pageList = (this.currentRow[16] + "").split(",");
        const posList = (this.currentRow[17] + "").split(",");

        if (pageList.length == posList.length) {

            for (let i = 0; i < pageList.length; i++) {

                posType = {};
                posFlaq = false;
                page = await this.pageModel.findOne({handle: pageList[i]}).lean();

                if (!page) {                    
                    continue;
                }

                /* Before anything check whther the mapping exist already */ 
                mappingCount = await this.pageComponentMappingModel.findOne({page: page._id, component: this.currentCID, position: (this.currentType._id +"_"+ posList[i])}).lean();

                if (mappingCount) {
                    continue;
                }

                /* Check for the position in page sequence */
                if (!page.sequence || !Array.isArray(page.sequence)) {
                    page["sequence"] = [];
                }

                for (let j = 0; j < page.sequence.length; j++) { 
                    
                    if (!posType[page.sequence[j].toString()]) {
                        posType[page.sequence[j].toString()] = 1;
                    } else {
                        posType[page.sequence[j].toString()]++;
                    }


                    if ((page.sequence[j].toString() == this.currentType._id.toString()) && posType[page.sequence[j].toString()] == posList[i]) {
                        posFlaq = true;
                        break;
                    }
                    
                }

                if (!posFlaq) {
                    /* Add this position to page - since it is not exist already*/
                    sequenceCount = this.getComponentTypeCount(this.currentType._id, page.sequence);

                    if (parseInt(posList[i], 10) > sequenceCount) {
                        typeOffset = parseInt(posList[i], 10) - sequenceCount;                        
                        for (let j = 0; j < typeOffset; j++) {
                            page.sequence.push(this.currentType._id.toString());
                        }
                    }                    
                }

                mappingObj = new this.pageComponentMappingModel({
                    page: page._id,
                    component: this.currentCID,
                    position: (this.currentType._id +"_"+ posList[i])
                });

                await mappingObj.save();
                await this.pageModel.findByIdAndUpdate(page._id, { $set: { sequence: page.sequence } }, {runValidators: true, new: true });

            }

        } else {
            console.error("page & position count mismatch");
        }

    };

    getComponentTypeCount = (_typeId, _sequence) => {
        let count = 0;
        for (let i = 0; i < _sequence.length; i++) {
            if (_typeId.toString() == _sequence[i].toString()) {
                count++;
            }
        }
        return count;
    };

    getDefaultConfiguration = (_type) => {

        const config = {};
        let compConfig = {};
        const typeObject = this.getComponentType(_type);

        if (typeObject && typeObject.configuration) {
        
            compConfig = typeObject.configuration;
            if (typeof typeObject.configuration === "string") {
                compConfig = JSON.parse(typeObject.configuration);
            }
        
            const configKeys = Object.keys(compConfig);
            for (let i = 0; i < configKeys.length; i++) {
                config[configKeys[i]] = compConfig[configKeys[i]].value;
            }  

        }              

        return config;

    };

    readExcelFileToArray = async (filePath) => {

        try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(filePath);
        
            // Assuming the data is in the first worksheet
            const worksheet = workbook.getWorksheet(1); 
            const rows = [];
        
            worksheet.eachRow((row) => {
                const rowData = [];
                row.eachCell((cell) => {                    
                    rowData.push(cell ? cell.value : "");
                });
                rows.push(rowData);
            });
        
            return rows; 
        } catch (error) {        
            return []; // Return an empty array if an error occurs
        }

    }

}