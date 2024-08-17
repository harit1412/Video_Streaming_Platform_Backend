const { Router } = require("express");

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

UserRouter.route("/login").post(logInUser);

UserRouter.route("/logout").post(verifyJWT, logOutUser);

UserRouter.route("/refresh-token").post(RefreshAccessToken);

UserRouter.route("/change-password").post(verifyJWT, changeCurrentPassword);

UserRouter.route("/current-user").get(verifyJWT, getCurrentUser);

UserRouter.route("/update-account").patch(verifyJWT, updateAccountDetails);

UserRouter.route("/avatar").patch(
  verifyJWT,
  upload.single("avatar"),
  updateUserAvatar
);

UserRouter.route("/cover-image").patch(
  verifyJWT,
  upload.single("coverImage"),
  updateUserCoverImg
);

// UserRouter.route("/c/:username").get(verifyJWT, getUserChannelProfile);

// UserRouter.route("/history").get(verifyJWT, getWatchHistory);

module.exports = UserRouter;
