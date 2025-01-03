import dotenv from "dotenv";
dotenv.config();
import mysql from 'mysql';

class MysqlSearchManager {

    constructor () {
        if (!MysqlSearchManager.instance) {
            MysqlSearchManager.instance = this;
            this.connection = null;
            this.pool = null;
            this.isPool = false;
            this.errorMessages = [];
        }
        return MysqlSearchManager.instance;
    }

    connect = async (usePool = true) => {
        
        this.isPool = usePool;

        // Avoid reconnecting if already connected
        if ((usePool && this.pool) || (!usePool && this.connection)) {
            return;
        }

        if (usePool) {
            this.pool = mysql.createPool({
                connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
                host: process.env.SEARCH_DB_HOST  || 'pharmretail2-db-uat.cluster-ctssgo0yqx6r.ap-south-1.rds.amazonaws.com',
                port: process.env.SEARCH_DB_PORT || 3306,
                user: process.env.SEARCH_DB_USER || 'prwebelastic_uat',
                password: process.env.SEARCH_DB_PASS || '6hFh6rfSj91aH',
                database: process.env.SEARCH_DB  || 'pharmarackdb',
                connectTimeout: process.env.DB_CONNECT_TIMEOUT || 30000
            });
        } else {
            this.connection = mysql.createConnection({
                host: process.env.SEARCH_DB_HOST  || 'pharmretail2-db-uat.cluster-ctssgo0yqx6r.ap-south-1.rds.amazonaws.com',
                port: process.env.SEARCH_DB_PORT || 3306,
                user: process.env.SEARCH_DB_USER || 'prwebelastic_uat',
                password: process.env.SEARCH_DB_PASS || '6hFh6rfSj91aH',
                database: process.env.SEARCH_DB  || 'pharmarackdb',
                connectTimeout: process.env.DB_CONNECT_TIMEOUT || 30000
            });

            return new Promise((resolve, reject) => {
                this.connection.connect((err) => {
                    if (err) {
                        console.error("Error connecting to MySQL:", err.message);
                        reject(err);
                    } else {                        
                        resolve();
                    }
                });
            });
        }
    }

    // General query method
    query = async (_query, retries = 3) => {
        try {
            return await this.queryWithConditions(_query, [], retries);
        } catch (err) {
            throw err;
        }        
    }

    // Query with parameters and retry logic
    queryWithConditions = async (_query, _params, retries = 3) => {

        if (this.isPool && !this.pool) {
            throw new Error("Connection pool not initialized. Call `connect(true)` first.");
        }
        if (!this.isPool && !this.connection) {
            throw new Error("Single connection not initialized. Call `connect(false)` first.");
        }

        try {

            return await new Promise((resolve, reject) => {
                const connectionMethod = this.isPool ? this.pool : this.connection;
                
                connectionMethod.query(_query, _params, (err, rows) => {
                    if (err) {
                        this.errorMessages.push(err.message);
                        if (retries > 0) {
                            console.warn(`Query failed. Retrying... (${retries} retries left)`);
                            setTimeout(() => {
                                resolve(this.queryWithConditions(_query, _params, retries - 1));
                            }, 1000);
                        } else {
                            reject(err);
                        }
                        return;
                    }
                    resolve(JSON.parse(JSON.stringify(rows)));
                });
            });

        } catch (err) {
            console.error('Query execution error:', err.message);
            throw err;
        }

    };

    // Method to close the pool or single connection
    close = async () => {

        if (this.isPool && this.pool) {
            // Close connection pool
            return new Promise((resolve, reject) => {
                this.pool.end((err) => {
                    if (err) {
                        console.error('Error closing MySQL connection pool:', err.message);
                        reject(err);
                    } else {                        
                        this.pool = null; // Set pool to null after closing
                        resolve();
                    }
                });
            });
        } else if (this.connection) {
            // Close single connection
            return new Promise((resolve, reject) => {
                this.connection.end((err) => {
                    if (err) {
                        console.error('Error closing MySQL connection:', err.message);
                        reject(err);
                    } else {                        
                        this.connection = null; // Set connection to null after closing
                        resolve();
                    }
                });
            });
        }

    };

    // Method to get logged error messages
    getErrorMessages = () => {
        const errors = [...this.errorMessages];
        this.errorMessages = []; // Optional: clear after retrieval
        return errors;
    }

    // Check if connected
    isConnected = () => {
        return this.isPool ? this.pool !== null : this.connection && this.connection.state !== 'disconnected';
    }

}

const MYDBM = new MysqlSearchManager();
export default MYDBM;