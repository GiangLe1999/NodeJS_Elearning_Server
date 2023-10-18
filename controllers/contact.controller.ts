import { NextFunction, Request, Response } from "express";
import { CatchAsyncErrors } from "../middleware/catchAsyncErrors";
import contactModel, { IContact } from "../models/contact.model";
import ErrorHandler from "../utils/ErrorHandler";

// Get all notifications
export const addNewContact = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, problem, explain }: IContact = req.body;

      const newContact = await contactModel.create({ email, problem, explain });

      await newContact.save();

      res.status(200).json({ success: true, newContact });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
