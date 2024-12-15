import TokenManager from "./token-manager.js";
import Utils from "./utils.js";

class RequestInterceptor {
    
    constructor() {

        if (RequestInterceptor.instance) {
            return RequestInterceptor.instance;
        }

        this.whiteListUrls = [
            "/health",
            "/cms/health",
            "/cms/api/invalidatePageCache",
            "/cms/api/invalidateAllPageCache"
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

        this.express.use(async (_req, _res, _next) => {

            /* Public route handler */
            if (this.whiteListUrls.includes(_req.path)) {
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
            const tokenValidationResult = Utils.verifyToken(token);

            if (tokenValidationResult.status) {
                _req["user"] = tokenValidationResult.payload.id;
                return _next(); // Token is valid, proceed
            } else {
                return _res.status(401).json({ message: tokenValidationResult.message });
            }

        });

    }

}

export default new RequestInterceptor();