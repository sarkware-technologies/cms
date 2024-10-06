import { Router } from 'express';

import RegisterRouter from './register.js';
import AuthRouter from './authentication.js';
import RoleRouter from './role.js';
import AuthTypeRouter from './auth-type.js';

const ping = (_req, _res) => {
    _res.status(200).send("Its working");
};

const routes = new Router();
routes.use(new RegisterRouter().getRoutes());
routes.use(new AuthRouter().getRoutes());
routes.use(new RoleRouter().getRoutes());
routes.use(new AuthTypeRouter().getRoutes());

routes.get("/hello", ping);

export default routes;