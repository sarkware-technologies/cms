import { Router } from 'express';

import register from './register.js';
import auth from './authentication.js';
import role from './role.js';
import authType from './auth-type.js';
import service from './service.js';
import module from './module.js';
import menu from './menu.js';
import host from './host.js';
import entity from './entity.js';
import field from './field.js';
import version from './service-version.js';
import segment from './segment.js';
import api from './api.js';
import privilege from './privilege.js';

const ping = (_req, _res) => {
    _res.status(200).send("Its working");
};

const routes = Router();
routes.get("/hello", ping);

routes.use(register);
routes.use(auth);
routes.use(role);
routes.use(authType);
routes.use(service);
routes.use(module);
routes.use(menu);
routes.use(host);
routes.use(entity);
routes.use(field);
routes.use(version);
routes.use(segment);
routes.use(api);
routes.use(privilege);

export default routes;