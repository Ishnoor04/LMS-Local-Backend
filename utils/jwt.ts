require("dotenv").config();
import { IUser } from "../models/user.model";
import { Response } from "express";
import { redis } from "./redis";

interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}
const accessTokenExpire = parseInt(
  process.env.ACCESS_TOKEN_EXPIRE || "300",
  10
);
const refreshTokenExpire = parseInt(
  process.env.REFRESH_TOKEN_EXPIRE || "1200",
  10
);

//options for cookies
export const accessTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000),
  maxAge: accessTokenExpire * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};
export const refreshTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
  maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};
export const sendToken = async (
  user: IUser,
  statusCode: number,
  res: Response
) => {
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
  redis.set(user._id, JSON.stringify(user) as any);
  //parse environment variables to integrate with fallback values

  //only set secure to true in production
  if (process.env.NODE_ENV === "production") {
    accessTokenOptions.secure = true;
    refreshTokenOptions.secure = true;
  }
  //   console.log(accessToken);

  res.cookie("access_token", accessToken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);
  //   console.log(user)
  //   console.log(accessToken)
  //   console.log(refreshToken)

  res.status(statusCode).json({
    success: true,
    user,
    accessToken: accessToken,
  });
};
