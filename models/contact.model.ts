import mongoose from "mongoose";
import { Model, Schema } from "mongoose";

export interface IContact {
  email: string;
  problem: string;
  explain: string;
}

const contactSchema: Schema<IContact> = new Schema(
  {
    email: String,
    problem: String,
    explain: String,
  },
  { timestamps: true }
);

const contactModel: Model<IContact> = mongoose.model("Contact", contactSchema);

export default contactModel;
