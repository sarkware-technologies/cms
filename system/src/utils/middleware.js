import TokenManager from "./token-manager.js";
import Utils from "./utils.js";

export default class RequestInterceptor {
    
    constructor(_express) {
        this.express = _express;
        this.tokenManager = new TokenManager();
    }
  
    init = () => {
        this.initErrorInterceptor();
        this.initPublicInterceptor();
        this.initPrivateInterceptor();
    }

    initErrorInterceptor = () => {

        this.express.use((_err, _req, _res, _next) => {
            
            if (!_err) {
                return _next();
            }        
            
            _res.status(500);
            _res.setHeader('content-type', 'text/plain');
            _res.send('Internal server error');

        });

        process.on('uncaughtException', (err) => {
            console.error('Uncaught Exception:', err);        
        });

    };

    initPublicInterceptor = () => {

        this.server.use(async (_req, _res, _next) => { 

            if (
                _req.path === "/health" ||
                _req.path === "/system/auth/sign-in" ||
                _req.path === "/system/user/register" ||
                _req.path === "/system/auth/send-forgot-password-token"
            ) {
                return _next();
            }

        });

    };

    initPrivateInterceptor = () => {

        this.server.use(async (_req, _res, _next) => { 

            if (!_req.headers["authorization"]) {
                _res.status(401).send("Unauthorized request - authorization header not found");
                return;
            }

            if (_req.path !== "/system/auth/select-role" 
                && _req.path !== "/system/auth/submit-forgot-password") {

                /* Check for system access token */
                const token = this.tokenManager.verifySystemToken(_req.headers["authorization"]);
                if (token.status) {

                    _req["user"] = Utils.extractUserFromToken(token.payload);
                    if (_req["user"]) {
                        _next();
                    } else {
                        _res.status(401).send("Internal server error - Couldn't retrieve user details");
                    }
                    
                } else {
                    _res.status(401).send("Unauthorized request - token is expired");
                }

            } else if (_req.path === "/system/auth/select-role") {

                /* Check for temp access token */
                const token = this.tokenManager.verifyTempToken(_req.headers["authorization"]);
                if (token.status) {
                    _req["user"] = Utils.extractUserFromToken(token.payload);
                    if (_req["user"]) {
                        _next();
                    } else {
                        _res.status(401).send("Internal server error - Couldn't retrieve user details");
                    }
                } else {
                    _res.status(401).send("Unauthorized request - token is expired");
                }

            } else if (_req.path === "/system/auth/submit-forgot-password") {

                /* Check for temp access token */
                const token = this.tokenManager.verifyForgotToken(_req.headers["authorization"]);
                if (token.status) {
                    _req["user"] = Utils.extractUserFromToken(token.payload);
                    if (_req["user"]) {
                        _next();
                    } else {
                        _res.status(401).send("Internal server error - Couldn't retrieve user details");
                    }
                } else {
                    _res.status(401).send("Unauthorized request - token is expired");
                }

            }

        });

    };

}