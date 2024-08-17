const mongoose = require("mongoose")
const {Router} = require("express")
const {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} = require("../controllers/playlist.controller.js")
const verifyJWT = require("../middlewares/auth.middleware.js")
const PlaylistRouter = Router()

PlaylistRouter.use(verifyJWT)

PlaylistRouter.use(verifyJWT);

PlaylistRouter.route("/").post(createPlaylist)

PlaylistRouter
    .route("/:playlistId")
    .get(getPlaylistById)
    .patch(updatePlaylist)
    .delete(deletePlaylist);

PlaylistRouter.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
PlaylistRouter.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

PlaylistRouter.route("/user/:userId").get(getUserPlaylists);


module.exports = PlaylistRouter