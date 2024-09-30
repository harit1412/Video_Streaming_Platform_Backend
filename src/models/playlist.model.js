const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    videos: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Video",
        },
      ],
      required: ()=>{        
        return this.length === new Set(this).length
      }
    },
    realOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    Owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    ifSavedRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Playlist",
    },

    PublicAccess: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Playlist = mongoose.model("Playlist", playlistSchema);

module.exports = Playlist;
