"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCourse = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const course_model_1 = __importDefault(require("../models/course.model"));
const layout_model_1 = __importDefault(require("../models/layout.model"));
// Create course
exports.createCourse = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (data, res) => {
    const course = await course_model_1.default.create(data);
    const categories = await layout_model_1.default.findOne({ type: "Categories" });
    const category = categories?.categories.find((category) => category.title === data.category);
    if (category) {
        category?.courses?.push(course._id);
        await categories?.save();
    }
    res.status(201).json({ success: true, course, category: category });
});
