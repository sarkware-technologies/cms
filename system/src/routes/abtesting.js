import { Router } from "express";
import Utils from "../utils/utils.js";
import ABtesingService from "../services/Abtesting/testing.js";
import ABbuildService from "../services/Abtesting/build.js";
import ABapiService from "../services/Abtesting/apis.js";
import RC from '../utils/request-interceptor.js';

const router = Router();
const abtesingService = new ABtesingService();
const abbuildService = new ABbuildService();
const abapiService = new ABapiService();
const moduleHandle = "api_manager";


// AB tesing
router.get(
    `/${moduleHandle}/ablist/all`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await abtesingService.listAll(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}/ablist/:id`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await abtesingService.get(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}/ablist/list/pagination`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await abtesingService.list(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.put(
    `/${moduleHandle}/ablist/:id`,
    await RC.interceptRequest(moduleHandle, 'put', [], async (req, res) => {
        try {
            res.status(200).json(await abtesingService.update(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.delete(
    `/${moduleHandle}/ablist/:id`,
    await RC.interceptRequest(moduleHandle, 'delete', [], async (req, res) => {
        try {
            res.status(200).json(await abtesingService.delete(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.post(
    `/${moduleHandle}/ablist`,
    await RC.interceptRequest(moduleHandle, 'post', [], async (req, res) => {
        try {
            res.status(200).json(await abtesingService.create(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);





// build version
router.get(
    `/${moduleHandle}/build/all`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await abbuildService.listAll(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}/build/version/:id`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await abbuildService.get(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}/build/list/pagination`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await abbuildService.list(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.put(
    `/${moduleHandle}/build/version/:id`,
    await RC.interceptRequest(moduleHandle, 'put', [], async (req, res) => {
        try {
            res.status(200).json(await abbuildService.update(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.delete(
    `/${moduleHandle}/build/version/:id`,
    await RC.interceptRequest(moduleHandle, 'delete', [], async (req, res) => {
        try {
            res.status(200).json(await abbuildService.delete(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.post(
    `/${moduleHandle}/build/version`,
    await RC.interceptRequest(moduleHandle, 'post', [], async (req, res) => {
        try {
            res.status(200).json(await abbuildService.create(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);



// API version

router.get(
    `/${moduleHandle}/api/all`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await abapiService.listAll(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}/api/:id`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await abapiService.get(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}/api/list/pagination`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await abapiService.list(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.put(
    `/${moduleHandle}/api/:id`,
    await RC.interceptRequest(moduleHandle, 'put', [], async (req, res) => {
        try {
            res.status(200).json(await abapiService.update(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.delete(
    `/${moduleHandle}/api/:id`,
    await RC.interceptRequest(moduleHandle, 'delete', [], async (req, res) => {
        try {
            res.status(200).json(await abapiService.delete(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.post(
    `/${moduleHandle}/api`,
    await RC.interceptRequest(moduleHandle, 'post', [], async (req, res) => {
        try {
            res.status(200).json(await abapiService.create(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.post(
  `/${moduleHandle}/api`,
  await RC.interceptRequest(moduleHandle, 'post', [], async (req, res) => {
      try {
          res.status(200).json(await abapiService.create(req));
      } catch (error) {
          Utils.handleError(error, res);
      }
  })
);

router.get(
  `/${moduleHandle}/retailers/list`,
  await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
      try {
          res.status(200).json(await abtesingService.getRetailer(req));
      } catch (error) {
          Utils.handleError(error, res);
      }
  })
);


router.get(
  `/${moduleHandle}/region/list`,
  await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
      try {
          res.status(200).json(await abtesingService.getRgions());
      } catch (error) {
          Utils.handleError(error, res);
      }
  })
);


export default router;