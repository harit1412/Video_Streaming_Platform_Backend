const mongoose = require("mongoose")
const {Router} = require("express")
const asyncHandler = require("../utils/asyncHandlers.js")

const {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
    savePlaylist,
    togglePlaylistAccess,
} = require("../controllers/playlist.controller.js")
const verifyJWT = require("../middlewares/auth.middleware.js")
const PlaylistRouter = Router()

PlaylistRouter.use(verifyJWT)

PlaylistRouter.route("/").post(createPlaylist)

PlaylistRouter
    .route("/:playlistId")
    .get(asyncHandler(getPlaylistById))
    .patch(asyncHandler(updatePlaylist))
    .delete(asyncHandler(deletePlaylist));

PlaylistRouter.route("/add/:videoId/:playlistId").patch(asyncHandler(addVideoToPlaylist));
PlaylistRouter.route("/remove/:videoId/:playlistId").patch(asyncHandler(removeVideoFromPlaylist));

PlaylistRouter.route("/user/:userId").get(asyncHandler(getUserPlaylists));

PlaylistRouter.route("/save/:playlistId").get(asyncHandler(savePlaylist));

PlaylistRouter.route("/toggleAccess/:playlistId").get(asyncHandler(togglePlaylistAccess))


module.exports = PlaylistRouter