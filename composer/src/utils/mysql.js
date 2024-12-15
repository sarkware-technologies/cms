import dotenv from "dotenv";
dotenv.config();
import mysql from 'mysql2/promise';

class MysqlManager {

    constructor() {

        if (!MysqlManager.instance) {
            MysqlManager.instance = this;
            this.connection = null;
            this.pool = null;
            this.isPool = false;
            this.errorMessages = [];
        }

        return MysqlManager.instance;

    }

    // Initialize connection (pool or dedicated connection based on usePool)
    connect = async (usePool = true) => {

        this.isPool = usePool;

        // Avoid reconnecting if already connected
        if (usePool && this.pool) {
            return;
        }
        if (!usePool && this.connection) {
            return;
        }

        try {
            if (usePool) {
                // Initialize connection pool
                this.pool = mysql.createPool({
                    connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
                    host: process.env.API_DB_HOST,
                    port: process.env.API_DB_PORT,
                    user: process.env.API_DB_USER,
                    password: process.env.API_DB_PASS,
                    database: process.env.API_DB,
                    connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT, 10) || 30000
                });
                console.log("MySQL connection pool created successfully.");
            } else {
                // Initialize dedicated connection
                this.connection = await mysql.createConnection({
                    host: process.env.API_DB_HOST,
                    port: process.env.API_DB_PORT,
                    user: process.env.API_DB_USER,
                    password: process.env.API_DB_PASS,
                    database: process.env.API_DB,
                    connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT, 10) || 30000
                });
                console.log("Dedicated MySQL connection established successfully.");
            }
        } catch (error) {
            console.error("Error initializing MySQL connection:", error.message);
            throw error;
        }
        
    };

    // Execute a query
    query = async (_query, _params = [], retries = 3) => {
        try {
            return await this.queryWithConditions(_query, _params, retries);
        } catch (err) {
            throw err;
        }
    };

    // Query with retry logic
    queryWithConditions = async (_query, _params = [], retries = 3) => {
        if (this.isPool && !this.pool) {
            throw new Error("Connection pool not initialized. Call `connect(true)` first.");
        }
        if (!this.isPool && !this.connection) {
            throw new Error("Dedicated connection not initialized. Call `connect(false)` first.");
        }

        try {
            const connectionMethod = this.isPool ? this.pool : this.connection;

            const [rows] = await connectionMethod.query(_query, _params);
            return rows;
        } catch (err) {
            this.errorMessages.push(err.message);
            if (retries > 0) {
                console.warn(`Query failed. Retrying... (${retries} retries left)`);
                await this.delay(1000); // Wait for 1 second before retrying
                return this.queryWithConditions(_query, _params, retries - 1);
            }
            console.error("Query execution error:", err.message);
            throw err;
        }
    };

    // Close the pool or dedicated connection
    close = async () => {
        try {
            if (this.isPool && this.pool) {
                await this.pool.end();
                console.log("MySQL connection pool closed successfully.");
                this.pool = null; // Reset pool
            } else if (this.connection) {
                await this.connection.end();
                console.log("Dedicated MySQL connection closed successfully.");
                this.connection = null; // Reset connection
            }
        } catch (err) {
            console.error("Error closing MySQL connection:", err.message);
            throw err;
        }
    };

    // Retrieve error messages
    getErrorMessages = () => {
        const errors = [...this.errorMessages];
        this.errorMessages = []; // Optional: clear after retrieval
        return errors;
    };

    // Check if connected
    isConnected = () => {
        return this.isPool
            ? this.pool !== null
            : this.connection && this.connection.connection.state !== 'disconnected';
    };

    // Utility method for delay
    delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
}

const MYDBM = new MysqlManager();
export default MYDBM;