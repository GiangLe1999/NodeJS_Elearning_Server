import { Response } from "express";
import { CatchAsyncErrors } from "../middleware/catchAsyncErrors";
import CourseModel from "../models/course.model";
import LayoutModel from "../models/layout.model";

// Create course
export const createCourse = CatchAsyncErrors(
  async (data: any, res: Response) => {
    const course = await CourseModel.create(data);

    const categories = await LayoutModel.findOne({ type: "Categories" });

    const category = categories?.categories.find(
      (category) => category.title === data.category
    );

    if (category) {
      category?.courses?.push(course._id);
      await categories?.save();
    }

    res.status(201).json({ success: true, course, category: category });
  }
);
