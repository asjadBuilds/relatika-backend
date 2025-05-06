import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    postId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post",
        required:true,
    },
    value:{
        type:Number,
        required:true,
        enum:[-1,1],
    }
},{timestamps:true});

const Vote = mongoose.model("Vote", voteSchema);
export default Vote;