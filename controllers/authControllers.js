import { validationResult } from 'express-validator';
import User from '../models/userModel.js';
import AsyncHandler from '../utils/AsyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { uploadFileonCloudinary } from '../utils/cloudinary.js';
import { encryptToken, decryptToken } from '../utils/encryptDecryptToken.js';
import { generateAccessAndRefreshToken } from '../utils/tokenGenerator.js';
import { sendOtpMail } from '../utils/mailGenerator.js';
import Otp from '../models/otpModel.js';
const createUser = AsyncHandler(async (req, res) => {
  const { username, email, password, avatar } = req.body;
  const result = validationResult(req.body);
  if (!result.isEmpty()) throw ApiError(402, "Invalid credentials");
  const isUser = await User.findOne({ email });
  if (isUser) throw new ApiError(402, "User Already Exists");
  // const avatarLocalPath = req.file?.path;
  // const avatar = await uploadFileonCloudinary(avatarLocalPath);
  // if (!avatar) throw new ApiError(400, "Avatar file is required");
  const user = await User.create({
    username,
    email,
    password,
    avatar
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -accessToken"
  );
  res.json(new ApiResponse(200, createdUser, "User Created Successfully"));
});

const signIn = AsyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  const result = validationResult(req.body);
  if (!result.isEmpty()) {
    res.status(400).json("Invalid credentials");
  }
  let isValidUser = null;
  if(!email && username) {
    isValidUser = await User.findOne({
      $or: [{ username }],
    });
  }
  if(!username && email) {
    isValidUser = await User.findOne({
       $or: [{ email }],
     });
  }
  if (!isValidUser) {
    throw new ApiError(402, "User Not Found");
  }
  const matchedPass = await isValidUser.isPasswordCorrect(password);
  if (!matchedPass) {
    res.status(400).json("User has enetered incorrect password");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    isValidUser._id
  );
  const encryptedAccessToken = encryptToken(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET
  );
  const encryptedRefreshToken = encryptToken(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  const loggedInUser = await User.findByIdAndUpdate(
    isValidUser._id,
    {
      $set: {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
      },
    },
    { new: true }
  ).select("-password -refreshToken -accessToken");
  const optionsAccess = {
    secure: true,
    sameSite: 'none',
    httpOnly: false,
    path: '/',
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
  };
  const optionsRefresh = {
    secure: true,
    sameSite: 'none',
    httpOnly: false,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, optionsAccess)
    .cookie("refreshToken", refreshToken, optionsRefresh)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged in Successfully"
      )
    );
});

const logout = AsyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
        accessToken: 1
      },
    },
    {
      new: true,
    }
  );
  const options = {
    secure: true,
    sameSite: 'None'
  };
  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out Successfully"));
});

const refreshAccessToken = AsyncHandler(async (req, res) => {
  const incomingToken = req?.cookies?.refreshToken || req?.body?.refreshToken;
  if (!incomingToken) throw new ApiError(402, "No Refresh Token Found");
  const decodedToken = jwt.verify(
    incomingToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(decodedToken._id);
  if (!user) throw new ApiError(402, "User Not Found");
  const decryptedToken = decryptToken(
    user.refreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  if (decryptedToken !== incomingToken) throw new ApiError(402, "Invalid Refresh Token");
  const options = {
    secure: true,
    sameSite: 'None'
  };
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken },
        "Access Token Refreshed Successfully"
      )
    );
});

const forgetPassword = AsyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = validationResult(req.body);
  if (!result.isEmpty()) throw ApiError(402, "Invalid credentials");
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(402, "User Not Found");
  const response = await sendOtpMail(email);
  if (!response) throw new ApiError(402, "Unable to send email");
  res
    .status(200)
    .json(new ApiResponse(200, {}, "OTP sent to your email"));
})
const verifyOtp = AsyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const result = validationResult(req.body);
  if (!result.isEmpty()) throw new ApiError(402, "Invalid credentials");
  const verifiedOtp = await Otp.findOne({ email });
  if (!verifiedOtp) throw new ApiError(402, "OTP Not Found");
  if (verifiedOtp.otp !== otp) throw new ApiError(402, "Invalid OTP");
  res
    .status(200)
    .json(new ApiResponse(200, {}, "OTP verified successfully"));
})

const resetPassword = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = validationResult(req.body);
  if (!result.isEmpty()) throw ApiError(402, "Invalid credentials");
  const user = await User.findOneAndUpdate({ email },{
    $set: {
      password,
    },
  });
  res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully"));
})

const changePassword = AsyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const result = validationResult(req.body);
  if (!result) throw new ApiError(400, "invalid password details");
  const validUser = await User.findById(req._id);
  if (!validUser) throw new ApiError(401, "Invalid User");
  const confirmPass = validUser.isPasswordCorrect(oldPassword);
  if (!confirmPass) throw new ApiError(401, "Incorrect Password");
  await User.findByIdAndUpdate(validUser._id, {
    $set: {
      password: newPassword,
    },
  });
  res
    .status(200)
    .json(new ApiResponse(200, "User Password Changed Successfully"));
});

export {
  createUser,
  signIn,
  logout,
  refreshAccessToken,
  forgetPassword,
  verifyOtp,
  resetPassword,
  changePassword
};