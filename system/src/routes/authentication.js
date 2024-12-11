import { Router } from "express";
import AuthService from "../services/authentication.js";
import Utils from "../utils/utils.js";
import RC from "../utils/request-interceptor.js";

const router = Router();
const authService = new AuthService();
const moduleHandle = "auth";

router.post(
    `/${moduleHandle}/sign-in`,
    await RC.interceptRequest(moduleHandle, 'post', ["*"], async (req, res) => {
        try {
            res.status(200).json(await authService.signIn(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.post(
    `/${moduleHandle}/sign-out`,
    await RC.interceptRequest(moduleHandle, 'post', ["*"], async (req, res) => {
        try {
            res.status(200).json(await authService.signOut(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.post(
    `/${moduleHandle}/refresh-access-token`,
    await RC.interceptRequest(moduleHandle, 'post', [], async (req, res) => {
        try {
            res.status(200).json(await authService.refreshAccessToken(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.post(
    `/${moduleHandle}/reset-password`,
    await RC.interceptRequest(moduleHandle, 'post', [], async (req, res) => {
        try {
            res.status(200).json(await authService.resetPassword(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.post(
    `/${moduleHandle}/select-role`,
    await RC.interceptRequest(moduleHandle, 'post', ["*"], async (req, res) => {
        try {
            res.status(200).json(await authService.selectRole(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.post(
    `/${moduleHandle}/user-auth-type`,
    await RC.interceptRequest(moduleHandle, 'post', ["*"], async (req, res) => {
        try {
            res.status(200).json(await authService.getUserAuthType(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.post(
    `/${moduleHandle}/send-forgot-password-token`,
    await RC.interceptRequest(moduleHandle, 'post', ["*"], async (req, res) => {
        try {
            res.status(200).json(await authService.sendForgotPasswordToken(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

router.post(
    `/${moduleHandle}/submit-forgot-password`,
    await RC.interceptRequest(moduleHandle, 'post', ["*"], async (req, res) => {
        try {
            res.status(200).json(await authService.submitForgotPassword(req));
        } catch (error) {
            Utils.handleError(error, res);
        }
    })
);

export default router;