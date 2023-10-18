"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addNewContact = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const contact_model_1 = __importDefault(require("../models/contact.model"));
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
// Get all notifications
exports.addNewContact = (0, catchAsyncErrors_1.CatchAsyncErrors)(async (req, res, next) => {
    try {
        const { email, problem, explain } = req.body;
        const newContact = await contact_model_1.default.create({ email, problem, explain });
        await newContact.save();
        res.status(200).json({ success: true, newContact });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
