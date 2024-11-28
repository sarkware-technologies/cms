import dotenv from "dotenv";
dotenv.config();
import MYDBM from "../utils/mysql.js";
import DbResource from "../enums/db-resource.js";

export default class QueryBrowser {

    constructor() {
        this.tables = [];
        this.views = [];
        this.procedures = [];
    }

    /**
     * 
     * Load all resources (tables, views, and procedures) in the database
     * 
     */
    loadResources = async () => {

        try {
            // Load tables
            this.tables = await this.listResources("BASE TABLE");
            // Load views
            this.views = await this.listResources("VIEW");
            // Load procedures
            this.procedures = await this.listResources("PROCEDURE");

            console.log("Resources loaded successfully!");

        } catch (err) {
            console.error("Error loading resources:", err.message);
            throw err;
        }

    };

    /**
     * 
     * List resources (tables, views, or procedures) in the database
     * @param {String} type - Type of resource to list ('BASE TABLE', 'VIEW', 'PROCEDURE')
     * @returns {Promise<Array<String>>}
     * 
     */
    listResources = async (type) => {
        
        try {

            let query;

            if (type === "PROCEDURE") {
                query = `
                    SELECT routine_name AS resource_name
                    FROM information_schema.routines
                    WHERE routine_schema = ? AND routine_type = ?`;
            } else {
                query = `
                    SELECT table_name AS resource_name
                    FROM information_schema.tables
                    WHERE table_schema = ? AND table_type = ?`;
            }

            const resources = await MYDBM.queryWithConditions(query, [process.env.API_DB, type]);
            const resourceNames = resources.map((row) => row.resource_name);

            if (this.tables.length == 0 && type == "BASE TABLE") {
                this.tables = resourceNames;
            }
            if (this.views.length == 0 && type == "VIEW") {
                this.views = resourceNames
            }
            if (this.procedures.length == 0 && type == "PROCEDURE") {
                this.procedures = resourceNames
            }
            
            return resourceNames;

        } catch (err) {
            console.error(`Error listing ${type}s:`, err.message);
            throw err;
        }

    };

    /**
     * 
     * Validate a table name against preloaded resources
     * @param {String} tableName - Name of the table to validate
     * 
     */
    validateTableName = (tableName) => {
        if (!this.tables.includes(tableName) && !this.views.includes(tableName)) {
            throw new Error(`Invalid table or view name: ${tableName}`);
        }
    };

    /**
     * 
     * Fetch all records from a table with pagination support
     * @param {Object} _req - Request object containing query params
     * @returns {Promise<Object>}
     * 
     */
    selectResource = async (_req) => {

        const tableName = _req.query.tableName;

        try {
            this.validateTableName(tableName); // Validate table name
        } catch (error) {
            throw new Error(`Table validation failed: ${error.message}`);
        }

        try {

            const result = {
                records: [],                
                totalRecords: 0,
                elapsed: 0,
                pageSize: 25
            };

            const page = parseInt(_req.query.page) || 1;
            const skip = (page - 1) * parseInt(process.env.PAGE_SIZE);
            const limit = parseInt(process.env.PAGE_SIZE);

            const startTime = Date.now();

            // Get the total record count
            const countQuery = `SELECT COUNT(*) AS total FROM ${tableName}`;   console.log(countQuery); 
            const [countRows] = await MYDBM.queryWithConditions(countQuery);   console.log(countRows);
            result.totalRecords = countRows.total;

            // Get paginated records
            const selectQuery = `SELECT * FROM ${tableName} LIMIT ? OFFSET ?`;
            const records = await MYDBM.queryWithConditions(selectQuery, [limit, skip]);            

            result.records = records;
            result.elapsed = this.calculateElapsedTime(startTime, Date.now());
            result.pageSize = limit;
            
            return result;

        } catch (e) {
            throw e;
        }

    };

