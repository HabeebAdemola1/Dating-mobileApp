import express from "express"
import mongoose from "mongoose"
import User from "../../models/user/auth.Schema.js"
import Dating from "../../models/dating/datingSchema.js"
import cloudinary from "cloudinary"
import {verifyToken} from "../../middlewares/verifyToken.js"
import multer from "multer"
import LetMeet from "../../models/letsMeet/letMeetSchema.js"
import LetsMeet from "../../models/letsMeet/letMeetSchema.js"
import LetsmeetConversation from "../../models/letsMeet/letmeetConversation.js"

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



///people that admired me but havent accepted them
letsMeetRoute.get('/getmyadmirers', verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'user not found' });
    }
    const dating = await LetMeet.findOne({ userId });
    if (!dating) {
      return res.status(404).json({ status: false, message: 'dating profile not found' });
    }
    const admirersDating = await LetMeet.find({ pendingInvitations: userId }).populate(
      'userId',
      'fullname email age maritalStatus gender stateOfOrigin interest1 interest2 occupation nationality picture phoneNumber'
    );
    const admirers = admirersDating.map((admired) => ({
      id: admired.userId._id.toString(),
      fullname: admired.userId.fullname,
      age: admired.userId.age,
      gender: admired.userId.gender,
      nationality: admired.userId.nationality,
      stateOfOrigin: admired.userId.stateOfOrigin,
      maritalStatus: admired.userId.maritalStatus,
      occupation: admired.userId.occupation,
      interest1: admired.userId.interest1,
      interest2: admired.userId.interest2,
      email: admired.userId.email,
      picture: admired.userId.picture,
      phoneNumber: admired.userId.phoneNumber,
    }));
    return res.status(200).json({
      status: true,
      message: 'these are your pending invitations',
      data: { admirerCount: admirers.length, admirers },
    });
  } catch (error) {
    console.error('Get my admirers error:', error);
    return res.status(500).json({ status: false, message: 'an error occurred', error: error.message });
  }
});



// Get users who admired me but I haven't accepted
letsMeetRoute.get('/getmyadmirers', verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }
    const dating = await LetsMeet.findOne({ userId });
    if (!dating) {
      return res.status(404).json({ status: false, message: 'Dating profile not found' });
    }
    const admirersDating = await LetsMeet.find({ pendingInvitations: userId }).populate(
      'userId',
      'fullname email age maritalStatus gender stateOfOrigin interest1 interest2 occupation nationality picture phoneNumber'
    );
    const admirers = admirersDating.map((admired) => ({
      id: admired.userId._id.toString(),
      fullname: admired.userId.fullname,
      age: admired.userId.age,
      gender: admired.userId.gender,
      nationality: admired.userId.nationality,
      stateOfOrigin: admired.userId.stateOfOrigin,
      maritalStatus: admired.userId.maritalStatus,
      occupation: admired.userId.occupation,
      interest1: admired.userId.interest1,
      interest2: admired.userId.interest2,
      email: admired.userId.email,
      picture: admired.userId.picture,
      phoneNumber: admired.userId.phoneNumber,
    }));
    return res.status(200).json({
      status: true,
      message: 'These are your pending invitations',
      data: { admirerCount: admirers.length, admirers },
    });
  } catch (error) {
    console.error('Get my admirers error:', error);
    return res.status(500).json({ status: false, message: 'An error occurred', error: error.message });
  }
});

