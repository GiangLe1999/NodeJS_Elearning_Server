"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const faqSchema = new mongoose_1.Schema({
    question: {
        type: String,
    },
    answer: {
        type: String,
    },
});
const categorySchema = new mongoose_1.Schema({
    title: { type: String },
    courses: { type: [mongoose_1.Schema.Types.ObjectId] },
});
const bannerImageSchema = new mongoose_1.Schema({
    public_id: { type: String },
    url: { type: String },
});
const layoutSchema = new mongoose_1.Schema({
    type: { type: String },
    faq: [faqSchema],
    categories: [categorySchema],
    banner: {
        image: bannerImageSchema,
        title: { type: String },
        subTitle: { type: String },
    },
});
const LayoutModel = (0, mongoose_1.model)("Layout", layoutSchema);
exports.default = LayoutModel;
