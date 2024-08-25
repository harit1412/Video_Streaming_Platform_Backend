const { Router } = require("express");
const asyncHandler = require("../utils/asyncHandlers.js")

const verifyJWT = require("../middlewares/auth.middleware");
const upload = require("../middlewares/multer.middleware");
const {
  getAllVideos,
  publishVideo,
  getVideoById,
  deleteVideoById,
  updateThumbnail
} = require("../controllers/video.controller.js");
const VideoRouter = Router();

// All routeres required this auth
VideoRouter.use(verifyJWT);

VideoRouter.route("/").post(
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishVideo
);

VideoRouter.route("/").get(asyncHandler(getAllVideos))


VideoRouter.route("/:videoId").get(asyncHandler(getVideoById))
VideoRouter.route("/:videoId").delete(asyncHandler(deleteVideoById))
VideoRouter.route("/:videoId").patch(
    upload.single("thumbnail")
    ,
    asyncHandler(updateThumbnail))


module.exports = VideoRouter