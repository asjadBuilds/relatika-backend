import Conversation from '../models/conversationModel.js'
import AsyncHandler from '../utils/AsyncHandler.js'
import ApiResponse from '../utils/ApiResponse.js'
import Message from '../models/MessageModel.js'
import ApiError from '../utils/ApiError.js'
const getConversations = AsyncHandler(async(req,res)=>{
    const conversations = await Conversation.find({
        participants: req.user._id
    })
    .populate('participants','-password')
    .populate({
        path:'lastMessage',
        populate:{
            path:'sender',
            select:'username'
        }
    })
    .sort({updatedAt:-1})
    const filteredConversations = conversations.map((conv) => {
        const receiver = conv.participants.find(
          (participant) => participant._id.toString() !== req?.user._id.toString()
        );
    
        return {
          ...conv.toObject(),
          receiver, // new field
        };
      });
    res
    .status(200)
    .json(new ApiResponse(200, filteredConversations, "User Conversations fetched Successfully"))
})
const createOrGetConversation = AsyncHandler(async (req, res) => {
    const { receiverId } = req.body;
    const senderId = req.user._id;
  
    if (!receiverId) {
      throw new ApiError(400, "Receiver ID not found")
    }
  
    // Check for existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId],
         $size: 2,

         },
    })
      .populate('participants', '-password')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'username',
        },
      });
      if (conversation) {
        const receiver = conversation.participants.find(
          (user) => user._id.toString() === receiverId.toString()
        );
      
        conversation = conversation.toObject();
        conversation.receiverField = receiver;
      }
  
    // Create if not exists
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
  
      // Re-populate after creation
      await conversation.populate('participants', '-password');
    }
  
    res.status(200).json(
      new ApiResponse(200, conversation, 'Conversation created or fetched successfully')
    );
  });

  const getConversationById = AsyncHandler(async(req,res)=>{
    const {conversationId} = req.body;
    const conversation = await Conversation.findById(conversationId).populate('')
    if(!conversation) throw new ApiError(400, "No conversation found");
    res
    .status(200)
    .json(new ApiResponse(200, conversation, "Conversation details fetched Successfully"))
  })
  
  
const getMessagesByConversation = AsyncHandler(async(req,res)=>{
    const {conversationId} = req.params;
    const messages = await Message.find({conversation:conversationId})
    .populate('sender')
    .sort({createdAt:1})
    res
    .status(200)
    .json(new ApiResponse(200, messages, "Conversation messages fetched successfully"))
})

const sendMessage = AsyncHandler(async(req,res)=>{
    const {sender, conversationId, content, io} = req.body;
    try {
        const message = await Message.create({
            sender,
            content,
            conversation:conversationId,
            sentAt:Date.now()
        })

        await Conversation.findByIdAndUpdate(conversationId,{
            lastMessage: message._id,
            updatedAt: new Date()
        })

        const fullMessage = await message.populate('sender','username');

        if(req.io){
            req.io.to(conversationId).emit('receiveMessage',fullMessage)
            console.log(`message: ${fullMessage.content} sent successfully`)
        }


        res
        .status(200)
        .json(new ApiResponse(200, fullMessage, "Message sended successfully"))
    } catch (error) {
        console.error(error);
    }
})

export {
    getConversations,
    getMessagesByConversation,
    sendMessage,
    createOrGetConversation,
    getConversationById
}