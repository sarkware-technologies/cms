import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";

/**
 * 
 * @author : Sark
 * @version: 1.0.0
 * 
 * Responsible for issuing and verifying jwt tokens
 * 
 */
export default class TokenManager {
    
    constructor() {
        this.commonSecretKey = process.env.PR2_BACKEND_SECRET;     
        this.systemSecretKey = process.env.CMS_SYSTEM_SECRET;            
    }

    verifyCommonToken = (_token) => {

        try {
                  
            const verified = jwt.verify(_token.trim(), this.commonSecretKey);                        
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
        
    }

    verifySystemToken = (_token) => {

        try {
                  
            const verified = jwt.verify(_token.trim(), this.systemSecretKey);                        
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
        
    }    

}