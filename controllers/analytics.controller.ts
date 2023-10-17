import { NextFunction, Request, Response } from "express";
import { CatchAsyncErrors } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import { generateLast12MonthsData } from "../utils/analytics.generator";
import userModel, { IUser } from "../models/user.model";
import CourseModel, { ICourse } from "../models/course.model";
import OrderModel, { IOrder } from "../models/order.model";

// Get users analytics
export const getUserAnalytics = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await generateLast12MonthsData<IUser>(userModel);

      res.status(200).json({ success: true, users: users.last12Months });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Get course analytics
export const getCourseAnalytics = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courses = await generateLast12MonthsData<ICourse>(CourseModel);

      res.status(200).json({ success: true, courses: courses.last12Months });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Get order analytics
export const getOrderAnalytics = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orders = await generateLast12MonthsData<IOrder>(OrderModel);

      res.status(200).json({ success: true, orders: orders.last12Months });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
