import jwt from "jsonwebtoken";

export default class Utils {

    static handleError = (_e, _res) => {

        _res.status(500);
        _res.setHeader("content-type", "text/plain");
        _res.send(_e.message);

    };

    static response = (_totalRecords, _currentPage, _records) => {
        
        return {
            totalRecords: _totalRecords,
            totalPages: Math.ceil(_totalRecords / parseInt(process.env.PAGE_SIZE)),
            recordPerPage: parseInt(process.env.PAGE_SIZE),
            currentPage: _currentPage,
            payload: _records,
        };

    };

    static isValidDate = (_dateStr) => {

        if (_dateStr != -1) {
            const date = new Date(_dateStr);
            return !isNaN(date.getTime());
        }

        return false;        
        
    };

    static verifyCmsToken = (_token) => {

        try {              
            return jwt.verify(_token.trim(), process.env.CMS_COMMON_SECRET);                        
        } catch (_e) { 
            console.log(_e,23423)        
            return false;
        }       
 
    }

}