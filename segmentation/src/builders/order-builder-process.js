import OrderBuilder from "./order-builder.js";

const orderBuilder = new OrderBuilder();

process.on('message', async (message) => {
    
    console.log(`Starting OrderBuilder`);
    try {
        await orderBuilder.start();
    } catch (error) {
        console.error(`Error in OrderBuilder for : `, error);
        process.exit(1);
    } finally {
        console.log(`OrderBuilder completed. Exiting process.`);
        process.exit(0);
    }
    
});

process.on('uncaughtException', (error) => {
    console.error("Uncaught exception in OrderBuilder worker:", error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error("Unhandled promise rejection in OrderBuilder worker:", reason);
    process.exit(1);
});
