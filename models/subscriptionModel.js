import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    spaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Space",
        required: true,
    },
},{timestamps:true});

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;