import { fork } from 'child_process';
import EM from "../utils/entity.js";
import SegmentQueueStatus from '../enums/segment-queue-status.js';

class SegmentBuildManager {

    constructor() {
        this.activeProcesses = new Map();
        this.maxConcurrentBuilders = 1;
        this.segmentQueueModel = null;        
    }

    /* Singleton instance holder */
    static instance;

    static getInstance() {
        if (!SegmentBuildManager.instance) {
            SegmentBuildManager.instance = new SegmentBuildManager();
        }
        return SegmentBuildManager.instance;
    }

    async init() {
        this.segmentQueueModel = await EM.getModel("cms_segment_queue");
    }

    isFree = () => this.activeProcesses.size === 0;

    async processQueue() {

        await this.init();

        if (this.activeProcesses.size > 0) {
            console.log("Segment build is already in progress. Exiting processQueue.");
            return;
        }

        const waitingSegments = await this.segmentQueueModel.find({
            queueStatus: SegmentQueueStatus.WAITING,
        }).limit(this.maxConcurrentBuilders).lean();

        if (waitingSegments.length === 0) {
            console.log("No waiting segments found. Exiting.");
            return;
        }

        for (const queue of waitingSegments) {
            if (this.activeProcesses.size < this.maxConcurrentBuilders) {                
                await this.segmentQueueModel.findByIdAndUpdate(
                    queue._id, 
                    { queueStatus: SegmentQueueStatus.BUILDING }
                );  
                this.startSegmentBuilder(queue.segment);
            }
        }

    }

    startSegmentBuilder(segmentId) {

        const builderProcess = fork('./src/builders/segment-builder-process.js');
        this.activeProcesses.set(segmentId, builderProcess);

        builderProcess.once('exit', (code) => {
            console.log(`SegmentBuilder process for segment ${segmentId} exited with code ${code}`);
            this.activeProcesses.delete(segmentId);
            this.checkForNextSegment();
        });

        builderProcess.once('error', (error) => {
            console.error(`Error in SegmentBuilder process for segment ${segmentId}:`, error);
            this.activeProcesses.delete(segmentId);
        });

        builderProcess.send({ segmentId });

    }

    /**
     * Checks if a new segment can be processed when a process slot becomes available.
     */
    async checkForNextSegment() {
        
        if (this.activeProcesses.size >= this.maxConcurrentBuilders) {
            return;
        }

        const nextSegment = await this.segmentQueueModel.findOneAndUpdate(
            { queueStatus: SegmentQueueStatus.WAITING },
            { queueStatus: SegmentQueueStatus.BUILDING },
            { new: true }
        ).lean();

        if (nextSegment) {
            this.startSegmentBuilder(nextSegment.segment);
        } else if (this.activeProcesses.size === 0) {
            console.log("No more segments in queue..");            
        }

    }

}

export default SegmentBuildManager;