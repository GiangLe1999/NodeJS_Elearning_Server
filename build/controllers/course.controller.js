"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCourseByQuery = exports.getCourseReviews = exports.generateVideoUrl = exports.deleteCourse = exports.getUserCourses = exports.getAllCoursesAdmin = exports.addReplyToReview = exports.addReview = exports.addAnswer = exports.addQuestion = exports.getCourseByAdmin = exports.getCourseByUser = exports.getCoursesByCategory = exports.getAllCourses = exports.getSingleCourse = exports.editCourse = exports.uploadCourse = void 0;
const cloudinary_1 = __importDefault(require("cloudinary"));
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const course_service_1 = require("../services/course.service");
const course_model_1 = __importDefault(require("../models/course.model"));
const redis_1 = require("../utils/redis");
const mongoose_1 = __importDefault(require("mongoose"));
const sendMail_1 = require("../utils/sendMail");
const notification_model_1 = __importDefault(require("../models/notification.model"));
const axios_1 = __importDefault(require("axios"));
const layout_model_1 = __importDefault(require("../models/layout.model"));
// Upload course
exports.uploadCourse = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const { data } = req.body;
        const thumbnail = data.thumbnail;
        if (thumbnail) {
            const myCloud = await cloudinary_1.default.v2.uploader.upload(thumbnail, {
                folder: "courses",
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        (0, course_service_1.createCourse)(data, res, next);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// Edit Course
exports.editCourse = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        const courseId = req.params.id;
        let existCourse = await course_model_1.default.findById(courseId);
        if (!existCourse) {
            res.status(404).json({ success: false, message: "Course not found" });
        }
        const categories = await layout_model_1.default.findOne({ type: "Categories" });
        const oldCategory = categories?.categories.find((category) => category.title === existCourse.category);
        if (oldCategory) {
            const courseIndex = oldCategory?.courses?.findIndex((course) => course.toString() === existCourse._id.toString());
            oldCategory.courses?.splice(courseIndex, 1);
        }
        if (thumbnail && !thumbnail.startsWith("https")) {
            await cloudinary_1.default.v2.uploader.destroy(existCourse.thumbnail.public_id);
            const myCloud = await cloudinary_1.default.v2.uploader.upload(thumbnail, {
                folder: "courses",
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        if (existCourse && thumbnail.startsWith("https")) {
            data.thumbnail = {
                public_id: existCourse?.thumbnail.public_id,
                url: existCourse?.thumbnail.url,
            };
        }
        const updatedCourse = await course_model_1.default.findByIdAndUpdate(courseId, {
            $set: data,
        }, { new: true });
        const newCategory = categories?.categories.find((category) => category.title === data.category);
        newCategory?.courses.push(updatedCourse?._id);
        await categories?.save();
        res.status(201).json({ success: true, course: updatedCourse });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// Get Single Course - Without purchasing
exports.getSingleCourse = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const courseId = req.params.id;
        const course = await course_model_1.default.findById(courseId)
            .select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links")
            .populate("reviews.user");
        if (!course) {
            res.status(404).json({ success: false, message: "Course not found" });
        }
        res.status(200).json({ success: true, course });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// Get All Courses - Without purchasing
exports.getAllCourses = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const courses = await course_model_1.default.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
        res.status(200).json({ success: true, courses });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// Get Courses By Category
exports.getCoursesByCategory = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const { categorySlug } = req.params;
        const categoryLowerCase = categorySlug.replace(/-/g, " ");
        const arr = categoryLowerCase.split(" ");
        for (var i = 0; i < arr.length; i++) {
            arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
        }
        const category = arr.join(" ");
        const courses = await course_model_1.default.find({ category }).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
        res.status(200).json({ success: true, courses, category });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// Get course content - only for valid user
exports.getCourseByUser = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;
        const courseExists = userCourseList?.find((course) => course.courseId === courseId);
        if (!courseExists) {
            return next(new ErrorHandler_1.default("You are not eligible to access this course", 403));
        }
        const course = await course_model_1.default.findById(courseId).populate("courseData.questions.user courseData.questions.questionReplies.user");
        const content = course?.courseData;
        res.status(200).json({ success: true, content });
    }
    catch (error) {
        return new ErrorHandler_1.default(error.message, 500);
    }
});
// Get course for admin page
exports.getCourseByAdmin = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const courseId = req.params.id;
        const course = await course_model_1.default.findById(courseId);
        res.status(200).json(course);
    }
    catch (error) {
        return new ErrorHandler_1.default(error.message, 500);
    }
});
exports.addQuestion = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const { title, question, courseId, contentId } = req.body;
        const course = await course_model_1.default.findById(courseId);
        if (!mongoose_1.default.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler_1.default("Invalid content id", 400));
        }
        const courseContent = course?.courseData?.find((item) => item._id.equals(contentId));
        if (!courseContent) {
            return next(new ErrorHandler_1.default("Invalid content id", 400));
        }
        // Create new question object
        const newQuestion = {
            user: req.user?._id,
            title,
            question,
            questionReplies: [],
        };
        // Add question to course content
        courseContent.questions.push(newQuestion);
        // Create notification
        const notification = await notification_model_1.default.create({
            user: req.user?._id,
            title: "New Question Received",
            message: `You have a new question in ${courseContent.title}`,
        });
        // Save updated course
        await course?.save();
        res.status(200).json({ success: true, course });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.addAnswer = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const { answer, courseId, contentId, questionId } = req.body;
        const course = await course_model_1.default.findById(courseId).populate("courseData.questions.user");
        if (!mongoose_1.default.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler_1.default("Invalid content id", 400));
        }
        const courseContent = course?.courseData?.find((item) => item._id.equals(contentId));
        if (!courseContent) {
            return next(new ErrorHandler_1.default("Invalid content id", 400));
        }
        const question = courseContent.questions.find((item) => item._id.equals(questionId));
        if (!question) {
            return next(new ErrorHandler_1.default("Invalid content id", 400));
        }
        // Create new answer object
        const newAnswer = { user: req.user?._id, answer };
        // Add answer to course content
        question.questionReplies.push(newAnswer);
        await course?.save();
        // Gửi notification về Admin dashboard khi có answer mới
        if (req.user?._id === question.user._id) {
            await notification_model_1.default.create({
                user: req.user?._id,
                title: "New Question Reply Received",
                message: `You have a new question reply in ${courseContent.title}`,
            });
        }
        else {
            // Gửi email thông báo về cho người đặt question khi question có answer mới
            const data = { name: question.user.name, title: courseContent.title };
            try {
                await (0, sendMail_1.sendMail)({
                    email: question.user.email,
                    subject: "Question Reply",
                    template: "question-reply.ejs",
                    data,
                });
            }
            catch (error) {
                return next(new ErrorHandler_1.default(error.message, 500));
            }
        }
        res.status(200).json({ success: true, course });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// Add review in course
