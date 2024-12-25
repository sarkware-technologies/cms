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
import serviceVersion from './service-version.js';
import api from './api.js';
import privilege from './privilege.js';
import user from './user.js';
import versionManager from './version.js';
import queryBrowser from './query-browser.js';
import CacheRouter from './cache.js';
import ABTestingRouter from './abtesting.js';
import ABTestmappingRouter from './abtestmapping.js';
import SponsoredProductRouter from './sponsored-products.js';
import SearchVersionRouter from  './search-version.js';

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
routes.use(serviceVersion);
routes.use(api);
routes.use(privilege);
routes.use(user);
routes.use(versionManager);
routes.use(queryBrowser);
routes.use(ABTestingRouter);
routes.use(ABTestmappingRouter);
routes.use(SponsoredProductRouter);
routes.use(SearchVersionRouter);
routes.use(new CacheRouter().getRoutes());

export default routes;