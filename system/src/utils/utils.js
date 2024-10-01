import jwt from "jsonwebtoken";
import UserModel from "../models/user";
import RoleModel from "../models/role";

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

    static extractUserFromToken = async (_payload) => { 

        try {

            const user = await UserModel.findById(_payload.user).lean();
            if (_payload.role) {
                user["role"] = _payload.role;
            }

            return user;

        } catch (e) {
            console.log(e);
            return null;
        }

    };

}