import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import readXlsxFile from "read-excel-file/node";

import DBM from "./db.js";
import EM from './entity.js';

/**
 * 
 * row[0]       = PRODUCT NAME
 * row[1]       = MIN OTY
 * row[2]       = MAX QTY
 * row[3]       = MIN VALUE
 * row[4]       = MAX VALUE
 * row[5]       = PERCENTAGE CASHBACK 
 * row[6]       = FLAT CASHBACK
 * row[7]       = MAX CASHBACK
 * row[8]       = FIRST USERS
 * row[9]       = REMARKS / COMMENTS
 * row[10]      = PRODUCT ID
 * row[11]      = MDM PRODUCT CODE
 * row[12]      = AUDIENCE
 * row[13]      = SEGMENT NAME
 * row[14]      = SEGMENT ID
 * row[15]      = OFFER TEXT
 * row[16]      = COMAPNY NAME
 * row[17]      = TERMS & CONDITION
 * row[18]      = MRP
 * row[19]      = PTR
 * row[20]      = PRODUCT CODE
 * row[21]      = COMPANY ID
 *
 */

export default class OfferManager {

    constructor(_parentPort) {

        this.parentPort = _parentPort;

        this.rowIndex = 0;
        this.rowKey = "";
        this.currentRow = [];
        this.allRows = [];

        this.validationMessage = "";

        this.succeed = 0;
        this.failed = 0;
        this.updated = 0;

        this.PRODUCT_NAME_INDEX = 0;
        this.MIN_QTY_INDEX = 1;
        this.MAX_QTY_INDEX = 2;
        this.MIN_VALUE_INDEX = 3;
        this.MAX_VALUE_INDEX = 4;
        this.PERCENTAGE_CASHBACK_INDEX = 5;
        this.FLAT_CASHBACK_INDEX = 6;
        this.MAX_CASHBACK_INDEX = 7;
        this.FIRST_USERS_INDEX = 8;
        this.REMARKS_COMMENTS_INDEX = 9;
        this.PRODUCT_ID_INDEX = 10;
        this.MDM_PRODUCT_CODE_INDEX = 11;
        this.AUDIENCE_INDEX = 12;
        this.SEGMENT_NAME_INDEX = 13;
        this.SEGMENT_ID_INDEX = 14;
        this.OFFER_TEXT_INDEX = 15;
        this.COMPANY_NAME_INDEX = 16;
        this.TC_INDEX = 17;
        this.MRP_INDEX = 18;
        this.PTR_INDEX = 19;
        this.PRODUCT_CODE_INDEX = 20;
        this.COMPANY_ID_INDEX = 21;

    }

