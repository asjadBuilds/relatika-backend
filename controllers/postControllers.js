import { validationResult } from 'express-validator';
import AsyncHandler from '../utils/AsyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Post from '../models/postModel.js';
import Vote from '../models/voteModel.js';
import Comment from '../models/commentModel.js';
import { uploadFileonCloudinary } from '../utils/cloudinary.js';


const getPaginatedPosts = AsyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const cursor = req.query.cursor;

  const query = cursor
    ? { _id: { $lt: cursor } }  // load posts older than cursor
    : {};

  const posts = await Post.find(query)
    .sort({ _id: -1 }) // newest first
    .limit(limit + 1) // fetch 1 extra to check if there's a next page
    .populate({
    path: 'author',
    select: 'username avatar createdAt',
  })
  .populate({
    path: 'spaceId',
    select: 'name avatar description',
  });
  //merging upvotes/downvotes/comments count 
  const enrichedPosts = await Promise.all(posts.map(async post => {
  const upvotes = await Vote.countDocuments({ postId: post._id, value: 1 });
  const downvotes = await Vote.countDocuments({ postId: post._id, value: -1 });
  const comments = await Comment.countDocuments({ postId: post._id });

  return {
    ...post.toObject(),
    upvoteCount: upvotes,
    downvoteCount: downvotes,
    commentCount: comments
  };
}));

  const hasNextPage = enrichedPosts.length > limit;
  if (hasNextPage) enrichedPosts.pop(); // remove the extra post

  res.status(200).json({
    enrichedPosts,
    nextCursor: hasNextPage ? enrichedPosts[enrichedPosts.length - 1]._id : null,
  });
});


const createPost = AsyncHandler(async (req, res) => {
    const { title, content, spaceId } = req.body;
    const result = validationResult(req.body);
    if (!result) throw new ApiError(402, "Invalid details");
    const galleryPaths = req.files["gallery"]
        ? req.files["gallery"].map((file) => file.path)
        : [];
    const galleryUrls = await Promise.all(
        galleryPaths.map((path) => uploadFileonCloudinary(path))
    );
    if (!galleryUrls) throw new ApiError(500, "error creating gallery urls");
    const gallery = galleryUrls.map((item) => item.url);
    const post = await Post.create({
        title,
        content,
        spaceId,
        images: gallery,
        author: req.user._id
    });
    if (!post) throw new ApiError(500, "error creating post");
    res
        .status(200)
        .json(new ApiResponse(200, post , "Post created successfully"));
})

const getPostById = AsyncHandler(async (req, res) => {
    const { postId } = req.params;
    const post = await Post.findById(postId)
    res.status(200).json(new ApiResponse(200, "Post fetched successfully", post))
})

const editPost = AsyncHandler(async (req, res) => {
    const { title, content } = req.body;
    const { postId } = req.params;
    const galleryPaths = req.files["gallery"]
        ? req.files["gallery"].map((file) => file.path)
        : [];
    const galleryUrls = await Promise.all(
        galleryPaths.map((path) => uploadFileonCloudinary(path))
    );
    if (!galleryUrls) throw new ApiError(500, "error creating gallery urls");
    const gallery = galleryUrls.map((item) => item.url);
    let updateFields = {};
    if (title) updateFields.title = title;
    if (content) updateFields.content = content;
    if (gallery.length > 0) updateFields.images = gallery;
    const post = await Post.findByIdAndUpdate(postId,
        { $set: updateFields }, { new: true })
})

const deletePost = AsyncHandler(async (req, res) => {
    const { postId } = req.params;
    const post = await Post.findByIdAndDelete(postId)
    if (!post) throw new ApiError(500, "error deleting post")
    res.status(200).json(new ApiResponse(200, "Post deleted successfully", post))
})

const getPostsBySpaceId = AsyncHandler(async (req, res) => {
    const { spaceId } = req.params;
    const posts = await Post.find({ spaceId });
    if (!posts) throw new ApiError(500, "error fetching posts")
    res.status(200).json(new ApiResponse(200, "Posts fetched successfully", posts))
})

const addVoteOnPost = AsyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { value } = req.body;
    const alreadyVoted = await Vote.findOne({
        userId: req.user._id,
        postId,
    })
    if (alreadyVoted) throw new ApiError(400, "Already voted on this post")
    const vote = await Vote.create({
        userId: req.user._id,
        postId,
        value
    })
    res.status(200).json(new ApiResponse(200, vote, "added vote successfully"))
})

const getCommentsByPost = AsyncHandler(async (req, res) => {
    const { postId } = req.params;
    const comments = await Comment.find({ postId }).sort({ createdAt: -1 }).lean();
    if (!comments) throw new ApiError(500, "error fetching comments")
    const commentsById = {};
    comments.forEach((comment) => {
        comment.children = [];
        commentsById[comment._id] = comment;
    })
    const rootComments = [];
    comments.forEach((comment) => {
        if (comment.parentId) {
            commentsById[comment.parentId]?.children.push(comment);
        } else {
            rootComments.push(comment);
        }
    })
    res.status(200).json(new ApiResponse(200, rootComments, "Comments fetched successfully"))
})

const addComment = AsyncHandler(async(req,res)=>{
    const {content,postId,parentId} = req.body;
    const comment = await Comment.create({
        content,
        postId,
        authorId:req.user._id,
        parentId: parentId || null
    })
    if(!comment) throw new ApiError(500,"error creating comment")
    res.status(200).json(new ApiResponse(200,"Comment created successfully",comment))
})

export {
    getPaginatedPosts,
    createPost,
    getPostById,
    editPost,
    deletePost,
    getPostsBySpaceId,
    addVoteOnPost,
    getCommentsByPost,
    addComment
}