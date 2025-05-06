import mongoose from "mongoose";

const otpSchema = mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    otp:{
        type:String,
        required:true
    },
},{
    timestamps:true,
})

const Otp = mongoose.model("Otp", otpSchema);
export default Otp;