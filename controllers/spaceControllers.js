import Space from '../models/spaceModel.js';
import AsyncHandler from '../utils/AsyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Subscription from '../models/subscriptionModel.js';
const createSpace = AsyncHandler(async (req, res) => {
    const { name, description } = req.body
    const spaceExists = await Space.findOne({ name });
    if (spaceExists) throw new ApiError(402, "Space already exists")
    const space = await Space.create({
        name,
        description,
        creator: req.user._id
    })
    res
        .status(201)
        .json(new ApiResponse(201, space, "Space created successfully"))
})
const joinSpace = AsyncHandler(async (req, res) => {
    const { spaceId } = req.body;
    const alreadyJoined = await Subscription.findOne({ userId: req.user._id, spaceId });
    if (alreadyJoined) throw new ApiError(402, "Already joined the space")
    const subscription = await Subscription.create({
        userId: req.user._id,
        spaceId
    })
    res
        .status(201)
        .json(new ApiResponse(201, subscription, "User joined the space successfully"))
})
const leaveSpace = AsyncHandler(async (req, res) => {
    const { spaceId } = req.body;
    const isMember = await Subscription.findOne({ userId: req.user._id, spaceId });
    if (!isMember) throw new ApiError(402, "You are not a member of this space")
    await Subscription.deleteOne({ userId: req.user._id, spaceId });
    res
        .status(200)
        .json(new ApiResponse(200, "User left the space successfully"))
})
const deleteSpace = AsyncHandler(async (req, res) => {
    const spaceId = req.params.spaceId;
    const isAdmin = await Space.findOne({ creator: req.user._id, _id: spaceId });
    if (!isAdmin) throw new ApiError(402, "You are not the admin of this space")
    await Subscription.deleteMany({ spaceId });
    await Space.deleteOne({ _id: spaceId });
    res
        .status(200)
        .json(new ApiResponse(200, "Space deleted successfully"))
})
const editSpace = AsyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const spaceId = req.params.spaceId;
    const isAdmin = await Space.findOne({ creator: req.user._id, _id: spaceId });
    if (!isAdmin) throw new ApiError(402, "You are not the admin of this space")
    let updateFields = {};
    if (req.body.name) updateFields.name = req.body.name;
    if (req.body.description) updateFields.description = req.body.description;
    await Space.findByIdAndUpdate(spaceId,
        { $set: updateFields }, { new: true })
    res
        .status(200)
        .json(new ApiResponse(200, "Space updated successfully"))
})
const getSpaceByQuery = AsyncHandler(async (req, res) => {
    const { name } = req.query;
    // const spaces = await Space.find({name:{$regex:name,$options:"i"}}).populate()
    const spaces = await Space.aggregate([
        { $match: { name: { $regex: name, $options: "i" } } },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "spaceId",
                as: "subscriptions"
            }
        },
        {$addFields:{members:{$size:"$subscriptions"}}},
        {$project:{subscriptions:0}}
    ])
    res.status(200).json(new ApiResponse(200, spaces, "Spaces fetched successfully"))
})
const getSpaceMembers = AsyncHandler(async (req, res) => {
    const spaceId = req.params.spaceId;
    const members = await Subscription.find({ spaceId }).populate("userId")
    res.status(200).json(new ApiResponse(200, members, "Members fetched successfully"))
})
const getUserSpaces = AsyncHandler(async (req, res) => {
    const userId = req.user._id;
    const spaces = await Subscription.find({ userId }).populate("spaceId")
    res.status(200).json(new ApiResponse(200, spaces, "Spaces fetched successfully"))
})

export {
    createSpace,
    joinSpace,
    leaveSpace,
    deleteSpace,
    editSpace,
    getSpaceByQuery,
    getSpaceMembers,
    getUserSpaces
};