exports.addReview = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;
        // Check if courseId already exists in userCourseList
        const courseExists = userCourseList?.find((course) => course.courseId === courseId.toString());
        if (!courseExists) {
            return next(new ErrorHandler_1.default("You are not eligible to access this course", 400));
        }
        const course = await course_model_1.default.findById(courseId);
        if (course) {
            const { review, rating } = req.body;
            const reviewData = {
                user: req.user?._id,
                comment: review,
                rating,
            };
            course.reviews.push(reviewData);
            // Cập ratings của course sau khi vừa thêm 1 review mới
            const totalRatings = course?.reviews.reduce((acc, cur) => acc + cur.rating, 0) || 0;
            const avgRatings = totalRatings / (course?.reviews.length || 0);
            course.ratings = Number(avgRatings.toFixed(2));
            await course.save();
            const updatedCourse = await course_model_1.default.findById(courseId).populate("reviews.user");
            // Push notification về Admin
            const notification = {
                title: "New Review received",
                message: `${req.user?.name} has given a review in ${course?.name}`,
            };
            res.status(200).json({
                success: true,
                reviews: updatedCourse?.reviews,
                ratings: updatedCourse?.ratings,
            });
        }
        else {
            return next(new ErrorHandler_1.default("Found no course", 404));
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// Add review reply - only Admin
exports.addReplyToReview = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const { answer, courseId, reviewId } = req.body;
        const course = await course_model_1.default.findById(courseId);
        if (!course) {
            return next(new ErrorHandler_1.default("Found no course", 404));
        }
        const review = course.reviews.find((review) => review._id.toString() === reviewId);
        if (!review) {
            return next(new ErrorHandler_1.default("Review no course", 404));
        }
        const replyData = {
            user: req.user?._id,
            answer,
        };
        review.commentReplies.push(replyData);
        await course?.save();
        const updatedCourse = await course_model_1.default.findById(courseId).populate("reviews.user reviews.commentReplies.user");
        res.status(200).json({ success: true, reviews: updatedCourse?.reviews });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// Get all courses
exports.getAllCoursesAdmin = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const courses = await course_model_1.default.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, courses });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// Get user's courses
exports.getUserCourses = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const { courseIds } = req.body;
        const courses = await course_model_1.default.find({ _id: { $in: courseIds } })
            .sort({
            createdAt: -1,
        })
            .select("_id name purchased price estimatedPrice courseData thumbnail");
        res.status(200).json({ success: true, courses });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// Delete course
exports.deleteCourse = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const { id } = req.params;
        const course = await course_model_1.default.findById(id);
        if (!course) {
            return next(new ErrorHandler_1.default("Course not found", 400));
        }
        await course_model_1.default.deleteOne({ _id: id });
        await redis_1.redis.del(id);
        const categories = await layout_model_1.default.findOne({ type: "Categories" });
        const oldCategory = categories?.categories.find((category) => category.title === course.category);
        if (oldCategory) {
            const courseIndex = oldCategory?.courses?.findIndex((course) => course.toString() === course._id.toString());
            oldCategory.courses?.splice(courseIndex, 1);
        }
        await categories?.save();
        res
            .status(200)
            .json({ success: true, message: "Course deleted successfully" });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// Generate Video URL
exports.generateVideoUrl = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const { videoId } = req.body;
        const response = await axios_1.default.post(`https://dev.vdocipher.com/api/videos/${videoId}/otp`, 
        // ttl là Time to live: Thời gian cache
        { ttl: 300 }, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Apisecret ${process.env.VDOCIPHER_API_SECRET}`,
            },
        });
        res.json(response.data);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// Generate Course Reviews
exports.getCourseReviews = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const course = await course_model_1.default.findById(courseId)
            .select("reviews ratings")
            .populate("reviews.user reviews.commentReplies.user");
        if (!course) {
            return next(new ErrorHandler_1.default("Course not found", 400));
        }
        res.status(200).json({ success: true, course });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// Get Course By Query
exports.getCourseByQuery = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const { query } = req.params;
        const courses = await course_model_1.default.find({
            name: { $regex: query, $options: "i" },
        }).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
        res.status(200).json({ success: true, courses });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