    processUpload = async (_file, _user) => {

        try {

            let cashBackObj = null;
            let uploadRecord = null;
            let oldRecord = null;

            await DBM.connect();
            await EM.reloadEntityCache();

            const offerModel = await EM.getModel("cash_back");
            if (!offerModel) {
                this.parentPort.postMessage({ error: "Cashback model not found" });
                return;
            }

            /* Check the file name, whether it is new or incremental */
            fs.writeFileSync('temp.xlsx', _file.buffer);

            //this.allRows = await this.readExcelFileToArray('temp.xlsx');
            this.allRows = await readXlsxFile('temp.xlsx');

            fs.unlinkSync('temp.xlsx');

            /* Start with index 1 - needs to skip header */
            for (this.rowIndex = 1; this.rowIndex < this.allRows.length; this.rowIndex++) {

                this.currentRow = this.allRows[this.rowIndex];

                if (await this.assertComponent(this.currentRow)) {

                    oldRecord = await offerModel.findOne({ MDMProductCode: this.currentRow[this.MDM_PRODUCT_CODE_INDEX], SegmentName: this.currentRow[this.SEGMENT_NAME_INDEX] }).lean();

                    if (oldRecord) {
                        await offerModel.findByIdAndUpdate(oldRecord._id, { $set: { CashbackMessage: this.currentRow[this.OFFER_TEXT_INDEX], SegmentName: this.currentRow[this.SEGMENT_NAME_INDEX], CashbackTermsAndConditions: this.prepareTcContent() } }, { runValidators: true, new: true });
                    } else {
                        cashBackObj = new offerModel({

                            ProductName: this.currentRow[this.PRODUCT_NAME_INDEX],
                            ProductId: this.currentRow[this.PRODUCT_ID_INDEX],
                            ProductCode: this.currentRow[this.PRODUCT_CODE_INDEX],
                            MDMProductCode: this.currentRow[this.MDM_PRODUCT_CODE_INDEX],
                            CompanyId: this.currentRow[this.COMPANY_ID_INDEX],
                            CompanyName: this.currentRow[this.COMPANY_NAME_INDEX],
                            MRP: isNaN(this.currentRow[this.MRP_INDEX]) ? -1 : this.currentRow[this.MRP_INDEX],
                            PTR: isNaN(this.currentRow[this.PTR_INDEX]) ? -1 : this.currentRow[this.PTR_INDEX],
                            Audience: this.currentRow[this.AUDIENCE_INDEX],
                            SegmentId: this.currentRow[this.SEGMENT_ID_INDEX],
                            SegmentName: this.currentRow[this.SEGMENT_NAME_INDEX],
                            MaxQty: isNaN(this.currentRow[this.MAX_QTY_INDEX]) ? -1 : this.currentRow[this.MAX_QTY_INDEX],
                            MaxValue: isNaN(this.currentRow[this.MAX_VALUE_INDEX]) ? -1 : this.currentRow[this.MAX_VALUE_INDEX],
                            MinQty: isNaN(this.currentRow[this.MIN_QTY_INDEX]) ? -1 : this.currentRow[this.MIN_QTY_INDEX],
                            MinValue: isNaN(this.currentRow[this.MIN_VALUE_INDEX]) ? -1 : this.currentRow[this.MIN_VALUE_INDEX],
                            PercentageCashback: this.sanitizeCashbackPercent(),
                            FlatCashback: isNaN(this.currentRow[this.FLAT_CASHBACK_INDEX]) ? -1 : this.currentRow[this.FLAT_CASHBACK_INDEX],
                            MaxCashback: isNaN(this.currentRow[this.MAX_CASHBACK_INDEX]) ? -1 : this.currentRow[this.MAX_CASHBACK_INDEX],
                            CashbackMessage: this.currentRow[this.OFFER_TEXT_INDEX],
                            CashbackTermsAndConditions: this.prepareTcContent(),
                            FirstUsers: this.currentRow[this.FIRST_USERS_INDEX],
                            Remarks: this.currentRow[this.REMARKS_COMMENTS_INDEX]

                        });

                        await cashBackObj.save();
                    }

                    this.succeed++;

                } else {
                    console.log(this.validationMessage);
                    this.failed++;
                }

            }

        } catch (_e) {
            console.log(_e);
            this.failed++;
        }

        /* Update the summary */
        this.parentPort.postMessage({ message: "Import process completed" });

    };

    sanitizeCashbackPercent = () => {

        let cPercentage = this.currentRow[this.PERCENTAGE_CASHBACK_INDEX];

        if (!cPercentage) {
            return -1;
        }

        if (typeof cPercentage == 'string') {
            cPercentage = cPercentage.replace('%', '');
        }

        return isNaN(cPercentage) ? -1 : cPercentage;

    };

    prepareTcContent = () => {

        let result = this.currentRow[this.TC_INDEX].replace('####', this.currentRow[this.MIN_QTY_INDEX]);

        try {
            const options = { month: 'long' };
            const formattedDate = this.currentRow[this.END_DATE_INDEX].toLocaleDateString('en-US', options);
            return result.replace('####', formattedDate);
        } catch (e) {
            return result.replace('####', this.currentRow[this.END_DATE_INDEX]);
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

        if (!_row[this.PRODUCT_NAME_INDEX]) {
            this.validationMessage = "Product name is missing";
            return false;
        }

        if (!_row[this.MDM_PRODUCT_CODE_INDEX]) {
            this.validationMessage = "Mdm Product Code is missing";
            return false;
        }

        if (!_row[this.AUDIENCE_INDEX]) {
            this.validationMessage = "Audience is missing";
            return false;
        }

        if (!_row[this.SEGMENT_NAME_INDEX] && _row[this.AUDIENCE_INDEX] != "all") {
            this.validationMessage = "Segment is missing";
            return false;
        }

        if (!_row[this.OFFER_TEXT_INDEX]) {
            this.validationMessage = "Offer Text is missing";
            return false;
        }

        if (!_row[this.COMPANY_NAME_INDEX]) {
            this.validationMessage = "Company Name is missing";
            return false;
        }

        if (!_row[this.TC_INDEX]) {
            this.validationMessage = "Terms & Condition is missing";
            return false;
        }

        return true;

    };

}