import express from "express";

import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { getCourseAnalytics, getNotificationAnalytics, getOrderAnalytics, getUserAnalytics } from "../controllers/analytics.controller";
import { updateAccessToken } from "../controllers/user.controller";
const analyticRouter = express.Router();

analyticRouter.get("/get-users-analytics", isAuthenticated, authorizeRoles("admin"), getUserAnalytics);
analyticRouter.get("/get-courses-analytics", isAuthenticated, authorizeRoles("admin"), getCourseAnalytics);
analyticRouter.get("/get-notifications-analytics", isAuthenticated, authorizeRoles("admin"), getNotificationAnalytics);
analyticRouter.get("/get-orders-analytics", isAuthenticated, authorizeRoles("admin"), getOrderAnalytics);
export default analyticRouter;
