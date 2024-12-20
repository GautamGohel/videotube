import { asyncHandler } from "./utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { ApiError } from "./utils/error.js";
import User from "../models/user.model.js";
export const verifyJWT = asyncHandler(async (req, res, next) => {
try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    //req.header in case cookie token is giving through header
  
    if (!token) {
      throw new Error(401, "Unauthorised request");
    }
  
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    req.user = user;
    next();
} catch (error) {
    throw new ApiError(401, "Invalid Access Token");
}
});
