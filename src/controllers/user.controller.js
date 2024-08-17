const User = require("../models/user.model.js");
const jwt = require("jsonwebtoken");
const uploadOnCloudinary = require("../utils/couldinary.js");
const mongoose = require("mongoose");

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    
    await user.save();

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Registering User
const registerUser = async (req, res) => {
  const { fullname, username, email, password } = req.body;

  // fullname : "   "
  if (!fullname.trim() || !username.trim() || !email.trim() || !password.trim()) {
    return res.status(400).json({
      message: "Some fields are empty",
    });
  }

  try {
    const existedUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existedUser) {
      return res.status(400).json({
        message: "Username or email already exists",
      });
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImgLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
      return res.status(400).json({
        message: "Avatar file is required",
      });
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    let coverImg;
    if (coverImgLocalPath) {
      coverImg = await uploadOnCloudinary(coverImgLocalPath);
    }

    if (!avatar) {
      return res.status(500).json({
        message: "Avatar not uploaded",
      });
    }

    const user = await User.create({
      fullname,
      avatar: avatar.url,
      coverImage: coverImg?.url || "",
      email,
      password,
      username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
      return res.status(500).json({
        message: "Server side error",
      });
    }

    return res.status(201).json({
      message: "OK",
      data: createdUser,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Server side error while saving data",
    });
  }
};

// Login functionality
const logInUser = async (req, res) => {
  const { username, password, email } = req.body;

  if (!email && !username) {
    return res.status(400).json({
      message: "Username or email is required",
    });
  }

  try {
    const user = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (!user) {
      return res.status(404).json({
        message: "User doesn't exist",
      });
    }

    const isPassValid = await user.isPasswordCorrect(password);

    if (!isPassValid) {
      return res.status(400).json({
        message: "Password incorrect",
      });
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshToken;

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        message: "OK",
        data: {
          user: userObj,
          accessToken,
          refreshToken,
        },
      });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Server side error",
    });
  }
};

// Logout functionality
const logOutUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: { refreshToken: undefined },
      },
      { new: true }
    );

    return res
      .status(200)
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .json({
        message: "Logged out successfully",
      });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Server side error",
    });
  }
};

const RefreshAccessToken = async (req, res) => {
  const Token = req.cookies.refreshToken || req.body.refreshToken;

  if (!Token) {
    return res.status(401).json({
      message: "Unauthorized request",
    });
  }

  try {
    const decodedToken = await jwt.verify(Token, process.env.refresh_token_secret);
    const user = await User.findById(decodedToken._id);

    if (!user) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    if (user.refreshToken !== Token) {
      return res.status(401).json({
        message: "Refresh token expired or invalid",
      });
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        accessToken,
        refreshToken,
        user,
      });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Server side error",
    });
  }
};

// Change current password
const changeCurrentPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!(await user.isPasswordCorrect(oldPassword))) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Something went wrong while changing password",
      error,
    });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  return res.status(200).json({
    user: req.user,
    message: "Current user fetched",
  });
};

// Update account details
const updateAccountDetails = async (req, res) => {
  const { fullname, email } = req.body;

  if (!fullname || !email) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: { fullname, email },
      },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      message: "Account details updated",
      user,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Server side error",
    });
  }
};

// Update user avatar
const updateUserAvatar = async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    return res.status(400).json({
      message: "Avatar file is missing",
    });
  }

  try {
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
      return res.status(500).json({
        message: "Error while uploading avatar",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { avatar: avatar.url } },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      message: "Avatar updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Server side error",
    });
  }
};

// Update user cover image
const updateUserCoverImg = async (req, res) => {
  const coverImgLocalPath = req.file?.path;

  if (!coverImgLocalPath) {
    return res.status(400).json({
      message: "Cover image file is missing",
    });
  }

  try {
    const coverImg = await uploadOnCloudinary(coverImgLocalPath);

    if (!coverImg.url) {
      return res.status(500).json({
        message: "Error while uploading cover image",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { coverImage: coverImg.url } },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      message: "Cover image updated successfully",
      user,
    });
    
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Server side error",
    });
  }
};

module.exports = {
  registerUser,
  logInUser,
  logOutUser,
  RefreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImg,
};
