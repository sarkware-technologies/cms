import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import RouterManager from "./utils/route-manager";

class GatewayServer {

    constructor() {

        /* Load the express */
        this.server = express();  
        this.setupMiddlewares();

        this.router = new RouterManager(this.server);
        this.router.initRequestHandler();

    }

    setupMiddlewares = async () => {
      
        this.server.use(cors());  
        this.server.use((_err, _req, _res, _next) => {

            if (!_err) {
                return _next();
            }
  
            _res.status(500).setHeader("content-type", "text/plain").send("Internal server error");
        });
  
        process.on("uncaughtException", (err) => {
            console.error("Uncaught exception:", err);
        });

    };

    listen() {        
        this.server.listen(process.env.GATEWAY_PORT); 
        socket.init();      
    }

}

/* Kick start the server */
const gateway = new GatewayServer();
gateway.listen();