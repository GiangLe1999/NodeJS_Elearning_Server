import cloudinary from "cloudinary";
import { NextFunction, Request, Response } from "express";
import { CatchAsyncErrors } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import LayoutModel from "../models/layout.model";

// Create Layout
export const createLayout = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.body;

      const isTypeExist = await LayoutModel.findOne({ type });
      if (isTypeExist) {
        return next(new ErrorHandler(`${type} alreay exist`, 400));
      }

      if (type === "Banner") {
        const { image, title, subTitle } = req.body;

        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: "layout",
        });

        const banner = {
          image: { public_id: myCloud.public_id, url: myCloud.secure_url },
          title,
          subTitle,
        };

        await LayoutModel.create({ type: "Banner", banner });
      }

      if (type === "FAQ") {
        const { faq } = req.body;
        const faqItems = faq.map((item: any) => ({
          question: item.question,
          answer: item.answer,
        }));
        await LayoutModel.create({ type: "FAQ", faq: faqItems });
      }

      if (type === "Categories") {
        const { categories } = req.body;
        const categoryItems = categories.map((category: any) => ({
          title: category.title,
        }));
        await LayoutModel.create({
          type: "Categories",
          categories: categoryItems,
        });
      }

      res
        .status(200)
        .json({ success: true, message: "Layout created successfully" });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Edit Layout
export const editLayout = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.body;

      if (type === "Banner") {
        const bannerData = await LayoutModel.findOne({ type: "Banner" });
        const { image, title, subTitle } = req.body;

        const data: any = image.startsWith("https")
          ? bannerData
          : await cloudinary.v2.uploader.upload(image, {
              folder: "layout",
            });

        const banner = {
          type: "Banner",
          image: {
            public_id: image.startsWith("https")
              ? bannerData?.banner.image.public_id
              : data?.public_id,
            url: image.startsWith("https")
              ? bannerData?.banner.image.url
              : data?.secure_url,
          },
          title,
          subTitle,
        };

        await LayoutModel.findOneAndUpdate({ type: "Banner" }, { banner });
      }

      if (type === "FAQ") {
        const { faq } = req.body;
        const existFaq = await LayoutModel.findOne({ type: "FAQ" });
        const faqItems = faq.map((item: any) => ({
          question: item.question,
          answer: item.answer,
        }));
        await LayoutModel.findByIdAndUpdate(existFaq?._id, {
          type: "FAQ",
          faq: faqItems,
        });
      }

      if (type === "Categories") {
        const { categories } = req.body;
        const existCategories = await LayoutModel.findOne({
          type: "Categories",
        });
        const categoryItems = categories.map((category: any) => ({
          title: category.title,
        }));
        await LayoutModel.findByIdAndUpdate(existCategories?._id, {
          type: "Categories",
          categories: categoryItems,
        });
      }

      res
        .status(200)
        .json({ success: true, message: "Layout updated successfully" });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Get Layout by Type
export const getLayoutByType = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const layout = await LayoutModel.findOne({ type: req.params.type });

      res.status(200).json({ success: true, layout });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
