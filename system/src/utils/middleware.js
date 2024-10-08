import TokenManager from "./token-manager.js";
import Utils from "./utils.js";

export default class RequestInterceptor {
    
    constructor(_express) {
        this.express = _express;
        this.tokenManager = new TokenManager();
    }
  
    init = () => {

        /* Error handler */

        this.express.use((_err, _req, _res, _next) => {
            if (!_err) return _next();
            
            console.error('Error:', _err); // Log the error for debugging
            _res.status(500).json({ message: 'Internal server error' });
        });

        process.on('uncaughtException', (err) => {
            console.error('Uncaught Exception:', err);        
        });

        

        this.express.use(async (_req, _res, _next) => { 

            /* Public route handler */

            const publicPaths = [
                "/health",
                "/system/auth/sign-in",
                "/system/auth/select-role",
                "/system/register",
                "/system/register/user-types",
                "/system/auth/send-forgot-password-token"
            ];

            if (publicPaths.includes(_req.path)) {
                return _next(); // Skip authorization for public paths
            }

            /* For private routes */
            
            const authHeader = _req.headers["authorization"];

            if (!authHeader) {
                return _res.status(401).json({ message: "Unauthorized request - authorization header not found" });
            }

            if (!authHeader.startsWith("Bearer ")) {
                return _res.status(401).json({ message: "Unsupported token type - Expect Bearer token" });
            }

            const token = authHeader.split(" ")[1];
            let tokenValidationResult;

            switch (_req.path) {
                case "/system/auth/submit-forgot-password":
                    tokenValidationResult = await this.verifyAndSetUser(token, "forgot", _req);
                    break;
                default:
                    tokenValidationResult = await this.verifyAndSetUser(token, "system", _req);
            }

            if (tokenValidationResult.status) {
                return _next(); // Token is valid, proceed
            } else {
                return _res.status(401).json({ message: tokenValidationResult.message });
            }

        });

    }

    /**
     * Generic method to verify token based on token type and set user details in request.
     * 
     * @param {string} token - JWT token from the Authorization header.
     * @param {string} tokenType - Type of token to validate ("system", "temp", "forgot").
     * @param {object} req - Request object to attach user info.
     * @returns {object} - Status and message of the token validation.
     */
    verifyAndSetUser = async (token, tokenType, req) => {

        let tokenVerificationResult;

        switch (tokenType) {
            case "temp":
                tokenVerificationResult = this.tokenManager.verifyTempToken(token);
                break;
            case "forgot":
                tokenVerificationResult = this.tokenManager.verifyForgotToken(token);
                break;
            case "system":
            default:
                tokenVerificationResult = this.tokenManager.verifySystemToken(token);
                break;
        }

        if (tokenVerificationResult.status) {
            const user = await Utils.extractUserFromToken(tokenVerificationResult.payload);  console.log(user);
            if (user) {
                req["user"] = user;
                return { status: true, message: "Token validated successfully" };
            } else {
                return { status: false, message: "Internal server error - Couldn't retrieve user details" };
            }
        } else {
            return { status: false, message: "Unauthorized request - token is invalid or expired" };
        }

    };
}