// Get users I admired but who haven't accepted me
letsMeetRoute.get('/getotheradmirer', verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User account not found' });
    }
    const dating = await LetsMeet.findOne({ userId }).populate({
      path: 'admirerList',
      select: 'fullname age gender nationality stateOfOrigin occupation maritalStatus email picture interest1 interest2 phoneNumber',
      match: { acceptedInvitations: { $ne: userId } }, // Exclude accepted users
    });
    if (!dating) {
      return res.status(404).json({ status: false, message: 'Dating profile does not exist' });
    }
    const admirers = dating.admirerList.map((admirer) => ({
      id: admirer._id.toString(),
      fullname: admirer.fullname,
      age: admirer.age,
      gender: admirer.gender,
      nationality: admirer.nationality,
      stateOfOrigin: admirer.stateOfOrigin,
      maritalStatus: admirer.maritalStatus,
      occupation: admirer.occupation,
      email: admirer.email,
      picture: admirer.picture,
      interest1: admirer.interest1,
      interest2: admirer.interest2,
      phoneNumber: admirer.phoneNumber,
    }));
    return res.status(200).json({
      status: true,
      message: 'Sent invitations retrieved successfully',
      data: { admirersCount: admirers.length, admirers },
    });
  } catch (error) {
    console.error('Get other admirers error:', error);
    return res.status(500).json({ status: false, message: 'An error occurred', error: error.message });
  }
});

// Send invitation to another user
letsMeetRoute.post('/invite', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { recipientId } = req.body; // Renamed for clarity
  try {
    const sender = await User.findById(userId);
    const recipient = await User.findById(recipientId);
    if (!sender || !recipient) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }
    const senderDating = await LetMeet.findOne({ userId });
    const recipientDating = await LetMeet.findOne({ userId: recipientId });
    if (!senderDating || !recipientDating) {
      return res.status(404).json({ status: false, message: 'Dating profile not found or updated' });
    }
    if (recipientDating.pendingInvitations.includes(userId)) {
      return res.status(400).json({ status: false, message: 'Invitation already sent' });
    }
    recipientDating.pendingInvitations.push(userId);
    recipientDating.admirers = (recipientDating.admirers || 0) + 1;
    await recipientDating.save();
    if (!senderDating.admirerList.includes(recipientId)) {
      senderDating.admirerList.push(recipientId);
      await senderDating.save();
    }
    return res.status(200).json({
      status: true,
      message: 'Invitation sent successfully',
    });
  } catch (error) {
    console.error('Invite error:', error);
    return res.status(500).json({ status: false, message: 'Server error', error: error.message });
  }
});

// Respond to an invitation (accept/reject)
letsMeetRoute.post('/respond', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { senderProfileId, action } = req.body;
  try {
    if (!senderProfileId || !['accept', 'reject'].includes(action)) {
      return res.status(400).json({ status: false, message: 'Invalid request' });
    }
    const recipient = await User.findById(userId);
    const sender = await User.findById(senderProfileId);
    if (!recipient || !sender) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }
    const recipientDating = await LetsMeet.findOne({ userId });
    const senderDating = await LetsMeet.findOne({ userId: senderProfileId });
    if (!recipientDating || !senderDating) {
      return res.status(404).json({ status: false, message: 'Dating profile not found' });
    }
    if (!recipientDating.pendingInvitations.includes(senderProfileId)) {
      return res.status(400).json({ status: false, message: 'No pending invitation from this user' });
    }
    recipientDating.pendingInvitations = recipientDating.pendingInvitations.filter(
      (id) => id.toString() !== senderProfileId
    );
    recipientDating.admirers = Math.max(0, (recipientDating.admirers || 0) - 1);
    if (action === 'accept') {
      recipientDating.acceptedInvitations.push(senderProfileId);
      senderDating.acceptedInvitations.push(userId);
      const conversation = new LetsmeetConversation({
        participants: [new mongoose.Types.ObjectId(userId), new mongoose.Types.ObjectId(senderProfileId)],
        messages: [],
      });
      await conversation.save();
      // Add to chatList for both users
      recipientDating.chatList.push({ user: senderProfileId, conversationId: conversation._id });
      senderDating.chatList.push({ user: userId, conversationId: conversation._id });
    }
    await recipientDating.save();
    await senderDating.save();
    return res.status(200).json({
      status: true,
      message: `Invitation ${action}ed successfully`,
    });
  } catch (error) {
    console.error('Respond error:', error);
    return res.status(500).json({ status: false, message: 'Server error', error: error.message });
  }
});

