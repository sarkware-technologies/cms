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
        this.secretKey = process.env.CMS_COMMON_SECRET;     
        this.tempSecretKey = process.env.CMS_TEMP_SECRET;
        this.refreshSecretKey = process.env.CMS_REFRESH_SECRET;           
    }

    issueToken = (_userId, _role) => {

        let data = {
            user: _userId,  
            role: _role,          
            time: Date()            
        }
        
        const accessToken = jwt.sign(data, this.secretKey, { expiresIn: "48h" });
        const refreshToken = jwt.sign({ user: _userId }, this.refreshSecretKey, { expiresIn: "7d" });

        return {
            accessToken,
            refreshToken
        };

    }

    issueTempToken = (_userId) => {

        let data = {
            user: _userId,  
            time: Date()            
        }
        
        return jwt.sign(data, this.tempSecretKey, { expiresIn: "3m" });

    };

    verifyToken = (_token) => {

        try {
                  
            const verified = jwt.verify(_token.trim(), this.secretKey);                        
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

    /**
     * 
     * Verify Refresh Token
     * 
     * @param {string} _refreshToken 
     * @returns {object}
     * 
     */
    verifyRefreshToken = (_refreshToken) => {

        try {
            const verified = jwt.verify(_refreshToken.trim(), this.refreshSecretKey);
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

    /**
     * 
     * Create new Access Token based on valid Refresh Token
     * 
     * @param {string} _refreshToken 
     * @returns {object}
     * 
     */
    refreshAccessToken = (_refreshToken) => {

        const refreshTokenStatus = this.verifyRefreshToken(_refreshToken);

        if (refreshTokenStatus.status) {

            const userId = refreshTokenStatus.payload.user;

            // Issue a new access token
            const newAccessToken = jwt.sign({ user: userId }, this.secretKey, { expiresIn: "48h" });

            return {
                status: true,
                accessToken: newAccessToken
            };

        } else {
            return {
                status: false,
                message: "Invalid or expired refresh token"
            };
        }
    }

}