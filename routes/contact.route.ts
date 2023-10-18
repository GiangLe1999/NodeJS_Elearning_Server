import express from "express";
import { addNewContact } from "../controllers/contact.controller";

export const contactRouter = express.Router();

contactRouter.post("/contact", addNewContact);
