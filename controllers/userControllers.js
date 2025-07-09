import Comment from "../models/commentModel.js";
import Post from "../models/postModel.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";

const getUserPosts = AsyncHandler(async(req,res)=>{
    const {userId} = req.body;
    const posts = await Post.find({author:userId})
    .sort({ _id: -1 })
    .populate('author spaceId');
    if(!posts) throw new ApiError(404,"No Posts found");
    res
    .status(200)
    .json(new ApiResponse(200,posts,"User posts fetched successfully"))
})

const getUserComments = AsyncHandler(async(req,res)=>{
    const {userId} = req.body;
    const comments = await Comment.find({authorId:userId})
    .sort({ _id: -1 })
    .populate({
        path:'authorId',
        select:'username avatar'
    })
    .populate({
        path:'parentId',
        select:'authorId'
    })
    if(!comments) throw new ApiError(404,"No Comments found");
    res
    .status(200)
    .json(new ApiResponse(200,comments,"User Comments fetched successfully"))
})

export {
    getUserComments,
    getUserPosts
}