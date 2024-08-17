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




module.exports = {getVideoComments,addComment,deleteComment,updateComment}
