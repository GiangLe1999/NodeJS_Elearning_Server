import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { CatchAsyncErrors } from "./catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import { redis } from "../utils/redis";
import { updateAccessToken } from "../controllers/user.controller";
require("dotenv").config();

// Authenticated user
export const isAuthenticated = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token as string;

    // Nếu Cookie của request không có access_token, có nghĩa là user chưa login
    if (!access_token) {
      return next(
        new ErrorHandler("Please login to access this resource!", 400)
      );
    }

    // Kiểm tra access token trong cookie của request có thật sự
    // được sign bởi chính ACCESS_TOKEN signature hay không
    // decoded trả về là 1 object có trường id và value là _id của user
    const decoded = jwt.verify(
      access_token,
      process.env.ACCESS_TOKEN as string
    ) as JwtPayload;

    if (!decoded) {
      return next(new ErrorHandler("Access token is not valid!", 400));
    }

    if (decoded.exp && decoded.exp <= Date.now() / 1000) {
      try {
        updateAccessToken(req, res, next);
      } catch (error) {
        return next(error);
      }
    }

    // JSON object mà ta lưu trong Redis có key cũng chính là _id của user
    // Vì vậy ta có thể truyền id của decoded vào làm đối số để get về session của user lưu trong Redis
    const user = await redis.get(decoded.id);

    if (!user) {
      return next(
        new ErrorHandler("Please login to access this resource!", 400)
      );
    }

    req.user = JSON.parse(user);
    next();
  }
);

// Validate user role
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || "")) {
      return next(
        new ErrorHandler(
          `Role: ${req.user?.role} is not allowed to access this resource`,
          400
        )
      );
    }
    next();
  };
};
