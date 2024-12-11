import { Router } from "express";
import Utils from "../utils/utils.js";
import ABtestmappingService from "../services/Abtesting/abtestmapping.js"
import RC from '../utils/request-interceptor.js';

const router = Router();
const abtestingmappingService = new ABtestmappingService();
const moduleHandle = "api_manager";


// AB tesing
router.get(
    `/${moduleHandle}/mapping/all`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await abtestingmappingService.listAll(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}/mapping/:id`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await abtestingmappingService.get(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}/mapping/list/pagination`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await abtestingmappingService.list(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.put(
    `/${moduleHandle}/mapping/:id`,
    await RC.interceptRequest(moduleHandle, 'put', [], async (req, res) => {
        try {
            res.status(200).json(await abtestingmappingService.update(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.delete(
    `/${moduleHandle}/mapping/:id`,
    await RC.interceptRequest(moduleHandle, 'delete', [], async (req, res) => {
        try {
            res.status(200).json(await abtestingmappingService.delete(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.post(
    `/${moduleHandle}/mapping`,
    await RC.interceptRequest(moduleHandle, 'post', [], async (req, res) => {
        try {
            res.status(200).json(await abtestingmappingService.mapping(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.get(
    `/${moduleHandle}/mapped/:type/:id`,
    await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
        try {
            res.status(200).json(await abtestingmappingService.getmappeddetails(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.put(
    `/${moduleHandle}/remove/:type/:id`,
    await RC.interceptRequest(moduleHandle, 'put', [], async (req, res) => {
        try {
            res.status(200).json(await abtestingmappingService.removemappted(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);


router.put(
    `/${moduleHandle}/redis`,
    await RC.interceptRequest(moduleHandle, 'put', [], async (req, res) => {
        try {
            res.status(200).json(await abtestingmappingService.getallRedis(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);








// // build version
// router.get(
//     `/${moduleHandle}/build/all`,
//     await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
//         try {
//             res.status(200).json(await abtestingmappingService.listAll(req));
//         } catch (error) {
//             Utils.handleError(error, res);
//         }
//     })
// );

// router.get(
//     `/${moduleHandle}/build/version/:id`,
//     await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
//         try {
//             res.status(200).json(await abtestingmappingService.get(req));
//         } catch (error) {
//             Utils.handleError(error, res);
//         }
//     })
// );

// router.get(
//     `/${moduleHandle}/build/list/pagination`,
//     await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
//         try {
//             res.status(200).json(await abtestingmappingService.list(req));
//         } catch (error) {
//             Utils.handleError(error, res);
//         }
//     })
// );

// router.put(
//     `/${moduleHandle}/build/version/:id`,
//     await RC.interceptRequest(moduleHandle, 'put', [], async (req, res) => {
//         try {
//             res.status(200).json(await abtestingmappingService.update(req));
//         } catch (error) {
//             Utils.handleError(error, res);
//         }
//     })
// );

// router.delete(
//     `/${moduleHandle}/build/version/:id`,
//     await RC.interceptRequest(moduleHandle, 'delete', [], async (req, res) => {
//         try {
//             res.status(200).json(await abtestingmappingService.delete(req));
//         } catch (error) {
//             Utils.handleError(error, res);
//         }
//     })
// );

// router.post(
//     `/${moduleHandle}/build/version`,
//     await RC.interceptRequest(moduleHandle, 'post', [], async (req, res) => {
//         try {
//             res.status(200).json(await abtestingmappingService.create(req));
//         } catch (error) {
//             Utils.handleError(error, res);
//         }
//     })
// );



// // API version

// router.get(
//     `/${moduleHandle}/api/all`,
//     await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
//         try {
//             res.status(200).json(await abtestingmappingService.listAll(req));
//         } catch (error) {
//             Utils.handleError(error, res);
//         }
//     })
// );

// router.get(
//     `/${moduleHandle}/api/:id`,
//     await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
//         try {
//             res.status(200).json(await abtestingmappingService.get(req));
//         } catch (error) {
//             Utils.handleError(error, res);
//         }
//     })
// );

// router.get(
//     `/${moduleHandle}/api/list/pagination`,
//     await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
//         try {
//             res.status(200).json(await abtestingmappingService.list(req));
//         } catch (error) {
//             Utils.handleError(error, res);
//         }
//     })
// );

// router.put(
//     `/${moduleHandle}/api/:id`,
//     await RC.interceptRequest(moduleHandle, 'put', [], async (req, res) => {
//         try {
//             res.status(200).json(await abtestingmappingService.update(req));
//         } catch (error) {
//             Utils.handleError(error, res);
//         }
//     })
// );

// router.delete(
//     `/${moduleHandle}/api/:id`,
//     await RC.interceptRequest(moduleHandle, 'delete', [], async (req, res) => {
//         try {
//             res.status(200).json(await abtestingmappingService.delete(req));
//         } catch (error) {
//             Utils.handleError(error, res);
//         }
//     })
// );

// router.post(
//     `/${moduleHandle}/api`,
//     await RC.interceptRequest(moduleHandle, 'post', [], async (req, res) => {
//         try {
//             res.status(200).json(await abtestingmappingService.create(req));
//         } catch (error) {
//             Utils.handleError(error, res);
//         }
//     })
// );

// router.post(
//   `/${moduleHandle}/api`,
//   await RC.interceptRequest(moduleHandle, 'post', [], async (req, res) => {
//       try {
//           res.status(200).json(await abtestingmappingService.create(req));
//       } catch (error) {
//           Utils.handleError(error, res);
//       }
//   })
// );

// router.get(
//   `/${moduleHandle}/retailers/list`,
//   await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
//       try {
//           res.status(200).json(await abtestingmappingService.getRetailer(req));
//       } catch (error) {
//           Utils.handleError(error, res);
//       }
//   })
// );


// router.get(
//   `/${moduleHandle}/region/list`,
//   await RC.interceptRequest(moduleHandle, 'get', [], async (req, res) => {
//       try {
//           res.status(200).json(await abtestingmappingService.getRgions());
//       } catch (error) {
//           Utils.handleError(error, res);
//       }
//   })
// );


export default router;