"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newOrder = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const order_model_1 = __importDefault(require("../models/order.model"));
// Create new order
exports.newOrder = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (data, res, next) => {
    const order = await order_model_1.default.create(data);
    order.save();
    res.status(201).json({ success: true, order });
});
