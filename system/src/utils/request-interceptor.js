import TokenManager from "./token-manager.js";
import Utils from "./utils.js";
import cache from "./cache.js";

class RequestInterceptor {
    
    constructor() {

        if (RequestInterceptor.instance) {
            return RequestInterceptor.instance; // Return the existing instance if it exists
        }

        this.whiteListUrls = [
                "/health",
                "/system/v1/register",
                "/system/v1/auth/sign-in",
                "/system/v1/auth/select-role",                
                "/system/v1/register/user-types",
                "/system/v1/auth/send-forgot-password-token"
        ]

        this.express = null;
        this.tokenManager = new TokenManager();
        RequestInterceptor.instance = this;

    }
  
    init = (_express) => {

        this.express = _express;

        /* Error handler */
        this.express.use((_err, _req, _res, _next) => {
            if (!_err) return _next();
            console.error('Error:', _err);
            _res.status(500).json({ message: 'Internal server error' });
        });

        process.on('uncaughtException', (err) => {
            console.error('Uncaught Exception:', err);        
        });

        this.express.use(async (_req, _res, _next) => {  console.log(_req.path);

            /* Public route handler */
            if (this.whiteListUrls.includes(_req.path) || (_req.method == "POST" && _req.path == "/system/v1/register")) {
                return _next();
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
                case "/system/v1/auth/submit-forgot-password":
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
            const user = await Utils.extractUserFromToken(tokenVerificationResult.payload);
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

    checkPermissions = async (_privileges, _method, _req, _res) => { 

        const basePath = _req.originalUrl.split('?')[0];
        if (this.whiteListUrls.includes(basePath) || (_privileges.length == 1 && _privileges[0] == "*")) {
            return true;
        }

        if (!_req.user) {   
            return false;
        }

        if (!_req.user.role) {
            return false;
        }

        const sourceUrl = `${_req.protocol}://${_req.get("host")}${_req.originalUrl}`;  console.log(sourceUrl);
        const [_service, _version, _module] = this.getUrlPathParts(sourceUrl);    console.log([_service, _version, _module]);
        
        if (_service && _version && _module) {

            const caps = await cache.getCapabilities(`${_req.user.role}_${_module}`);  console.log(caps);

            if (caps) {

                if (caps[_method]) {
                    return true;
                }

                const privileges = await cache.getPrivileges(`${_req.user.role}_privileges`);
                if (Array.isArray(privileges)) {
                    return _privileges.some(item => privileges.includes(item));
                }                 

            } 

        }

        return false;

    };

    interceptRequest = async (_module, _method, _privileges, _routeHandler) => {

        const prevs = Array.isArray(_privileges) ? _privileges : [];

        return async (req, res, next) => {
            if (await this.checkPermissions(prevs, _method, req, res)) {  console.log("check permission is success");
                return _routeHandler(req, res, next);
            } else {                 console.log("check permission is failed");
                return res.status(403).json({ message: 'Forbidden: Insufficient Permissions' });
            }
        };
        
    };

    getUrlPathParts = (_url) => {
        
        const parsedUrl = new URL(_url);
        const pathname = parsedUrl.pathname;
        const parts = pathname.split("/").filter((part) => part !== "");
    
        if (parts && Array.isArray(parts) && parts.length >= 3) {
          return [parts[0], parts[1], parts[2]];
        }
    
        return [null, null, null];

    };      

}

export default new RequestInterceptor();