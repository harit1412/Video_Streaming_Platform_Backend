const { Router } = require("express");
const asyncHandler = require("../utils/asyncHandlers.js")

const {
  registerUser,
  logInUser,
  logOutUser,
  RefreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImg,
} = require("../controllers/user.controller.js");

const upload = require("../middlewares/multer.middleware.js");
const UserRouter = Router();
const verifyJWT = require("../middlewares/auth.middleware.js");
const User = require("../models/user.model.js");

UserRouter.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

UserRouter.route("/login").post(asyncHandler(logInUser));

UserRouter.route("/logout").post(asyncHandler(verifyJWT), asyncHandler(logOutUser));

UserRouter.route("/refresh-token").post(asyncHandler(RefreshAccessToken));

UserRouter.route("/change-password").post(asyncHandler(verifyJWT), asyncHandler(changeCurrentPassword));

UserRouter.route("/current-user").get(asyncHandler(verifyJWT), asyncHandler(getCurrentUser));

UserRouter.route("/update-account").patch(asyncHandler(verifyJWT), asyncHandler(updateAccountDetails));

UserRouter.route("/avatar").patch(
  asyncHandler(verifyJWT),
  upload.single("avatar"),
  asyncHandler(updateUserAvatar)
);

UserRouter.route("/cover-image").patch(
  asyncHandler(verifyJWT),
  upload.single("coverImage"),
  asyncHandler(updateUserCoverImg)
);

// UserRouter.route("/c/:username").get(verifyJWT, getUserChannelProfile);

// UserRouter.route("/history").get(verifyJWT, getWatchHistory);

module.exports = UserRouter;
