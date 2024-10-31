import { Router } from 'express';
import segment from './segment.js';
import api from './api.js';

const ping = (_req, _res) => {
    _res.status(200).send("Its working");
};

const routes = Router();
routes.get("/hello", ping);

routes.use(api);
routes.use(segment);

export default routes;