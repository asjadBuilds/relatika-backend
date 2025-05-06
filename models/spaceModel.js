import mongoose from "mongoose";

const spaceSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
    },
    description:{
        type:String,
        required:true,
    },
    creator:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    }
},{timestamps:true});

const Space = mongoose.model("Space", spaceSchema);
export default Space;