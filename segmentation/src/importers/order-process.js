import OrderImporter from "./order-import.js";

const importer = new OrderImporter();

process.on('message', async (message) => {

    switch (message.command) {
        case 'start':
            await importer.start();
            process.send({ status: 'completed' });
            break;
        case 'stop':
            await importer.stop();
            process.send({ status: 'stopped' });
            break;
        default:
            console.error('Unknown command:', message.command);
    }

});