// Get accepted invitations
letsMeetRoute.get('/getaccepted', verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User account not found' });
    }
    const dating = await LetMeet.findOne({ userId }).populate(
      'acceptedInvitations',
      'fullname age gender nationality stateOfOrigin occupation maritalStatus email picture interest1 interest2 phoneNumber'
    );
    if (!dating) {
      return res.status(404).json({ status: false, message: 'Dating profile not found' });
    }
    const accepted = dating.acceptedInvitations.map((user) => ({
      id: user._id.toString(),
      fullname: user.fullname,
      age: user.age,
      gender: user.gender,
      nationality: user.nationality,
      stateOfOrigin: user.stateOfOrigin,
      maritalStatus: user.maritalStatus,
      occupation: user.occupation,
      email: user.email,
      picture: user.picture,
      interest1: user.interest1,
      interest2: user.interest2,
      phoneNumber: user.phoneNumber,
    }));
    return res.status(200).json({
      status: true,
      message: 'Successful',
      data: { acceptedCount: accepted.length, accepted },
    });
  } catch (error) {
    console.error('Get accepted error:', error);
    return res.status(500).json({ status: false, message: 'An error occurred', error: error.message });
  }
});

// Track and get profiles viewed by the user
letsMeetRoute.get('/getviewedprofiles', verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }
    const dating = await LetsMeet.findOne({ userId }).populate(
      'viewedProfiles',
      'fullname age gender nationality stateOfOrigin occupation maritalStatus email picture interest1 interest2 phoneNumber'
    );
    if (!dating) {
      return res.status(404).json({ status: false, message: 'Dating profile not found' });
    }
    const viewed = dating.viewedProfiles.map((profile) => ({
      id: profile._id.toString(),
      fullname: profile.fullname,
      age: profile.age,
      gender: profile.gender,
      nationality: profile.nationality,
      stateOfOrigin: profile.stateOfOrigin,
      maritalStatus: profile.maritalStatus,
      occupation: profile.occupation,
      email: profile.email,
      picture: profile.picture,
      interest1: profile.interest1,
      interest2: profile.interest2,
      phoneNumber: profile.phoneNumber,
    }));
    return res.status(200).json({
      status: true,
      message: 'Viewed profiles retrieved successfully',
      data: { viewedCount: viewed.length, viewed },
    });
  } catch (error) {
    console.error('Get viewed profiles error:', error);
    return res.status(500).json({ status: false, message: 'An error occurred', error: error.message });
  }
});

// Track profile view
letsMeetRoute.post('/viewprofile', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { viewedUserId } = req.body;
  try {
    const user = await User.findById(userId);
    const viewedUser = await User.findById(viewedUserId);
    if (!user || !viewedUser) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }
    const viewerDating = await LetsMeet.findOne({ userId });
    const viewedDating = await LetsMeet.findOne({ userId: viewedUserId });
    if (!viewerDating || !viewedDating) {
      return res.status(404).json({ status: false, message: 'Dating profile not found' });
    }
    if (!viewerDating.viewedProfiles) {
      viewerDating.viewedProfiles = [];
    }
    if (!viewedDating.viewedBy) {
      viewedDating.viewedBy = [];
    }
    if (!viewerDating.viewedProfiles.includes(viewedUserId)) {
      viewerDating.viewedProfiles.push(viewedUserId);
      await viewerDating.save();
    }
    if (!viewedDating.viewedBy.includes(userId)) {
      viewedDating.viewedBy.push(userId);
      await viewedDating.save();
    }
    return res.status(200).json({
      status: true,
      message: 'Profile view recorded successfully',
    });
  } catch (error) {
    console.error('View profile error:', error);
    return res.status(500).json({ status: false, message: 'Server error', error: error.message });
  }
});

