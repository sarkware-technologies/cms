import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import routes from "./router.js";
import DBM from "./utils/db.js";
import MYDBM from "./utils/mysql.js";
import cache from "./utils/cache.js";

/* Adde comment for trigger */

class CmsServer {

    constructor() {
        /* Load the express */
        this.app = express();       
        this.setupMiddlewares();        
        this.setupRoutes();           
    }

    setupMiddlewares = () => {

        this.app.use((req, res, next) => {            
            next();
        });

         /**
         * 
         * Global exception handler 
         * 
         */          
         this.app.use((err, req, res, next) => {
            if (!err) {
                return next();
            }        
            console.error(err.stack);
            res.status(500);
            res.send(err.message ? err.message : 'Internal server error');
        });

        this.app.use(express.json());                
        this.app.use(cors());

    }

    setupRoutes = () => { 

        this.app.use('/cms', cors(), routes);

        this.app.get('/health', (req, res) => {
            res.status(200).json({ status: 'success', message: 'Application is running fine' });
        });

        this.app.get("*", (req, res) => {
            res.status(500);
            res.send("API NOT FOUND");
        });

    }

    listen = async () => {

        await DBM.connect();
        if (DBM.checkConnection()) {
            this.app.listen(process.env.COMPOSER_PORT);
        } else {
            console.log("DB connection error");
        }      

    }

}

/* Kick start the server */
const server = new CmsServer();
server.listen();