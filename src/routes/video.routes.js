const { Router } = require("express");

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

VideoRouter.route("/").get(getAllVideos)


VideoRouter.route("/:videoId").get(getVideoById)
VideoRouter.route("/:videoId").delete(deleteVideoById)
VideoRouter.route("/:videoId").patch(
    upload.single("thumbnail")
    ,
    updateThumbnail)


module.exports = VideoRouter