import SegmentBuilder from "./segment-builder.js";

const segmentBuilder = new SegmentBuilder();

process.on('message', async (message) => {
    if (message.segmentId) {
        console.log(`Starting SegmentBuilder for segment ${message.segmentId}`);
        try {
            await segmentBuilder.start(message.segmentId);
        } catch (error) {
            console.error(`Error in SegmentBuilder for segment ${message.segmentId}:`, error);
            process.exit(1);
        } finally {
            console.log(`SegmentBuilder for segment ${message.segmentId} completed. Exiting process.`);
            process.exit(0);
        }
    } else {
        console.error("No segmentId received in worker.");
        process.exit(1);
    }
});

process.on('uncaughtException', (error) => {
    console.error("Uncaught exception in SegmentBuilder worker:", error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error("Unhandled promise rejection in SegmentBuilder worker:", reason);
    process.exit(1);
});