    /**
     * 
     * Fetch table structure (alternative to `selectTable`)     
     * @param {String} tableName - Table name to fetch structure for
     * @returns {Promise<Array<Object>>}
     * 
     */
    async getTableStructure(_req) {

        try {

            const result = {
                records: [],                
                totalRecords: 0,
                elapsed: 0,
                pageSize: 25
            };

            const tableName = _req.query.tableName;

            const columnsQuery = `
                SELECT column_name, data_type, is_nullable, column_default, extra 
                FROM information_schema.columns 
                WHERE table_schema = ? AND table_name = ?
            `;
            const columns = await MYDBM.queryWithConditions(columnsQuery, [process.env.API_DB, tableName]);

            result.records = columns.map((column) => ({
                NAME: column.COLUMN_NAME,
                TYPE: column.DATA_TYPE,
                NULL: column.IS_NULLABLE === "YES",
                DEFAULT: column.COLUMN_DEFAULT
            }));

            result.totalRecords = result.records.length;
            result.pageSize = result.records.length;

            return result;

        } catch (e) {
            throw e;
        }

    }

    /**
     * 
     * Execute a query snippet with validation and pagination
     * @param {Object} _req - Request object containing query params
     * @returns {Promise<Object>}
     * 
     */
    executeSnippet = async (_req) => {
        
        try {
            if (!_req.body || !_req.body.query) {
                throw new Error("Request body or query is missing.");
            }
    
            const originalQuery = _req.body.query.trim(); // Frontend query
            const page = parseInt(_req.query.page) || 1;
            const limit = parseInt(process.env.PAGE_SIZE) || 25;
            const offset = (page - 1) * limit;
    
            // Check for unsafe statements
            if (this.containsUnsafeStatements(originalQuery)) {
                throw new Error("Query contains unsafe statements (DROP, DELETE, UPDATE, etc.).");
            }
    
            // Parse and transform query for pagination
            const paginatedQuery = `${originalQuery} LIMIT ${limit} OFFSET ${offset}`;
            console.log(`Paginated Query: ${paginatedQuery}`);
    
            const result = {
                records: [],
                elapsed: 0,
                totalRecords: 0,
                pageSize: limit
            };
    
            // Generate count query dynamically
            const countQuery = this.generateCountQuery(originalQuery);
            console.log(`Count Query: ${countQuery}`);
    
            // Fetch total records
            const [countRows] = await MYDBM.query(countQuery);
            result.totalRecords = countRows?.total || 0;
    
            // Fetch paginated records
            const startTime = Date.now();
            const records = await MYDBM.query(paginatedQuery);
            result.elapsed = this.calculateElapsedTime(startTime, Date.now());
            result.pageSize = limit;
    
            if (Array.isArray(records)) {
                result.records = records;
            }
    
            return result;
        } catch (error) {
            console.error(`Error in executeSnippet: ${error.message}`);
            throw new Error(`Error executing query: ${error.message}`);
        }

    };    

    generateCountQuery = (query) => {
        
        const lowerQuery = query.toLowerCase();
        const selectIndex = lowerQuery.indexOf("select");
        const fromIndex = lowerQuery.indexOf("from");
    
        if (selectIndex === -1 || fromIndex === -1) {
            throw new Error("Invalid SQL query: Missing SELECT or FROM clause.");
        }
    
        // Replace SELECT clause with COUNT(*) for the count query
        const countQuery = `SELECT COUNT(*) AS total ${query.substring(fromIndex)}`;
    
        return countQuery;

    };

    /**
     * 
     * Check if a query contains unsafe statements
     * @param {String} query - SQL query to validate
     * @returns {Boolean}
     * 
     */
    containsUnsafeStatements = (query) => {
        const unsafePatterns = /\b(DROP|DELETE|UPDATE|INSERT)\b/i;
        return unsafePatterns.test(query);
    };

    calculateElapsedTime = (_startTime, _endTime) => {

        const elapsedMilliseconds = _endTime - _startTime;

        const hours = Math.floor(elapsedMilliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((elapsedMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsedMilliseconds % (1000 * 60)) / 1000);
        const milliseconds = elapsedMilliseconds % 1000;

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;

    };

}
