const mongoose = require('mongoose');   
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

const commentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true
        },
        replyId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Comment",
            default : null // null shows root comment
        },
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)




commentSchema.plugin(mongooseAggregatePaginate)

const Comment = mongoose.model("Comment", commentSchema)
module.exports = Comment;

