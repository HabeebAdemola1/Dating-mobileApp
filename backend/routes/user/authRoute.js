import express from "express"
import { v4 as uuidv4 } from 'uuid';
import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import cloudinary from "cloudinary"
import User from "../../models/user/auth.Schema.js"
import nodemailer from "nodemailer"
import dotenv from "dotenv"
import { verifyToken } from "../../middlewares/verifyToken.js"
import Auth from "../../models/user/auth.Schema.js"
import crypto from "crypto"
const authRouter = express.Router()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const transporter = nodemailer.createTransport(({
    service:'gmail',
    auth: {
        user:"pknseuxqxzkoqdjg",
        pass:"babatundeademola112@gmail.com"
      },
}));


const sendOTPEmail = async(email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify your email",
        text: `Your verification code is: ${otp}`,
    }
    try {
        const sentMail = await transporter.sendMail(mailOptions);
        console.log(sentMail);
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
};


authRouter.get("/me", verifyToken, async(req, res) => {
  try {
    return res.status(200).json({
      message:"your id is here",
      data:{userId: req.user.id}
    })
  } catch (error) {
    console.log(error)
  }
})



authRouter.get('/verify', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('fullname');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ status: true, user });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

authRouter.post("/signup", async (req, res) => {
    const { email, password,  phoneNumber, confirmPassword } =
      req.body;
  
    try {
      if (
        !email ||
        !password ||
        !phoneNumber ||
        !confirmPassword 
 
      ) {
        return res
          .status(400)
          .json({ status: false, message: "All fields are required" });
      }
  
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res
          .status(400)
          .json({ status: false, message: "Email already exists" });
      }
  
      if (confirmPassword !== password) {
        return res
          .status(400)
          .json({
            status: false,
            message: "Confirm password does not match password",
          });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
      const uniqueNumber = `RL-${crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase()}`;
      const verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
  
      const user = new Auth({
        email,
        phoneNumber,
     
        password: hashedPassword,
        verificationToken,
        verificationTokenExpiresAt,
        uniqueNumber,
      });
  
      await user.save();
    //   const response = await sendOTPEmail(user.email, verificationToken);
  
    //   if (!response) {
    //     console.log("email is not sent")
    //     return res
    //       .status(400)
    //       .json({ status: false, message: "email is not sent" });
    //   }
  
      return res.status(201).json({
        status: true,
        message: "Successfully registered",
        data: {
          email,
          phoneNumber,
          uniqueNumber,
          verificationToken,
          verificationTokenExpiresAt,
          uniqueNumber,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: false, error: error.message });
    }
  });
  
  authRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    try {
      if (!email || !password) {
        return res
          .status(400)
          .json({ status: false, message: "Email and password are required" });
      }
  
      const user = await Auth.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ status: false, message: "incorrect email" });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ status: false, message: "Invalid  password" });
      }
  
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );
  
      return res.status(200).json({
        status: true,
        message: "Login successful",
        token,
        user,
        userId:user._id
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: false, error: "an error occurred" });
    }
  });
  
  authRouter.get("/dashboard", verifyToken, async (req, res) => {
    const userId = req.user.id
    try {
      const user = await Auth.findById({_id: req.user.id}).select(
        "-password -verificationToken"
      );
      if (!user) {
        return res.status(404).json({ status: false, error: "User not found" });
      }
  
      return res
        .status(200)
        .json({ status: true, message: "Dashboard data retrieved", user });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: false, error: error.message });
    }
  });
  
  authRouter.post("/verify-email", async (req, res) => {
    const { email, code } = req.body;
  
    try {
      const user = await Auth.findOne({
        email,
        verificationToken: code,
        verificationTokenExpiresAt: { $gt: Date.now() },
      });
  
      if (!user) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Invalid or expired verification code",
          });
      }
  
      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpiresAt = undefined;
  
      await user.save();
  
      res.status(200).json({
        status: true,
        message: `Email (${user.email}) verified successfully`,
        data: { email: user.email, isVerified: user.isVerified },
      });
    } catch (error) {
      console.error("Error in verifyEmail: ", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });


  authRouter.put("/dashboard", verifyToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const updates = req.body;
  
      const user = await Auth.findOne({ _id: userId });
      if (!user) {
        return res.status(404).json({ message: "user not found" });
      }
  
      const profile = await Auth.findOneAndUpdate(
        { _id: userId },
        { $set: updates },
        { new: true, runValidators: true }
      );
  
      res.status(200).json({ message: "Profile updated successfully", profile });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  });


  authRouter.get("/getall", verifyToken, async(req, res) => {
    const userId = req.user.id

    try {
    

      const all = await User.find({})
      console.log(all)
      return res.status(200).json(all)
    } catch (error) {
      console.log(error)
      return res.status(500).json({
        message: "an error occurred"
      })
      
    }
  })



  authRouter.post('/forgot-passwrod', async(req, res) => {
    try {
      const {email} = req.body;
      const user = await User.findOne({email});

      if(!user){
        return res.status(404).json({message: 'user not found'})
      }


      const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: "7d"})

      user.resetPasswordToken = token;
      user.resetPasswordExpiresAt = Date.now() + 3600000
      await user.save()

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
      const mailOptions = {
          from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({message: "password reset email sent"})
      
    } catch (error) {
          res.status(500).json({ message: 'Server error', error: error.message });
    }
  })


  authRouter.post('/reset-password/:token', async(req, res) => {
    try {
      const {token} = req.params;
      const {password} = req.body;

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({
        _id: decoded.userId,
        resetPasswordToken: token,
        resetPasswordExpiresAt: { $gt: Date.now}
      })

      if(!user){
        return res.status(400).json({message: "invalid or expired token"})
      }


      user.password = await bcrypt.hash(password, 10)
      user.resetPasswordToken = undefined;
      user.resetPasswordExpiresAt = undefined;

      await user.save();

      res.status(200).json({message: 'password reset successful'})
    } catch (error) {
      res.status(500).json({message: 'server error', error:error.message})
    }
  })

export default authRouter;