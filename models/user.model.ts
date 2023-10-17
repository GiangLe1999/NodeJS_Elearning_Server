import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
require("dotenv").config();
import jwt from "jsonwebtoken";

const emailRegexPattern: RegExp =
  /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;

interface ICourse {
  courseId: string;
  createdDate: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: string;
  isVerified: boolean;
  courses: ICourse[];
  comparePassword: (password: string) => Promise<boolean>;
  SignAccessToken: () => string;
  SignRefreshToken: () => string;
}

const userSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: [true, "Please enter your name"] },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      validate: {
        validator: function (value: string) {
          return emailRegexPattern.test(value);
        },
        message: "Please enter a valid email",
      },
      unique: true,
    },
    password: {
      type: String,
      minLength: [6, "Password must be at least 6 characters"],
      // Mặc định password sẽ ko được trả về trong kết quả của Queries
      select: false,
    },
    avatar: {
      public_id: String,
      url: String,
    },
    role: {
      type: String,
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    courses: [{ courseId: String, createdDate: Date }],
  },
  { timestamps: true }
);

// Hash password trước khi lưu vào Database
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Sign Access Token
userSchema.methods.SignAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN as string, {
    expiresIn: "5m",
  });
};

// Sign Refresh Token
userSchema.methods.SignRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN as string, {
    expiresIn: "3d",
  });
};

// Compare password
userSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const userModel: Model<IUser> = mongoose.model("User", userSchema);

export default userModel;