// Get users who viewed my profile
letsMeetRoute.get('/getviewers', verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }
    const dating = await LetsMeet.findOne({ userId }).populate(
      'viewedBy',
      'fullname age gender nationality stateOfOrigin occupation maritalStatus email picture interest1 interest2 phoneNumber'
    );
    if (!dating) {
      return res.status(404).json({ status: false, message: 'Dating profile not found' });
    }
    const viewers = dating.viewedBy.map((viewer) => ({
      id: viewer._id.toString(),
      fullname: viewer.fullname,
      age: viewer.age,
      gender: viewer.gender,
      nationality: viewer.nationality,
      stateOfOrigin: viewer.stateOfOrigin,
      maritalStatus: viewer.maritalStatus,
      occupation: viewer.occupation,
      email: viewer.email,
      picture: viewer.picture,
      interest1: viewer.interest1,
      interest2: viewer.interest2,
      phoneNumber: viewer.phoneNumber,
    }));
    return res.status(200).json({
      status: true,
      message: 'Viewers retrieved successfully',
      data: { viewerCount: viewers.length, viewers },
    });
  } catch (error) {
    console.error('Get viewers error:', error);
    return res.status(500).json({ status: false, message: 'An error occurred', error: error.message });
  }
});

// Send a compliment
letsMeetRoute.post('/sendcompliment', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { recipientId, message } = req.body;
  try {
    if (!recipientId || !message || message.trim().length === 0) {
      return res.status(400).json({ status: false, message: 'Invalid request: recipientId and message are required' });
    }
    const sender = await User.findById(userId);
    const recipient = await User.findById(recipientId);
    if (!sender || !recipient) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }
    const recipientDating = await LetsMeet.findOne({ userId: recipientId });
    if (!recipientDating) {
      return res.status(404).json({ status: false, message: 'Recipient dating profile not found' });
    }
    if (!recipientDating.compliments) {
      recipientDating.compliments = [];
    }
    recipientDating.compliments.push({
      senderId: userId,
      message,
      createdAt: new Date(),
    });
    await recipientDating.save();
    return res.status(200).json({
      status: true,
      message: 'Compliment sent successfully',
    });
  } catch (error) {
    console.error('Send compliment error:', error);
    return res.status(500).json({ status: false, message: 'Server error', error: error.message });
  }
});

// Get received compliments
letsMeetRoute.get('/getcompliments', verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }
    const dating = await LetsMeet.findOne({ userId }).populate('compliments.senderId', 'fullname picture');
    if (!dating) {
      return res.status(404).json({ status: false, message: 'Dating profile not found' });
    }
    const compliments = dating.compliments.map((compliment) => ({
      senderId: compliment.senderId._id.toString(),
      senderName: compliment.senderId.fullname,
      senderPicture: compliment.senderId.picture,
      message: compliment.message,
      createdAt: compliment.createdAt,
    }));
    return res.status(200).json({
      status: true,
      message: 'Compliments retrieved successfully',
      data: { complimentCount: compliments.length, compliments },
    });
  } catch (error) {
    console.error('Get compliments error:', error);
    return res.status(500).json({ status: false, message: 'An error occurred', error: error.message });
  }
});

