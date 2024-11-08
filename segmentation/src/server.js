import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import routes from "./routes/index.js"
import MDBM from "./utils/mongo.js";
import MYDBM from "./utils/mysql.js";
import RC from "./utils/request-interceptor.js";
import OrderImporter from "./importers/order-import.js";
import RetailerImporter from "./importers/retailer-import.js";
import StoreImporter from "./importers/store-import.js";

/**
 * 
 * @author: Sark
 * @version : 1.0
 * 
 */

class SegmentServer {

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

        RC.init(this.app);

    };

    setupRoutes = () => {    

        this.app.use('/segmentation/v1', cors(), routes);   
        
        this.app.use('/health', (req, res) => {
            res.status(200).json({ status: 'success', message: 'Application is running fine' });
        });
        
        this.app.get("*", (req, res) => {
            res.status(500);
            res.send("API NOT FOUND");
        });

    };

    listen = async () => {

        try {

            await MDBM.connect();   
            await MYDBM.connect(true);

            const sss = new OrderImporter();
            await sss.start();     
            
            if (MDBM.checkConnection()) {
                this.app.listen(process.env.SYSTEM_PORT);
            } else {
                console.log("MongoDB connection error");
            }

        } catch (e) {
            console.log(e);
        }
        
    };

}

/* Kick start the server */
const server = new SegmentServer();
server.listen();