const {Router} = require("express")

const { getVideoComments,
    addComment,
    updateComment,
    deleteComment} = require("../controllers/comment.controller.js")


const verifyJWT = require("../middlewares/auth.middleware.js")

const CommentRouter = Router();

CommentRouter.use(verifyJWT);

CommentRouter.route("/:videoId").get(getVideoComments)
CommentRouter.route("/:videoId").post(addComment)

CommentRouter.route("/c/:commentId").delete(deleteComment)
CommentRouter.route("/c/:commentId").patch(updateComment)

module.exports = CommentRouter