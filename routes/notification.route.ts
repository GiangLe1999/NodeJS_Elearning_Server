import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import {
  getAllNotifications,
  updateNotification,
} from "../controllers/notification.controller";
import { updateAccessToken } from "../controllers/user.controller";

const notificationRouter = express.Router();

notificationRouter.get(
  "/get-all-notifications",
  updateAccessToken,
  isAuthenticated,
  authorizeRoles("admin"),
  getAllNotifications
);

notificationRouter.put(
  "/update-notification/:id",
  updateAccessToken,
  isAuthenticated,
  authorizeRoles("admin"),
  updateNotification
);

export default notificationRouter;
