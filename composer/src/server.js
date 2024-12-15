import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import routes from "./router.js";
import MDBM from "./utils/mongo.js";
import MYDBM from "./utils/mysql.js";
import RC from "./utils/request-interceptor.js";

class ComposerServer {

    constructor() {
        /* Load the express */
        this.app = express();       
        this.setupMiddlewares();        
        this.setupRoutes();           
    }

    setupMiddlewares = () => {

        this.app.use(express.json());                
        this.app.use(cors());

        RC.init(this.app);

    }

    setupRoutes = () => { 

        this.app.use('/cms/v1', cors(), routes);
        /* Keeping this for legacy support */
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

        try {

            await MDBM.connect();
            await MYDBM.connect(true);
            
            if (MDBM.isConnected()) {
                this.app.listen(process.env.COMPOSER_PORT);
            } else {
                console.log("DB connection error");
            }    
            
        } catch (e) {
            console.log(e);
        }

    }

}

/* Kick start the server */
const server = new ComposerServer();
server.listen();