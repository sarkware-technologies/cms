import dotenv from "dotenv";
dotenv.config();

import mysql from 'mysql';

class MysqlManager {  

    constructor () {

        this.pool = mysql.createPool({
            connectionLimit : 10,
            host: process.env.API_DB_HOST,
            port: process.env.API_DB_PORT,
            user: process.env.API_DB_USER,
            password: process.env.API_DB_PASS,
            database: process.env.API_DB,
            connectTimeout: 30000
        });

    }
    
    query = async (_query) => {
        try {
            return await this.queryWithConditions(_query, []);
        } catch (_e) {
            throw _e;
        }        
    }

    queryWithConditions = async (_query, _params) => {

        try {

            return await new Promise((resolve, reject) => {
                this.pool.getConnection((err, connection) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    connection.query(_query, _params, (err, rows) => {
                        connection.release();
                        if (err) {
                            reject(err);
                            return;
                        }
                        const jsonRows = JSON.parse(JSON.stringify(rows));
                        resolve(jsonRows);
                    });
                });
            });

        } catch (err) {
            //console.error('Error selecting users:', err);
            throw err;
        }

    };

}

const MYDBM = new MysqlManager();
export default MYDBM;