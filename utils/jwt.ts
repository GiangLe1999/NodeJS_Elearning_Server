require("dotenv").config();

import { Response } from "express";
import { IUser } from "../models/user.model";
import { redis } from "./redis";

interface ITokenOptions {
  exprires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}

const ACCESS_TOKEN_EXPIRE = 5;
const REFRESH_TOKEN_EXPIRE = 3;

export const accessTokenOptions: ITokenOptions = {
  exprires: new Date(Date.now() + ACCESS_TOKEN_EXPIRE * 60 * 60 * 1000),
  maxAge: ACCESS_TOKEN_EXPIRE * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};

export const refreshTokenOptions: ITokenOptions = {
  exprires: new Date(Date.now() + REFRESH_TOKEN_EXPIRE * 24 * 60 * 60 * 1000),
  maxAge: REFRESH_TOKEN_EXPIRE * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};

export const sendToken = (user: IUser, statusCode: number, res: Response) => {
  // _id của user sẽ được sign để trở thành Access Token và Refresh Token gửi về Frontend
  const accessToken = user.SignAccessToken();
  const refreshToken = user.SignRefreshToken();

  //   Upload session lên Redis mỗi khi user login
  redis.set(user._id, JSON.stringify(user) as any);

  //   Chỉ set secure bằng true khi ở Production
  if (process.env.NODE_ENV === "production") {
    accessTokenOptions.secure = true;
    refreshTokenOptions.secure = true;
  }

  //   Set cookie cho response
  res.cookie("access_token", accessToken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);

  res.status(statusCode).json({
    success: true,
    user,
    accessToken,
  });
};
