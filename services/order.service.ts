import { NextFunction, Response } from "express";
import { CatchAsyncErrors } from "../middleware/catchAsyncErrors";
import OrderModel from "../models/order.model";

// Create new order
export const newOrder = CatchAsyncErrors(
  async (data: any, res: Response, next: NextFunction) => {
    const order = await OrderModel.create(data);
    order.save();
    res.status(201).json({ success: true, order });
  }
);
