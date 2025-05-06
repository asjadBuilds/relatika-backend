import otpGenerator from 'otp-generator';
import { sgMail } from '../app.js';
import ApiError from './ApiError.js';
import Otp from '../models/otpModel.js';
const sendOtpMail = async(email)=>{
    let response;
    const otp = otpGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    const msg = {
      to: email,
      from: process.env.SENDGRID_SENDER_EMAIL,
      subject: 'Verify your OTP | Relatika',
      text: 'and easy to do anywhere, even with Node.js',
      html: `<strong>Your otp is : ${otp}</strong>`,
    }
    try {
        response = sgMail.send(msg);
        await Otp.create({email, otp});
        
    } catch (error) {
        throw new ApiError(500, "Unable to send email")
    }
    return response;
}

export {sendOtpMail};