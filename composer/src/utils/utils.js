import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";

/**
 * 
 * @author          Sark
 * @version         1.0.0
 * @description     Helper module for sending api response
 * 
 */
export default class Utils {

    static handleError = (_e, _res) => {

        //Log.log(_e.stack, Log.TYPE.TRACE);

        _res.status(500);
        _res.setHeader('content-type', 'text/plain');
        _res.send(_e.message);
        
    };

    static response = (_totalRecords, _currentPage, _records) => {

        return {
            totalRecords: _totalRecords,
            totalPages: Math.ceil(_totalRecords / process.env.PAGE_SIZE),
            recordPerPage: process.env.PAGE_SIZE,
            currentPage: _currentPage,
            payload: _records
        }

    };

    static verifyToken = (_token) => {

        try {
                  
            const verified = jwt.verify(_token.trim(), process.env.PR2_BACKEND_SECRET);                        
            return {
                status: true,
                payload: verified
            };                             

        } catch (_e) {            
            return {
                status: false,
                payload: null
            };
        }
        
    };

}