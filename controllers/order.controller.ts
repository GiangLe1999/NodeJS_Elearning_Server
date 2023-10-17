import { NextFunction, Request, Response } from "express";
import { CatchAsyncErrors } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import OrderModel, { IOrder } from "../models/order.model";
import userModel from "../models/user.model";
import CourseModel from "../models/course.model";
import { newOrder } from "../services/order.service";
import { sendMail } from "../utils/sendMail";
import NotificationModel from "../models/notification.model";
import { redis } from "../utils/redis";

require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Create order
export const createOrder = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, payment_info } = req.body as IOrder;

      if (payment_info) {
        if ("id" in payment_info) {
          const paymentIntentId = payment_info.id;
          const paymentIntent = await stripe.paymentIntents.retrieve(
            paymentIntentId
          );

          if (paymentIntent.status !== "succeeded") {
            next(new ErrorHandler("Payment not authorized", 400));
          }
        }
      }

      const user = await userModel.findById(req.user?._id);

      const courseExistInUser = user?.courses.find(
        (course: any) => course.courseId === courseId
      );

      // Course đã mua rồi thì không thể mua lại nữa
      if (courseExistInUser) {
        return next(
          new ErrorHandler("You have already purchased this course", 400)
        );
      }

      const course = await CourseModel.findById(courseId);

      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }

      const data: any = {
        courseId: course._id,
        userId: user?._id,
        payment_info,
      };

      const mailData = {
        order: {
          _id: course._id.toString().slice(0, 6),
          name: course.name,
          price: course.price,
          date: new Date().toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
      };

      try {
        if (user) {
          await sendMail({
            email: user.email,
            subject: "Order Confirmation",
            template: "order-confirmation.ejs",
            data: mailData,
          });
        }
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }

      user?.courses.push({ courseId, createdDate: new Date(Date.now()) });

      await redis.set(req.user?.id, JSON.stringify(user));

      await user?.save();

      const notification = await NotificationModel.create({
        user: user?._id,
        title: "New Order",
        message: `You have a new order from ${course.name}`,
      });

      if (course.purchased || course.purchased === 0) {
        course.purchased += 1;
      }

      await course.save();

      newOrder(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Get all courses
export const getAllOrders = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orders = await OrderModel.find().sort({ createdAt: -1 });

      res.status(200).json({ success: true, orders });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Send Stripe publishable key
export const sendStripePublishableKey = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    res
      .status(200)
      .json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
  }
);

// New Payment
export const newPayment = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const myPayment = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "USD",
        metadata: {
          company: "E-Learning",
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res
        .status(201)
        .json({ success: true, client_secret: myPayment.client_secret });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
