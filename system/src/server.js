import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import routes from "./routes/index.js"
import MDBM from "./utils/mongo.js";
import MYDBM from "./utils/mysql.js";
import RequestInterceptor from "./utils/middleware.js";
import cache from "./utils/cache.js";

/**
 * 
 * @author: Sark
 * @version : 1.0
 * 
 */

class SystemServer {

    constructor() {
        this.app = express();
        this.setupMiddlewares(); 
        this.setupRoutes();               
    }

    setupMiddlewares = () => {

        this.app.use((_err, _req, _res, _next) => {
            
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

        this.app.use(cors());
        this.app.use(express.json());  

        const RC = new RequestInterceptor(this.app);
        RC.init();

    };

    setupRoutes = () => {    

        this.app.use('/system', cors(), routes);   
        
        this.app.use('/health', (req, res) => {
            res.status(200).json({ status: 'success', message: 'Application is running fine' });
        });
        
        this.app.get("*", (req, res) => {
            res.status(500);
            res.send("API NOT FOUND");
        });

    };

    listen = async () => {

        await MDBM.connect();
        await cache.initCache();
        
        if (MDBM.checkConnection()) {
            this.app.listen(process.env.SYSTEM_PORT);
        } else {
            console.log("MongoDB connection error");
        }
        
    };

}

/* Kick start the server */
const server = new SystemServer();
server.listen();