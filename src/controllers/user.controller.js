import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { upload } from "../middlewares/multer.middleware.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findOne(userId);
    const accessToken = user.generateAccessToken();
    const refereshToken = user.generateRefereshToken();

    user.refereshToken = refereshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refereshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating ACCESS and REFRESH TOKEN"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  //validation like is empty or not
  //check if user is already exist username, email
  //check for images,check for avatar
  //upload them to cloudinary
  //create user object create entry in db
  //remove password and refresh token field from response
  //check for user creation
  //return res
  const { email, userName, fullName, password } = req.body;
  //naive approach to check one by one
  //  if(fullName===""){
  //     throw new ApiError(400,"fullName is required")
  //  }
  if (
    [fullName, email, userName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "all fields are necessary");
  }
  //field?.trim trim works only if field is not null

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "user with userName or email already exist");
  }

  // console.log(req.files)
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path || null;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : { url: "" };

  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar to cloudinary");
  }
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage.url || "",
    email,
    password,
    userName: userName.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registring user");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //req body data
  //username or email
  //find the user
  //password check
  //access and refresh token
  //send cookie

  const { email, userName, password } = req.body;
  if (!email || !userName) {
    throw new ApiError(400, "email or userName is required");
  }

  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }
  const isPasswordValid = user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User credentials");
  }

  const { accessToken, refereshToken } = generateAccessAndRefereshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refereshToken", refereshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refereshToken,
        },
        "user loggedIn successfully"
      )
    );
});

//we will get req using jwt token in user controller in verifyjWT middleware
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refereshToken: undefined },
    },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refereshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export { registerUser, loginUser, logoutUser };
