import express from "express"

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
          .json({ status: false, message: "Invalid email or password" });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ status: false, message: "Invalid email or password" });
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
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: false, error: "an error occurred" });
    }
  });
  
  authRouter.get("/dashboard", verifyToken, async (req, res) => {
    try {
      const user = await Auth.findById(req.user.id).select(
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

export default authRouter;