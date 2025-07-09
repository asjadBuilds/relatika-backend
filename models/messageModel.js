import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    conversation:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Conversation'
    },
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    content:{
        type:String,
        required:true,
    },
    isRead:{
        type:Boolean,
        default:false
    },
    sentAt:{
        type:Date,
        default:Date.now
    }
})

const Message = mongoose.model("Message",messageSchema);
export default Message;