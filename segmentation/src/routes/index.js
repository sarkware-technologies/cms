import { Router } from 'express';
import segment from './segment.js';
import api from './api.js';
import synch from './synch.js';
import importer from './importer.js';

const ping = (_req, _res) => {
    _res.status(200).send("Its working");
};

const routes = Router();
routes.get("/health", ping);

routes.use(api);
routes.use(segment);
routes.use(synch);
routes.use(importer);

export default routes;