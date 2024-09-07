const mongoose = require("mongoose");
const Comment = require("../models/comment.model.js");

const getVideoComments = async (req, res) => {
  const { videoId } = req.params;

  if (!videoId?.trim()) {
    return res.status(401).json({
      message: "Enter a valid VideoId",
    });
  }


  const comments = await Comment.aggregate([
    {
        $match:{
            video : new mongoose.Types.ObjectId(videoId),
            replyId : null
        },
    },
    {
        $lookup : {
            from : "users",
            as : "user",
            localField : "owner",
            foreignField : "_id",
            pipeline : [
                {
                    $project :{
                        _id :1 ,
                        username:1,
                        avatar : 1,
                        fullname:1,
                        coverImage:1,
                    }
                }
            ]
        }
    },
    {
        $unwind : {
            path : "$user"
        }
    }
  ])

  return res.status(200).json({
    message: "OK",
    data: comments,
  });
};

const addComment = async (req, res) => {
  const { content, userid } = req.body;
  const { videoId } = req.params;

  if (!content.trim()) {
    return res.status(401).json({
      message: "Enter comment",
    });
  }

  const response = await Comment.create({
    content,
    owner: req.user,
    video: videoId,
    replyId: null,
  });

  return res.status(200).json({
    message: "OK",
    data: response,
  });
};

const deleteComment = async (req, res) => {
  const { commentId } = req.params;

  if (!commentId?.trim()) {
    return res.status(400).json({
      message: "not an valid comment",
    });
  }

  await Comment.deleteMany({
    $or:[
        {_id : new mongoose.Types.ObjectId(commentId)},
        {replyId : new mongoose.Types.ObjectId(commentId)}
    ]
  });

  return res.status(200).json({
    message: "OK",
  });
};

const updateComment = async (req, res) => {
  const { content } = req.body;
  const { commentId } = req.params;

  if (!content.trim()) {
    return res.status(400).json({
      message: "content cant be empty",
    });
  }

  const comment = await Comment.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(commentId) },
    {
      content: content,
    },
    { new: true }
  );

  if (!comment) {
    return res.status(401).json({
      message: "comment doesnt exist",
    });
  }

  return res.status(200).json({
    message: "OK",
    data: comment,
  });
};

const addReplyComment = async (req, res) => {
  const userid = req.user._id;
  const parentCommentId = req.params.commentId;
  const content = req.body.content;

  const checkParent = await Comment.findById(
    new mongoose.Types.ObjectId(parentCommentId)
  );

  if (!content.trim()) {
    return res.status(401).json({
      message: "Comment should not be empty",
    });
  }

  if (!checkParent) {
    return res.status(401).json({
      message: "Parent Comment Does not exist",
    });
  }

  const replyComment = await Comment.create({
    content: content,
    replyId: new mongoose.Types.ObjectId(checkParent._id),
    video: new mongoose.Types.ObjectId(checkParent.video),
    owner: new mongoose.Types.ObjectId(userid),
  });

  return res.status(200).json({
    message: "OK",
    data: replyComment,
  });
};

const getReplyComment = async (req, res) => {
  const commentId = req.params.commentId;
  const userId = req.params.userId;

  const replies = await Comment.aggregate([
    {
      $match: {
        replyId: new mongoose.Types.ObjectId(commentId),
      },
    },
    {
        $lookup : {
            from : "users",
            as : "user",
            localField : "owner",
            foreignField : "_id",
            pipeline : [
                {
                    $project :{
                        _id :1 ,
                        username:1,
                        avatar : 1,
                        fullname:1,
                        coverImage:1,
                    }
                }
            ]
        }
    },
    {
      $project: {
        user: 1,
        content: 1,
      },
    },
  ]);

  return res.status(200).json({
    message: "OK",
    data: replies,
  });
};

module.exports = {
  getVideoComments,
  addComment,
  deleteComment,
  updateComment,
  addReplyComment,
  getReplyComment,
};
