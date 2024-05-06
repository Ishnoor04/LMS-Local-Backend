"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToken = exports.refreshTokenOptions = exports.accessTokenOptions = void 0;
require("dotenv").config();
const redis_1 = require("./redis");
const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || "300", 10);
const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || "1200", 10);
//options for cookies
exports.accessTokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000),
    maxAge: accessTokenExpire * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "lax",
};
exports.refreshTokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
    maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "lax",
};
const sendToken = async (user, statusCode, res) => {
    let accessToken, refreshToken;
    const accessTokenPromise = user.SignAccessToken();
    const refreshTokenPromise = user.SignRefreshToken();
    const AT = Promise.resolve(accessTokenPromise);
    await AT.then((token) => {
        accessToken = token;
    });
    const RT = Promise.resolve(refreshTokenPromise);
    await RT.then((token) => {
        refreshToken = token;
    });
    //   console.log(AT);
    //upload session to redis
    redis_1.redis.set(user._id, JSON.stringify(user));
    //parse environment variables to integrate with fallback values
    //only set secure to true in production
    if (process.env.NODE_ENV === "production") {
        exports.accessTokenOptions.secure = true;
        exports.refreshTokenOptions.secure = true;
    }
    //   console.log(accessToken);
    res.cookie("access_token", accessToken, exports.accessTokenOptions);
    res.cookie("refresh_token", refreshToken, exports.refreshTokenOptions);
    //   console.log(user)
    //   console.log(accessToken)
    //   console.log(refreshToken)
    res.status(statusCode).json({
        success: true,
        user,
        accessToken: accessToken,
    });
};
exports.sendToken = sendToken;
