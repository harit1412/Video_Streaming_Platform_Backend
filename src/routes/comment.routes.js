const {Router} = require("express")
const asyncHandler = require("../utils/asyncHandlers.js")

const { getVideoComments,
    addComment,
    updateComment,
    deleteComment} = require("../controllers/comment.controller.js")


const verifyJWT = require("../middlewares/auth.middleware.js")

const CommentRouter = Router();

CommentRouter.use(verifyJWT);

CommentRouter.route("/:videoId").get(asyncHandler(getVideoComments))
CommentRouter.route("/:videoId").post(asyncHandler(addComment))

CommentRouter.route("/c/:commentId").delete(asyncHandler(deleteComment))
CommentRouter.route("/c/:commentId").patch(asyncHandler(updateComment))

module.exports = CommentRouter