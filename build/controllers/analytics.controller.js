"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderAnalytics = exports.getCourseAnalytics = exports.getUserAnalytics = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const analytics_generator_1 = require("../utils/analytics.generator");
const user_model_1 = __importDefault(require("../models/user.model"));
const course_model_1 = __importDefault(require("../models/course.model"));
const order_model_1 = __importDefault(require("../models/order.model"));
// Get users analytics
exports.getUserAnalytics = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const users = await (0, analytics_generator_1.generateLast12MonthsData)(user_model_1.default);
        res.status(200).json({ success: true, users: users.last12Months });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// Get course analytics
exports.getCourseAnalytics = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const courses = await (0, analytics_generator_1.generateLast12MonthsData)(course_model_1.default);
        res.status(200).json({ success: true, courses: courses.last12Months });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// Get order analytics
exports.getOrderAnalytics = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const orders = await (0, analytics_generator_1.generateLast12MonthsData)(order_model_1.default);
        res.status(200).json({ success: true, orders: orders.last12Months });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
