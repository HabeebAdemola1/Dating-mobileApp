import express from "express"
import mongoose from "mongoose"
import User from "../../models/user/auth.Schema.js"
import Dating from "../../models/dating/datingSchema.js"
import cloudinary from "cloudinary"
import {verifyToken} from "../../middlewares/verifyToken.js"
import multer from "multer"
import LetMeet from "../../models/letsMeet/letMeetSchema.js"


const letsMeetRoute = express.Router()



cloudinary.config({
    cloud_name: "dc0poqt9l",
    api_key: "624216876378923",
    api_secret: "rEb4aQiEt5my3nIp8PZ38J9X4vU",
  })
  
  
    
    
    const storage = multer.memoryStorage(); 
    const upload = multer({
      storage,
      limits: { fileSize: 5 * 1024 * 1024 },
    }).array("pictures", 5); 
    







    letsMeetRoute.post("/createletsmeet", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { height, faith, smoke, drink, personality, education, career, ethnicity, pictures } = req.body;

  try {
    const user = await User.findOne({ _id: userId });
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    const dating = await Dating.findOne({ userId: user._id });
    if (!dating) return res.status(404).json({ status: false, message: "Profile details not found" });

    if (
      !user.age ||
      !user.occupation ||
      !user.gender ||
      !user.maritalStatus ||
      !user.interest1 ||
      !user.interest2 ||
      !user.nationality
    ) {
      return res.status(400).json({
        status: false,
        message: "Please complete your user profile before updating dating profile",
      });
    }

    if (!dating.genotype || !dating.religion || !dating.bloodGroup) {
      return res.status(400).json({
        status: false,
        message: "Please complete your medical profile for genotype, blood group, and religion",
      });
    }

    let pictureUrls = [];
    if (pictures && Array.isArray(pictures) && pictures.length > 0) {
      if (pictures.length > 5) {
        return res.status(400).json({
          status: false,
          message: "Maximum of 5 pictures allowed",
        });
      }

      const uploadPromises = pictures.map(
        (base64String) =>
          new Promise((resolve, reject) => {
            if (!base64String.startsWith("data:image/")) {
              return reject(new Error("Invalid image format"));
            }
            cloudinary.v2.uploader.upload(
              base64String,
              { resource_type: "image" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
              }
            );
          })
      );
      pictureUrls = await Promise.all(uploadPromises);
    }

    if (!height || !faith || !smoke || !drink || !personality || !education || !career || !ethnicity) {
      return res.status(400).json({ status: false, message: "All required fields must be filled" });
    }

    const letmeetUser = new LetMeet({
      userId: req.user.id,
      datingId: user._id,
      height,
      faith,
      smoke,
      drink,
      personality,
      education,
      career,
      ethnicity,
      pictures: pictureUrls,
    });

    await letmeetUser.save();
    return res.status(201).json({ status: true, message: "Successfully created", data: letmeetUser });
  } catch (error) {
    console.error("Error creating LetMeet profile:", error);
    return res.status(500).json({
      status: false,
      message: "Server error occurred",
      error: error.message,
    });
  }
});



letsMeetRoute.get("/getletsmeet", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
  
    const user = await User.findOne({ _id: userId });
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

  
    if (
      !user.age ||
      !user.occupation ||
      !user.gender ||
      !user.maritalStatus ||
      !user.interest1 ||
      !user.interest2 ||
      !user.nationality
    ) {
      return res.status(400).json({
        status: false,
        message: "Please complete your user profile before accessing LetMeet users",
      });
    }

    const dating = await Dating.findOne({ userId: user._id });
    if (!dating) return res.status(404).json({ status: false, message: "Dating profile not found" });

    if (!dating.genotype || !dating.religion || !dating.bloodGroup) {
      return res.status(400).json({
        status: false,
        message: "Please complete your medical profile for genotype, blood group, and religion",
      });
    }

    const letmeetUsers = await LetMeet.find({ userId: { $ne: userId }, datingId: { $ne: userId} })
    .populate("userId", "fullname age gender nationality phoneNumber maritalStatus interest1 interest2 stateOfOrigin currentLocation")
    .populate("datingId", "religion genotype bloodgroup");
    return res.status(200).json({
      status: true,
      message: "Successfully retrieved LetMeet users",
      data: letmeetUsers,
    });
  } catch (error) {
    console.error("Error retrieving LetMeet users:", error);
    return res.status(500).json({
      status: false,
      message: "Server error occurred",
      error: error.message,
    });
  }
});



letsMeetRoute.get('/check-profile', verifyToken, async (req, res) => {
  try {
    const profile = await LetMeet.findOne({ userId: req.user.id });
    if (profile) {
      return res.json({ status: true, hasProfile: true });
    }
    return res.json({ status: true, hasProfile: false });
  } catch (error) {
    console.error('Check profile error:', error);
    res.status(500).json({ status: false, message: 'Server error' });
  }
});
export default  letsMeetRoute
















  
