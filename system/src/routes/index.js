import { Router } from 'express';

import UserRouter from './user.js';

const routes = new Router();
routes.use(new UserRouter().getRoutes());

export default routes;