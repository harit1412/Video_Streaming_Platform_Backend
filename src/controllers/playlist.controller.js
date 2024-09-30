const { default: mongoose } = require("mongoose");
const Playlist = require("../models/playlist.model.js");
const Video = require("../models/video.model.js");
const { check } = require("prettier");

const createPlaylist = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        message: "Playlist Name and Description Required",
      });
    }

    const playlist = await Playlist.create({
      name,
      description,
      realOwner: req.user._id,
      Owner: req.user._id,
    });

    res.status(201).json({
      message: "Playlist created successfully",
      data: playlist,
    });
  } catch (error) {
    console.error("Error creating playlist:", error.message);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

const getUserPlaylists = async (req, res) => {
  try {
    const { userId } = req.params;

    const allPlaylists = await Playlist.find({
      Owner: userId,
    });

    res.status(200).json({
      message: "Playlists fetched successfully",
      data: allPlaylists,
    });
  } catch (error) {
    console.error("Error fetching user playlists:", error.message);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

const getPlaylistById = async (req, res) => {
  try {
    const { playlistId } = req.params;

    const existPlaylist = await Playlist.findOne({
      _id: new mongoose.Types.ObjectId(playlistId),
    });

    if (!existPlaylist) {
      return res.status(404).json({
        message: "Playlist Doesnt Exist",
      });
    }

    const playlist = await Playlist.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(playlistId),
        },
      },
      {
        $unwind: "$videos",
      },
      {
        $lookup: {
          from: "videos",
          localField: "videos",
          foreignField: "_id",
          as: "videos",
        },
      },
      {
        $match: {
          "videos.isPublished": true,
        },
      },
      {
        $addFields: {
          videos: {
            $first: "$videos",
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          videos: {
            $push: "$videos",
          },
        },
      },
      {
        $project: {
          _id: 1,
          videos: 1,
          name: 1,
          totalVideos: { $size: "$videos" },
        },
      },
    ]);

    res.status(200).json({
      message: "Playlist fetched successfully",
      data: playlist[0] || {},
    });
  } catch (error) {
    console.error("Error fetching playlist:", error.message);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

const addVideoToPlaylist = async (req, res) => {
  const { playlistId, videoId } = req.params;

  const videoExist = await Video.findOne({
    _id: new mongoose.Types.ObjectId(videoId),
    isPublished: true,
  });

  if (!videoExist) {
    return res.status(404).json({
      message: "Video is Private",
    });
  }

  if (videoExist.Owner != videoExist.realOwner) {
    return res.status(404).json({
      message: "You are not real owner of playlist",
    });
  }


  const playlist = await Playlist.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(playlistId),
    },
    {
      $push: { videos: new mongoose.Types.ObjectId(videoId) },
    },
    {
      new: true,runValidators:true
    }
  );

  if (!playlist) {
    return res.status(404).json({
      message: "No Such Playlist Exists",
    });
  }

  const newPlaylist = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
      },
    },
    {
      $unwind: "$videos",
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
      },
    },
    {
      $addFields: {
        videos: {
          $first: "$videos",
        },
      },
    },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        videos: {
          $push: "$videos",
        },
      },
    },
    {
      $project: {
        _id: 1,
        videos: 1,
        name: 1,
        totalVideos: { $size: "$videos" },
      },
    },
  ]);

  return res.status(200).json({
    message: "Video added to playlist successfully",
    data: newPlaylist[0],
  });
};

const removeVideoFromPlaylist = async (req, res) => {
  try {
    const { playlistId, videoId } = req.params;

    const findPlaylist = await Playlist.find({
      _id: new mongoose.Types.ObjectId(playlistId),
    });

    if (findPlaylist.Owner != findPlaylist.realOwner) {
      return res.status(404).json({
        message: "You are not real owner of playlist",
      });
    }
    const playlist = await Playlist.findByIdAndUpdate(
      new mongoose.Types.ObjectId(playlistId),
      {
        $pull: { videos: new mongoose.Types.ObjectId(videoId) },
      },
      {
        new: true,
      }
    );

    if (!playlist) {
      return res.status(404).json({
        message: "No Such Playlist Exists",
      });
    }

    res.status(200).json({
      message: "Video removed from playlist successfully",
      data: playlist,
    });
  } catch (error) {
    console.error("Error removing video from playlist:", error.message);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

const deletePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;

    const playlist = await Playlist.findById(
      new mongoose.Types.ObjectId(playlistId)
    );

    if (!playlist) {
      return res.status(404).json({
        message: "No Such Playlist Exists",
      });
    }

    if (
      playlist.Owner.equals(playlist.realOwner) &&
      playlist.realOwner.equals(new mongoose.Types.ObjectId(req.user._id))
    ) {
      return res.status(200).json({
        message: "Playlist deleted successfully",
      });
    } else {
      return res.status(404).json({
        message: "You are not real owner of playlist",
      });
    }
  } catch (error) {
    console.error("Error deleting playlist:", error.message);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

const updatePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        message: "All Fields are Required",
      });
    }

    const checkPlaylist = await Playlist.findById(playlistId);

    if (!checkPlaylist) {
      return res.status(401).json({
        message: "Playlist no more exist",
      });
    }

    if (!checkPlaylist.Owner.equals(checkPlaylist.realOwner)) {
      return res.status(404).json({
        message: "You are not real owner",
      });
    }

    const playlist = await Playlist.findByIdAndUpdate(
      new mongoose.Types.ObjectId(playlistId),
      {
        $set: { name, description },
      },
      {
        new: true,
      }
    );

    if (!playlist) {
      return res.status(404).json({
        message: "No Such Playlist Exists",
      });
    }

    res.status(200).json({
      message: "Playlist updated successfully",
      data: playlist,
    });
  } catch (error) {
    console.error("Error updating playlist:", error.message);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

const savePlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const { userId } = req.user._id;

  const playlist = await Playlist.findById(playlistId);

  if (!playlist && !playlist.PublicAccess) {
    return res.status(401).json({
      message: "Playlist doesnt exist",
    });
  }

  const newPlaylist = await Playlist.create({
    name: playlist.name,
    description: playlist.description,
    videos: playlist.videos,
    realOwner: playlist.realOwner,
    Owner: new mongoose.Types.ObjectId(userId),
    ifSavedRef: new mongoose.Types.ObjectId(playlistId),
    PublicAccess: true,
  });

  return res.status(200).json({
    message: "OK",
    data: newPlaylist,
  });
};

const togglePlaylistAccess = async (req, res) => {
  const { playlistId } = req.params;
  const { userId } = req.user._id;

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    return res.status(401).json({
      message: "Playlist doesnt exist",
    });
  }

  if (
    playlist.Owner != playlist.realOwner ||
    playlist.realOwner != new mongoose.Types.ObjectId(userId)
  ) {
    return res.status(404).json({
      message: "you are not real owner",
    });
  }

  playlist.PublicAccess = !playlist.PublicAccess;

  playlist.save();

  return res.status(200).json({
    message: "OK",
    data: playlist,
  });
};

module.exports = {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
  savePlaylist,
  togglePlaylistAccess,
};
