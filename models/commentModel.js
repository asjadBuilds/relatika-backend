import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    content:{
        type:String,
        required:true
    },
    postId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post",
        required:true,
    },
    authorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    parentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment",
        default:null,
    }
})

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;