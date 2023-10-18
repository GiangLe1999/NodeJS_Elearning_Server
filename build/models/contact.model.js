"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
const contactSchema = new mongoose_2.Schema({
    email: String,
    problem: String,
    explain: String,
}, { timestamps: true });
const contactModel = mongoose_1.default.model("Contact", contactSchema);
exports.default = contactModel;
