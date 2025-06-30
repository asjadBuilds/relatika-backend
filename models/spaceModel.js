import mongoose from "mongoose";

const spaceSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
    },
    avatar:{
        type:String
    },
    description:{
        type:String,
        required:true,
    },
    rules:[{
        type:String
    }],
    creator:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    }
},{timestamps:true});

const Space = mongoose.model("Space", spaceSchema);
export default Space;