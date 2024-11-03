import dotenv from "dotenv";
dotenv.config();
import mysql from 'mysql';

class MysqlManager {  
    constructor () {
        if (!MysqlManager.instance) {            
            MysqlManager.instance = this;
            
            this.pool = mysql.createPool({
                connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
                host: process.env.API_DB_HOST,
                port: process.env.API_DB_PORT,
                user: process.env.API_DB_USER,
                password: process.env.API_DB_PASS,
                database: process.env.API_DB,
                connectTimeout: process.env.DB_CONNECT_TIMEOUT || 30000
            });

            this.errorMessages = [];  // Track error messages
        }
        return MysqlManager.instance;
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
        try {
            return await new Promise((resolve, reject) => {
                this.pool.getConnection((err, connection) => {
                    if (err) {
                        this.errorMessages.push(err.message);
                        reject(err);
                        return;
                    }
                    connection.query(_query, _params, (err, rows) => {
                        connection.release();
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
            });
        } catch (err) {
            console.error('Query execution error:', err.message);
            throw err;
        }
    };

    // Method to close the pool
    close = async () => {
        return new Promise((resolve, reject) => {
            this.pool.end((err) => {
                if (err) {
                    console.error('Error closing MySQL connection pool:', err.message);
                    reject(err);
                } else {
                    console.log('MySQL connection pool closed successfully.');
                    resolve();
                }
            });
        });
    };

    // Method to get logged error messages
    getErrorMessages = () => this.errorMessages;
}

const MYDBM = new MysqlManager();
export default MYDBM;