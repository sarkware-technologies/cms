import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";

export default class RouterManager {
    
    constructor(_express) {
      this.express = _express;
    }
  
    initRequestHandler = () => {

        this.express.use("/system", async (_req, _res, _next) => {
    
            try {
                createProxyMiddleware({ 
                    target: process.env.SYSTEM_SERVER,
                    timeout: 300000, // Timeout for incoming requests (5 minutes)
                    proxyTimeout: 300000, // Timeout for outgoing proxy requests (5 minutes)
                })( _req, _res, _next );
            } catch (_e) {
                throw new Error(_e);
            }

        });

        this.express.use("/cms", async (_req, _res, _next) => {

            try {
                createProxyMiddleware({ 
                    target: process.env.COMPOSER_SERVER,
                    timeout: 300000, // Timeout for incoming requests (5 minutes)
                    proxyTimeout: 300000, // Timeout for outgoing proxy requests (5 minutes) 
                })( _req, _res, _next );
            } catch (_e) { 
                _res.status(500).setHeader("content-type", "text/plain").send(_e.message);                
            }

            return;

        });  

        this.express.use("/segmentation", async (_req, _res, _next) => {

            try {
                createProxyMiddleware({ 
                    target: process.env.SEGMENT_SERVER,
                    timeout: 300000, // Timeout for incoming requests (5 minutes)
                    proxyTimeout: 300000, // Timeout for outgoing proxy requests (5 minutes)
                })( _req, _res, _next );
            } catch (_e) { 
                _res.status(500).setHeader("content-type", "text/plain").send(_e.message);                
            }

            return;

        });
        
        this.express.use('/health', (req, res) => {
            res.status(200).json({ status: 'success', message: 'Application is running fine' });
        });

    };

}