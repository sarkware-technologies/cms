import EM from "./entity.js";
import SegmentQueueStatus from "../enums/segment-queue-status.js";

class HouseKeep {

    constructor() {

        if (!HouseKeep.instance) {            
            HouseKeep.instance = this;            
        }
  
        return HouseKeep.instance;

    };

    check = async () => {

        try {

            const segmentQueueModel = await EM.getModel("cms_segment_queue");
            const segmentBuilderStatusModel = await EM.getModel("cms_segment_builder_status");
            const segmentRetailerBufferModel = await EM.getModel("cms_segment_retailer_buffer");
            const segmentOrderBuilderModel = await EM.getModel("cms_segment_order_queue");

            const buildQueue = await segmentQueueModel.find({}).lean();
            await segmentQueueModel.deleteMany({});
            await  segmentOrderBuilderModel.deleteMany({});
            
            if (Array.isArray(buildQueue) && buildQueue.length > 0) {
                console.log(`${buildQueue.length} corrupted queue cleared`);                
            } else {
                console.log("Segment queue - GOOD");
            }

            const buildStatus = await segmentQueueModel.find({ status: true }).lean();

            await segmentBuilderStatusModel.updateMany(
                { status: true },
                { status: false, totalBatch: 0, currentBatch: 0, totalRecord: 0, completedBatch: 0, pendingBatch: 0, elapsedTime: null }
            );

            if (Array.isArray(buildStatus) && buildStatus.length > 0) {
                console.log(`${buildStatus.length} segment builder status cleared`);                
            } else {
                console.log("Segment status - GOOD");
            }

            const deleted = await segmentRetailerBufferModel.deleteMany({});
            if (deleted && deleted.deletedCount) {
                console.log(`${deleted.deletedCount} segment buffer cleared`);       
            } else {
                console.log("Segment retailer buffer - GOOD");
            }
            

        } catch (e) {
            console.log("Error while doing house keeping", e);
        }

    };

}

const HK = new HouseKeep();
export default HK;