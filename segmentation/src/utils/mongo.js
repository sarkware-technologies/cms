import mongoose from "mongoose";

/**
 *
 * @author          Sark
 * @version         1.0.0
 * @description     Responsible for establishing connection with configured mongo db instance
 *                  This connection will happens at the time of server startup,
 *                  After that you don't need to interact with db directly
 *
 */
class MongoManager {

    constructor() {
        if (!MongoManager.instance) {
            MongoManager.instance = this;
            
            this.db = null;          
            this.errorMessages = [];
            this.reconnectCount = 0;
            this.disconnectedCount = 0;
            this.options = {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            };
        }

        return MongoManager.instance;
    }

    connect = async (retryCount = 5) => {

        let attempts = 0;
        
        const connectWithRetry = async () => {
            try {
                await mongoose.connect(process.env.MONGO_HOST, this.options);
            } catch (error) {
                attempts++;
                console.error(`MongoDB connection attempt ${attempts} failed:`, error.message);
                this.errorMessages.push(error.message);
                if (attempts < retryCount) {
                    console.log(`Retrying connection in 5 seconds... (${attempts}/${retryCount})`);
                    setTimeout(connectWithRetry, 5000); // Retry after delay
                } else {
                    console.error('MongoDB connection failed after max retries');
                    return;
                }
            }
        };

        await connectWithRetry();
        this.db = mongoose.connection;
        this.db.on("connected", this.handleConnected);
        this.db.on("disconnected", this.handleDisconnected);
        this.db.on("error", this.handleError);

        process.on('SIGINT', this.handleExitSignal);
    };

    handleError = (err) => {
        console.error('MongoDB connection error: ', err.message);
        this.errorMessages.push(err.message); // Store error for later review
    };

    handleConnected = () => {        
        this.reconnectCount++;
    };

    handleDisconnected = () => {
        this.disconnectedCount++;        
    };

    handleExitSignal = () => {
        this.close()
            .then(() => {
                console.log('MongoDB connection closed due to app termination');
                process.exit(0);
            })
            .catch((err) => {
                console.error('Error during MongoDB shutdown:', err);
                process.exit(1);
            });
    };

    close = async () => {
        if (this.db) {
            try {
                await this.db.close();                
            } catch (error) {
                console.error('Error closing MongoDB connection:', error);
            }
        }
    };

    getErrorMessages = () => this.errorMessages;

    isConnected = () => (this.db.readyState === 1);

    getReconnectedCount = () => this.reconnectCount;

    getDisconnectedCount = () => this.disconnectedCount;
}

const DBM = new MongoManager();
export default DBM;