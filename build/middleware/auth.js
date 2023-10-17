"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.isAuthenticated = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const catchAsyncErrors_1 = require("./catchAsyncErrors");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const redis_1 = require("../utils/redis");
const user_controller_1 = require("../controllers/user.controller");
require("dotenv").config();
// Authenticated user
exports.isAuthenticated = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    const access_token = req.cookies.access_token;
    // Nếu Cookie của request không có access_token, có nghĩa là user chưa login
    if (!access_token) {
        return next(new ErrorHandler_1.default("Please login to access this resource!", 400));
    }
    // Kiểm tra access token trong cookie của request có thật sự
    // được sign bởi chính ACCESS_TOKEN signature hay không
    // decoded trả về là 1 object có trường id và value là _id của user
    const decoded = jsonwebtoken_1.default.verify(access_token, process.env.ACCESS_TOKEN);
    if (!decoded) {
        return next(new ErrorHandler_1.default("Access token is not valid!", 400));
    }
    if (decoded.exp && decoded.exp <= Date.now() / 1000) {
        try {
            (0, user_controller_1.updateAccessToken)(req, res, next);
        }
        catch (error) {
            return next(error);
        }
    }
    // JSON object mà ta lưu trong Redis có key cũng chính là _id của user
    // Vì vậy ta có thể truyền id của decoded vào làm đối số để get về session của user lưu trong Redis
    const user = await redis_1.redis.get(decoded.id);
    if (!user) {
        return next(new ErrorHandler_1.default("Please login to access this resource!", 400));
    }
    req.user = JSON.parse(user);
    next();
});
// Validate user role
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user?.role || "")) {
            return next(new ErrorHandler_1.default(`Role: ${req.user?.role} is not allowed to access this resource`, 400));
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
