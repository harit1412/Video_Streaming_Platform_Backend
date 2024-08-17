const mongoose = require("mongoose");
const Video = require("../models/video.model.js");
const uploadOnCloudinary = require("../utils/couldinary.js");

const getAllVideos = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortType = "desc",
      userId,
    } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const videos = await Video.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $sort: {
          [sortBy]: sortType === "asc" ? 1 : -1,
        },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: parseInt(limit, 10),
      },
    ]);

    if (videos.length === 0) {
      return res.status(404).json({ message: "No videos found" });
    }

    return res.status(200).json({
      message: "OK",
      data: videos,
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return res.status(500).json({
      message: "Error fetching videos",
      error: error.message,
    });
  }
};

const publishVideo = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    const videoFilePath = req.files?.video[0]?.path;
    const thumbnailFilePath = req.files?.thumbnail[0]?.path;

    if (!videoFilePath || !thumbnailFilePath) {
      return res.status(400).json({
        message: "File not uploaded to local storage",
      });
    }

    const videoUploadResponse = await uploadOnCloudinary(videoFilePath);
    const thumbnailUploadResponse = await uploadOnCloudinary(thumbnailFilePath);

    if (!videoUploadResponse || !thumbnailUploadResponse) {
      return res.status(500).json({
        message: "File not uploaded to Cloudinary",
      });
    }

    const videoURL = videoUploadResponse.url;
    const duration = videoUploadResponse.duration;
    const thumbnailURL = thumbnailUploadResponse.url;

    const video = await Video.create({
      videoFile: videoURL,
      thumbnail: thumbnailURL,
      owner: req.user._id,
      title: title,
      description: description,
      duration: duration,
      views: 0,
      isPublished: true,
    });

    return res.status(201).json({
      message: "OK",
      data: video,
    });
  } catch (error) {
    console.error("Error uploading video:", error);
    return res.status(500).json({
      message: "Error while uploading video to the database",
      error: error.message,
    });
  }
};

const getVideoById = async (req, res) => {
  try {
    const videoId = req.params.videoId;

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({
        message: "Video doesn't exist",
      });
    }

    return res.status(200).json({
      message: "OK",
      data: video,
    });
  } catch (error) {
    console.error("Error fetching video:", error);
    return res.status(500).json({
      message: "Error fetching video",
      error: error.message,
    });
  }
};

const deleteVideoById = async (req, res) => {
  try {
    const videoId = req.params.videoId;

    const video = await Video.findByIdAndDelete(videoId);

    if (!video) {
      return res.status(404).json({
        message: "Video doesn't exist",
      });
    }

    return res.status(200).json({
      message: "OK",
      data: video,
    });
  } catch (error) {
    console.error("Error deleting video:", error);
    return res.status(500).json({
      message: "Error deleting video",
      error: error.message,
    });
  }
};

const updateThumbnail = async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const thumbnailFilePath = req.file?.path;

    if (!thumbnailFilePath) {
      return res.status(400).json({
        message: "Thumbnail not uploaded to local storage",
      });
    }

    const thumbnailUploadResponse = await uploadOnCloudinary(thumbnailFilePath);

    if (!thumbnailUploadResponse) {
      return res.status(500).json({
        message: "Thumbnail not uploaded to Cloudinary",
      });
    }

    const video = await Video.findByIdAndUpdate(
      videoId,
      { $set: { thumbnail: thumbnailUploadResponse.url } },
      { new: true }
    );

    if (!video) {
      return res.status(404).json({
        message: "Video doesn't exist",
      });
    }

    return res.status(200).json({
      message: "OK",
      data: video,
    });
  } catch (error) {
    console.error("Error updating thumbnail:", error);
    return res.status(500).json({
      message: "Error updating thumbnail",
      error: error.message,
    });
  }
};

module.exports = {
  getAllVideos,
  publishVideo,
  getVideoById,
  deleteVideoById,
  updateThumbnail,
};
