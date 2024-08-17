const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

app.use(cors());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

const UserRouter = require("./routes/user.routes.js");
const VideoRouter = require("./routes/video.routes.js")
const SubscriptionRouter = require("./routes/subscription.routes.js");
const PlaylistRouter = require("./routes/playlist.routes.js");
const CommentRouter = require("./routes/comment.routes.js");


app.use("/api/v1/users", UserRouter);
app.use("/api/v1/videos", VideoRouter);
app.use("/api/v1/subscription", SubscriptionRouter);
app.use("/api/v1/playlist", PlaylistRouter);
app.use("/api/v1/comment", CommentRouter);


module.exports = app;
