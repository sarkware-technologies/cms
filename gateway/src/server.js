import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";



class GatewayServer {

    constructor() {

        /* Load the express */
        this.server = express();  
        this.setupMiddlewares();

        this.router = new RouterManager(this.server);
        this.router.initRequestHandler();

    }

    listen() {        
        this.server.listen(process.env.GATEWAY_PORT); 
        socket.init();      
    }

}

/* Kick start the server */
const gateway = new GatewayServer();
gateway.listen();