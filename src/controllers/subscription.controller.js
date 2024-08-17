const mongoose = require("mongoose");
const User = require("../models/user.model.js");
const Subscription = require("../models/subscription.model.js");

const toggleSubscription = async (req, res) => {
  try {
    const channelId = req.params.channelId;
    const userId = req.user._id;

    const temp = await Subscription.findOne({
      channel: channelId,
      subscriber: userId,
    });

    if (temp) {
      await Subscription.findOneAndDelete({
        subscriber: userId,
        channel: channelId,
      });

      return res.status(200).json({
        message: "Unsubscribed successfully",
      });
    } else {
      await Subscription.create({
        subscriber: userId,
        channel: channelId,
      });
      return res.status(200).json({
        message: "Subscribed successfully",
      });
    }
  } catch (error) {
    console.error("Error toggling subscription:", error.message);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

const getChannelSubscribers = async (req, res) => {
  try {
    const { channelId } = req.params;

    const subscribers = await Subscription.aggregate([
      {
        $match: {
          channel: new mongoose.Types.ObjectId(channelId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "subscriber",
          foreignField: "_id",
          as: "subscriber",
        },
      },
      {
        $addFields: {
          subscriber: { $first: "$subscriber" },
        },
      },
      {
        $project: {
          _id: 0,
          subscriber: 1,
        },
      },
    ]);

    return res.status(200).json({
      message: "Subscribers fetched successfully",
      data: subscribers,
    });
  } catch (error) {
    console.error("Error fetching channel subscribers:", error.message);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

const getSubscribedChannels = async (req, res) => {
  try {
    const { userId } = req.params;

    const subscribed_channels = await Subscription.aggregate([
      {
        $match: {
          subscriber: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "channel",
          foreignField: "_id",
          as: "subscribed_channel",
        },
      },
      {
        $addFields: {
          channel: {
            $first: "$subscribed_channel",
          },
        },
      },
      {
        $project: {
          channel: 1,
        },
      },
    ]);

    return res.status(200).json({
      message: "Subscribed channels fetched successfully",
      data: subscribed_channels,
    });
  } catch (error) {
    console.error("Error fetching subscribed channels:", error.message);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  getChannelSubscribers,
  getSubscribedChannels,
  toggleSubscription,
};
