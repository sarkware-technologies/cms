import { Router } from 'express';

import RegisterRouter from './register.js';
import AuthRouter from './authentication.js';

const ping = (_req, _res) => {
    _res.status(200).send("Its working");
};

const routes = new Router();
routes.use(new RegisterRouter().getRoutes());
routes.use(new AuthRouter().getRoutes());

routes.get("/hello", ping);

export default routes;