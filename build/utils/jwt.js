"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToken = exports.refreshTokenOptions = exports.accessTokenOptions = void 0;
require("dotenv").config();
const redis_1 = require("./redis");
const ACCESS_TOKEN_EXPIRE = 5;
const REFRESH_TOKEN_EXPIRE = 3;
exports.accessTokenOptions = {
    expires: new Date(Date.now() + ACCESS_TOKEN_EXPIRE * 60 * 60 * 1000),
    maxAge: ACCESS_TOKEN_EXPIRE * 60 * 60 * 1000,
    // httpOnly: true,
    // sameSite: "none",
    // secure: true,
};
exports.refreshTokenOptions = {
    expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRE * 24 * 60 * 60 * 1000),
    maxAge: REFRESH_TOKEN_EXPIRE * 24 * 60 * 60 * 1000,
    // httpOnly: true,
    // sameSite: "none",
    // secure: true,
};
const sendToken = (user, statusCode, res) => {
    // _id của user sẽ được sign để trở thành Access Token và Refresh Token gửi về Frontend
    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();
    //   Upload session lên Redis mỗi khi user login
    res.cookie("access_token", accessToken, exports.accessTokenOptions);
    res.cookie("refresh_token", refreshToken, exports.refreshTokenOptions);
    redis_1.redis.set(user._id, JSON.stringify(user));
    res.status(statusCode).json({
        success: true,
        user,
        accessToken,
    });
};
exports.sendToken = sendToken;
