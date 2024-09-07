const mongoose = require("mongoose")
const Comment = require("../models/comment.model.js")

const getVideoComments = async(req,res)=>{
    const {videoId}= req.params

    if(!videoId?.trim())
    {
        return res.status(401).json({
            message : "Enter a valid VideoId",
        })
    }
    
    const commments = await Comment.find({
        video : videoId
    })

    return res.status(200).json({
        message : "OK",
        data : commments
    })
}

const addComment = async(req,res)=>{
    const {content,userid,} = req.body;
    const {videoId} = req.params;
    
    if((!content.trim()))
    {
        return res.status(401).json({
            message : "Enter comment"
        })
    }

    const response = await Comment.create({
        content,
        owner : req.user,
        video : videoId,
        replyId : ""
    });

    return res.status(200).json({
        message : "OK",
        data : response
    })
}

const deleteComment = async(req,res)=>{
    const {commentId} = req.params

    if(!commentId?.trim())
    {
        return res.status(400).json({
            message : "not an valid comment"
        })
    }

    await Comment.findByIdAndDelete({
        _id : commentId,
    })


    return res.status(200).json({
        message : "OK"
    })

}

const updateComment = async(req,res)=>{
    const {content} = req.body;
    const {commentId} = req.params

    
}

const addReplyComment = async(req,res) => {
    const userid = req.user._id
    const parentCommentId = req.params.commentId
    const content = req.body.text

    const checkParent = await Comment.findById(mongoose.Schema.ObjectId(parentCommentId))

    if(!content.trim()){
        return res.status(401).json({
            message : "Comment should not be empty"
        })
    }

    if(!checkParent)
    {
        return res.status(401).json({
            message : "Parent Comment Does not exist"
        })
    }

    const replyComment = await Comment.create({
        content : content,
        replyId : mongoose.Schema.ObjectId(checkParent._id),
        video : mongoose.Schema.ObjectId(checkParent.video),
        owner : mongoose.Schema.ObjectId(userid)
    })

    return res.status(200).json({
        message : "OK",
        data : replyComment
    })
}

const getReplyComment = async(req,res) => {
    const commentId = req.params.commentId;
    const userId = req.params.userId;

    const replies = Comment.aggregate([
        {
            $match : {
                replyId : mongoose.Schema.ObjectId(commentId)
            }
        },
        {
            $lookup :{
                from : "User",
                as : "user",
                localField : "owner",
                foreignField : "_id",
            }
        },
        {
            $project: {
                user : 1,
                content : 1,
            }
        }
    ])

    return res.status(200).json({
        message : "OK",
        data : replies
    })
}



module.exports = {getVideoComments,addComment,deleteComment,updateComment,addReplyComment,getReplyComment}
