import { Router } from 'express';

import RegisterRouter from './register.js';
import AuthRouter from './authentication.js';
import RoleRouter from './role.js';
import AuthTypeRouter from './auth-type.js';
import ServiceRouter from './service.js';
import ModuleRouter from './module.js';
import MenuRouter from './menu.js';
import HostRouter from './host.js';
import EntityRouter from './entity.js';
import FieldRouter from './field.js';

const ping = (_req, _res) => {
    _res.status(200).send("Its working");
};

const routes = new Router();
routes.get("/hello", ping);

routes.use(new RegisterRouter().getRoutes());
routes.use(new AuthRouter().getRoutes());
routes.use(new RoleRouter().getRoutes());
routes.use(new AuthTypeRouter().getRoutes());
routes.use(new ServiceRouter().getRoutes());
routes.use(new ModuleRouter().getRoutes());
routes.use(new MenuRouter().getRoutes());
routes.use(new HostRouter().getRoutes());
routes.use(new EntityRouter().getRoutes());
routes.use(new FieldRouter().getRoutes());

export default routes;