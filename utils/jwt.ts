require("dotenv").config();

import { Response } from "express";
import { IUser } from "../models/user.model";
import { redis } from "./redis";

interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly?: boolean;
  sameSite?: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
  domain?: string;
}

const ACCESS_TOKEN_EXPIRE = 5;
const REFRESH_TOKEN_EXPIRE = 3;

export const accessTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + ACCESS_TOKEN_EXPIRE * 60 * 60 * 1000),
  maxAge: ACCESS_TOKEN_EXPIRE * 60 * 60 * 1000,
  // httpOnly: true,
  // sameSite: "none",
  // secure: true,
};

export const refreshTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRE * 24 * 60 * 60 * 1000),
  maxAge: REFRESH_TOKEN_EXPIRE * 24 * 60 * 60 * 1000,
  // httpOnly: true,
  // sameSite: "none",
  // secure: true,
};

export const sendToken = (user: IUser, statusCode: number, res: Response) => {
  // _id của user sẽ được sign để trở thành Access Token và Refresh Token gửi về Frontend
  const accessToken = user.SignAccessToken();
  const refreshToken = user.SignRefreshToken();

  //   Upload session lên Redis mỗi khi user login

  res.cookie("access_token", accessToken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);

  redis.set(user._id, JSON.stringify(user) as any);

  res.status(statusCode).json({
    success: true,
    user,
    accessToken,
  });
};