// Unmatch a user
letsMeetRoute.post('/unmatch', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { matchedUserId } = req.body;
  try {
    const user = await User.findById(userId);
    const matchedUser = await User.findById(matchedUserId);
    if (!user || !matchedUser) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }
    const userDating = await LetsMeet.findOne({ userId });
    const matchedDating = await LetsMeet.findOne({ userId: matchedUserId });
    if (!userDating || !matchedDating) {
      return res.status(404).json({ status: false, message: 'Dating profile not found' });
    }
    if (!userDating.acceptedInvitations.includes(matchedUserId) || !matchedDating.acceptedInvitations.includes(userId)) {
      return res.status(400).json({ status: false, message: 'No match exists with this user' });
    }
    // Remove from acceptedInvitations
    userDating.acceptedInvitations = userDating.acceptedInvitations.filter(
      (id) => id.toString() !== matchedUserId
    );
    matchedDating.acceptedInvitations = matchedDating.acceptedInvitations.filter(
      (id) => id.toString() !== userId
    );
    // Find and delete conversation
    const conversation = await LetsmeetConversation.findOne({
      participants: { $all: [userId, matchedUserId] },
    });
    if (conversation) {
      await LetsmeetConversation.deleteOne({ _id: conversation._id });
      // Remove from chatList
      userDating.chatList = userDating.chatList.filter(
        (chat) => chat.conversationId.toString() !== conversation._id.toString()
      );
      matchedDating.chatList = matchedDating.chatList.filter(
        (chat) => chat.conversationId.toString() !== conversation._id.toString()
      );
    }
    await userDating.save();
    await matchedDating.save();
    return res.status(200).json({
      status: true,
      message: 'Unmatched successfully',
    });
  } catch (error) {
    console.error('Unmatch error:', error);
    return res.status(500).json({ status: false, message: 'Server error', error: error.message });
  }
});




// REST endpoint to send a message (for non-real-time fallback or initial testing)
letsMeetRoute.post('/sendmessage', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { conversationId, content } = req.body;
  try {
    if (!conversationId || !content || content.trim().length === 0) {
      return res.status(400).json({ status: false, message: 'Invalid request: conversationId and content are required' });
    }
    const conversation = await LetsmeetConversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ status: false, message: 'Conversation not found' });
    }
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ status: false, message: 'Unauthorized to send message' });
    }
    const message = {
      senderId: userId,
      content,
      createdAt: new Date(),
    };
    conversation.messages.push(message);
    await conversation.save();
    // Emit message via Socket.IO for real-time update
    io.to(conversationId).emit('receiveMessage', {
      conversationId,
      message: {
        senderId: userId,
        content,
        createdAt: message.createdAt,
      },
    });
    return res.status(200).json({
      status: true,
      message: 'Message sent successfully',
      data: message,
    });
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({ status: false, message: 'Server error', error: error.message });
  }
});

// REST endpoint to get conversation history
letsMeetRoute.get('/getconversation/:conversationId', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { conversationId } = req.params;
  try {
    const conversation = await LetsmeetConversation.findById(conversationId).populate(
      'messages.senderId',
      'fullname picture'
    );
    if (!conversation) {
      return res.status(404).json({ status: false, message: 'Conversation not found' });
    }
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ status: false, message: 'Unauthorized access to conversation' });
    }
    const messages = conversation.messages.map((msg) => ({
      senderId: msg.senderId._id.toString(),
      senderName: msg.senderId.fullname,
      senderPicture: msg.senderId.picture,
      content: msg.content,
      createdAt: msg.createdAt,
    }));
    return res.status(200).json({
      status: true,
      message: 'Conversation retrieved successfully',
      data: {
        conversationId,
        participants: conversation.participants,
        messages,
      },
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    return res.status(500).json({ status: false, message: 'Server error', error: error.message });
  }
});

// REST endpoint to get user's chat list
letsMeetRoute.get('/getchatlist', verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }
    const dating = await LetsMeet.findOne({ userId }).populate(
      'chatList.user',
      'fullname picture'
    );
    if (!dating) {
      return res.status(404).json({ status: false, message: 'Dating profile not found' });
    }
    const chatList = dating.chatList.map((chat) => ({
      userId: chat.user._id.toString(),
      fullname: chat.user.fullname,
      picture: chat.user.picture,
      conversationId: chat.conversationId.toString(),
    }));
    return res.status(200).json({
      status: true,
      message: 'Chat list retrieved successfully',
      data: {
        chatCount: chatList.length,
        chatList,
      },
    });
  } catch (error) {
    console.error('Get chat list error:', error);
    return res.status(500).json({ status: false, message: 'Server error', error: error.message });
  }
});









export default  letsMeetRoute
















  



















































