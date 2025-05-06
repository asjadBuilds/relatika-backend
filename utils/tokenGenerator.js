import User from "../models/userModel.js";
const generateAccessAndRefreshToken = async (userId) => {
    try {
      const user = await User.findById(userId);
  
      if (!user) throw ApiError(404, "User Not Found");
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });
      return { accessToken, refreshToken };
    } catch (error) {
      throw new ApiError(500, "Something went wrong");
    }
  };

  export {generateAccessAndRefreshToken};