import express from "express"
import mongoose from "mongoose"
import User from "../../models/user/auth.Schema.js"
import Dating from "../../models/dating/datingSchema.js"
import cloudinary from "cloudinary"
import {verifyToken} from "../../middlewares/verifyToken.js"
import multer from "multer"
import Conversation from "../../models/dating/conversationSchema.js"

const datingRouter = express.Router()



cloudinary.config({
    cloud_name: "dc0poqt9l",
    api_key: "624216876378923",
    api_secret: "rEb4aQiEt5my3nIp8PZ38J9X4vU",
  })
  
  
  
  
  const storage = multer.memoryStorage(); 
  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
  }).array("pictures", 15); 
  

datingRouter.post("/createdating", verifyToken, async(req, res) => {
    const userId = req.user.id

    const {genotype, religion, bio, bloodGroup, pictures} = req.body

    try {
        const user = await User.findOne({_id: userId})
        if(!user)return res.status(404).json({message: "user not found"})

        let pictureUrls = []
        if (pictures && Array.isArray(pictures) && pictures.length > 0) {
            if (pictures.length > 15) {
              return res.status(400).json({
                status: false,
                message: "Maximum of 15 pictures allowed"
              });
            }

            const uploadPromises = pictures.map(base64String =>
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
        
        if(!genotype || !religion || !bloodGroup ){
            return res.status(400).json({message:"all required fields are meant to be filled"})
        }

        const datingUser = new Dating({
            userId: req.user.id,
            genotype,
            religion,
            bloodGroup,
            bio,
            pictures: pictureUrls
        })

        await datingUser.save()
        return res.status(201).json({status: false, message: "successfully created", data:datingUser})
    } catch (error) {
        console.error("Error creating dating profile:", error);
        return res.status(500).json({
          status: false,
          message: "Server error occurred",
          error: error.message
        });
    }
})


datingRouter.get("/getdating", verifyToken, async(req, res) => {
  const profileId = req.user.id;

  try {
    const profile = await User.findOne({_id: profileId})
    if(!profile){
      return res.status(400).json({
        message:"user not found"
      })
    }

    const dating = await Dating.findOne({userId: profile._id}).populate("userId", "fullname email age maritalStatus gender stateOfOrigin interest1 interest2 occupation nationality")
    if(!dating){
      return res.status(404).json({
        message:"dating profile not found",
        status: false
      })
    }


    return res.status(200).json({
      message: "successfully fetched",
      data: dating
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({status: false, message: "an error occurred"})
  }
})



datingRouter.put("/updatedating", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { genotype, religion, bio, bloodGroup, pictures } = req.body;
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    let pictureUrls = [];
    if (pictures && Array.isArray(pictures) && pictures.length > 0) {
      if (pictures.length > 15) {
        return res.status(400).json({
          status: false,
          message: "Maximum of 15 pictures allowed",
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
    const updates = { genotype, religion, bio, bloodGroup };
    if (pictureUrls.length > 0) {
      updates.pictures = pictureUrls;
    }
    const dating = await Dating.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!dating) {
      return res.status(404).json({ message: "Dating profile not found" });
    }
    res.status(200).json({ status: true, message: "Dating profile updated successfully", data: dating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error", error: error.message });
  }
});


datingRouter.get("/getdatingusers", verifyToken, async(req, res) => {
  const userId = req.user.id
  try {
    const user = await User.findOne({_id:userId})
    if(!user){
      return res.status(404).json({
        message: "user account not found",
        status: false
      })
    }


    const dating = await Dating.findOne({userId: user._id})
    const admirer = dating ? dating.admirerList : []

    const datingProfile = await Dating.find({userId: { $ne: user._id}})
    .populate("userId", "fullname age gender nationality email phoneNumber picture occupation stateOfOrigin currentLocation maritalStatus interest1 interest2") 
    .select("-admirerList -pendingInvitations -acceptedInvitations -chatList"); 



    if(!datingProfile){
      return res.status(404).json({
        message: "the dating profile is not found",
     
      })
    }

    return res.status(200).json({
      message: "successful",
      data: datingProfile
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: "an error occurred",
      status: false
    })
  }
})


datingRouter.post('/admire/:id', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const id = req.params.id;

  try {
    // Validate inputs
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        status: false,
        message: 'Invalid authenticated user',
      });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid profile ID',
      });
    }

    // Prevent self-admiration
    if (id === userId) {
      return res.status(400).json({
        status: false,
        message: 'You cannot admire your own profile',
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User account not found',
      });
    }

    // Atomically update dating profile
    const datingProfile = await Dating.findOneAndUpdate(
      {
        _id: id,
        admirerList: { $nin: [userId] }, 
      },
      {
        $inc: { admirers: 1 },
        $push: { admirerList: userId },
      },
      { new: true, runValidators: true }
    );

    if (!datingProfile) {
      const profileExists = await Dating.findById(id);
      if (!profileExists) {
        return res.status(404).json({
          status: false,
          message: 'Dating profile not found',
        });
      }
      return res.status(400).json({
        status: false,
        message: 'You have already admired this profile',
      });
    }

    return res.status(200).json({
      status: true,
      message: 'Profile successfully admired',
      data: { admirers: datingProfile.admirers },
    });
  } catch (error) {
    console.error('Error admiring profile:', error.message, error.stack);
    return res.status(500).json({
      status: false,
      message: 'An error occurred while admiring the profile',
    });
  }
});

///people that admired me but havent accepted them
datingRouter.get('/getmyadmirers', verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'user not found' });
    }
    const dating = await Dating.findOne({ userId });
    if (!dating) {
      return res.status(404).json({ status: false, message: 'dating profile not found' });
    }
    const admirersDating = await Dating.find({ pendingInvitations: userId }).populate(
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



///people i admired but havent accepted me
datingRouter.get('/getotheradmirer', verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'user account not found' });
    }
    const dating = await Dating.findOne({ userId }).populate(
      'admirerList',
      'fullname age gender nationality stateOfOrigin occupation maritalStatus email picture interest1 interest2 phoneNumber'
    );
    if (!dating) {
      return res.status(404).json({ status: false, message: 'dating profile does not exist' });
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
      message: 'sent invitations retrieved successfully',
      data: { admirersCount: admirers.length, admirers },
    });
  } catch (error) {
    console.error('Get other admirers error:', error);
    return res.status(500).json({ status: false, message: 'an error occurred', error: error.message });
  }
});



datingRouter.post('/invite', verifyToken, async (req, res) => {
  const userId = req.user.id; // Sender
  const { senderId } = req.body; // Recipient (should be recipientId)

  try {
    const sender = await User.findById(userId);
    const recipient = await User.findById(senderId);
    if (!sender || !recipient) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const senderDating = await Dating.findOne({ userId });
    const recipientDating = await Dating.findOne({ userId: senderId });
    if (!senderDating || !recipientDating) {
      return res.status(404).json({ status: false, message: 'Dating profile not found' });
    }

    if (recipientDating.pendingInvitations.includes(userId)) {
      return res.status(400).json({ status: false, message: 'Invitation already sent' });
    }

    recipientDating.pendingInvitations.push(userId);
    recipientDating.admirers = (recipientDating.admirers || 0) + 1;
    await recipientDating.save();

    if (!senderDating.admirerList.includes(senderId)) {
      senderDating.admirerList.push(senderId);
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


datingRouter.post('/respond', verifyToken, async (req, res) => {
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

    const recipientDating = await Dating.findOne({ userId });
    const senderDating = await Dating.findOne({ userId: senderProfileId });
    if (!recipientDating || !senderDating) {
      return res.status(404).json({ status: false, message: 'Dating profile not found' });
    }

    if (!recipientDating.pendingInvitations.includes(senderProfileId)) {
      return res.status(400).json({ status: false, message: 'No pending invitation from this user' });
    }

    recipientDating.pendingInvitations = recipientDating.pendingInvitations.filter(
      id => id.toString() !== senderProfileId
    );
    recipientDating.admirers = Math.max(0, (recipientDating.admirers || 0) - 1);

    if (action === 'accept') {
      recipientDating.acceptedInvitations.push(senderProfileId);
      senderDating.acceptedInvitations.push(userId);

      const conversation = new Conversation({
        participants: [
          new mongoose.Types.ObjectId(userId),
          new mongoose.Types.ObjectId(senderProfileId)
        ],
        messages: []
      });
      await conversation.save();
    }

    await recipientDating.save();
    await senderDating.save();

    return res.status(200).json({
      status: true,
      message: `Invitation ${action}ed successfully`
    });
  } catch (error) {
    console.error('Respond error:', error);
    return res.status(500).json({ status: false, message: 'Server error', error: error.message });
  }
});


//people that have accepted and they have become my friends
datingRouter.get('/myfriends', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const dating = await Dating.findOne({ userId });
    if (!dating) {
      return res.status(404).json({ status: false, message: 'Dating profile not found, please update your dating profile' });
    }

    // Log acceptedInvitations
    console.log('Accepted Invitations:', dating.acceptedInvitations);

    // Fetch User data
    const acceptedFriends = await User.find({
      _id: { $in: dating.acceptedInvitations }
    }).select('fullname email age gender nationality stateOfOrigin occupation maritalStatus picture interest1 interest2 phoneNumber currentLocation');

    console.log('Accepted Friends:', acceptedFriends.map(f => f._id.toString()));

    // Fetch Dating profiles
    const datingProfiles = await Dating.find({
      userId: { $in: dating.acceptedInvitations }
    }).select('religion genotype bio bloodGroup pictures admirers');



    // Combine data
    const formattedFriends = acceptedFriends.map(friend => {
      const datingData = datingProfiles.find(profile => 
        profile?.userId && friend?._id && profile.userId.toString() === friend._id.toString()
      );
      if (!datingData) {
        console.log(`No Dating profile for friend: ${friend._id.toString()}`);
      }
      return {
        id: friend._id.toString(),
        fullname: friend.fullname,
        email: friend.email,
        age: friend.age,
        picture:friend.picture,
        religion: datingData?.religion || null,
        maritalStatus: friend.maritalStatus,
        occupation: friend.occupation,
        stateOfOrigin: friend.stateOfOrigin,
        phoneNumber: friend.phoneNumber,
        currentLocation: friend.currentLocation,
        interest1: friend.interest1,
        interest2: friend.interest2,
        genotype: datingData?.genotype || null,
        bloodGroup: datingData?.bloodGroup || null,
        pictures: datingData?.pictures || [],
        bio: datingData?.bio || null,
        admirersCount: datingData?.admirers?.length || 0
      };
    });

    console.log('Formatted Friends:', formattedFriends);

    return res.status(200).json({
      status: true,
      message: 'These are your friends',
      data: {
        friendsCount: formattedFriends.length,
        friends: formattedFriends
      }
    });
  } catch (error) {
    console.error('Get friends error:', error);
    return res.status(500).json({ status: false, message: 'An error occurred', error: error.message });
  }
});


 datingRouter.get("/getaccepted", verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "user account not found", status: false });
    }
    const dating = await Dating.findOne({ userId: user._id }).populate(
      "acceptedInvitations",
      "fullname age gender nationality email phone"
    );
    if (!dating) {
      return res.status(404).json({ message: "dating profile not found", status: false });
    }
    const accepted = dating.acceptedInvitations.map((user) => ({
      id: user._id,
      fullname: user.fullname,
      age: user.age,
      gender: user.gender,
      nationality: user.nationality,
      email: user.email,
      phone: user.phone,
    }));
    return res.status(200).json({
      message: "successful",
      data: { acceptedCount: accepted.length, accepted },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "an error occurred", status: false });
  }
});






datingRouter.post("/mychatlist", verifyToken, async( req, res) => {
  const userId = req.user.id

  try {
    const user = await User.findOne({_id: userId})
    if(!user){
      return res.status(400).json({
        message: "user account not found"
      })
    }

    const dating = await Dating.find({userId: user._id})
      .populate("chatList.user", "fullname age gender nationality occupation maritalStatus religion picture")
      .populate("chatList.conversationId", " message.content message.sender message.read")

    if(!dating){
      return res.status(400).json({
        message: "dating profile not found",
        status: false
      })
    }

   const chatList = dating.chatList.map((chat) => ({
      fullname : chat.user.fullname || "not found",
      age: chat.user.age  || "not registered",
      gender: chat.user.gender || "not registered",
      occupation:chat.user.occupation || "not registered",
      maritalStatus: chat.user.maritalStatus || "not registered",
      nationality: chat.user.nationality || "not registered",
      phoneNumber: chat.user.phoneNumber || "not registered",
      picture: chat.user.picture || "not registered",
      stateOfOrigin: chat.stateOfOrigin || "not registerd",
      email: chat.user.email || "not registered",

   }))

   return res.status(200).json({
    status: true,
    message: "successful",
    data: chatList
   })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: "an erro occurred with the service"
    })
  }
})

datingRouter.get("/invitation", verifyToken, async( req, res) => {
  const userId = req.user.id

  try {
    const user = await User.findOne({_id : userId})
    if(!user){
      return res.status(404).json({
        message: "user account not found",
        status: false
      })
    }

    const dating = await Dating.find({ userId: user._id})
      .populate({path:"acceptedInvitations.user", select: "fullname age gender occupation religion maritalStatus"})
      .populate({path:"pendingInvitations.user", select: "fullname age gender occupation religion maritalStatus"})
    if(!dating){
      return res.status(400).json({
        message: "dating profile not found"
      })
    }

    

    return res.status(200).json({
      message: "your requests are here",
      status: "true"
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: "an error occured with the server"
    })
  }
})






datingRouter.get('/conversations', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.find({
      participants: new mongoose.Types.ObjectId(userId),
    }).populate('participants', 'fullname picture').populate('messages.sender', 'fullname picture');
    return res.status(200).json({
      status: true,
      message: 'Conversations fetched successfully',
      data: { conversations },
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    return res.status(500).json({ status: false, message: 'An error occurred', error: error.message });
  }
});

// Get messages for a friend
datingRouter.get('/messages/:friendId', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;
    const conversation = await Conversation.findOne({
      participants: {
        $all: [
          new mongoose.Types.ObjectId(userId),
          new mongoose.Types.ObjectId(friendId),
        ],
      },
    }).populate('messages.sender', 'fullname');
    return res.status(200).json({
      status: true,
      message: 'Messages fetched successfully',
      data: { messages: conversation?.messages || [] },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return res.status(500).json({ status: false, message: 'An error occurred', error: error.message });
  }
});

// Send a message
datingRouter.post('/messages', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { receiverId, content } = req.body;
    if (!receiverId || !content) {
      return res.status(400).json({ status: false, message: 'Receiver ID and content are required' });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ status: false, message: 'Receiver not found' });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: {
        $all: [
          new mongoose.Types.ObjectId(userId),
          new mongoose.Types.ObjectId(receiverId),
        ],
      },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [
          new mongoose.Types.ObjectId(userId),
          new mongoose.Types.ObjectId(receiverId),
        ],
        messages: [],
      });
    }

    // Add message
    const message = {
      content,
      sender: new mongoose.Types.ObjectId(userId),
      read: false,
    };
    conversation.messages.push(message);
    await conversation.save();

    return res.status(200).json({
      status: true,
      message: 'Message sent successfully',
      data: { message },
    });
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({ status: false, message: 'An error occurred', error: error.message });
  }
});



datingRouter.get("/match/:id", verifyToken, async(req, res) => {
  const userId = req.user.id
  const id = req.params.id

  try {
    const user = await User.findOne({_id: userId})
    if(!user){
      return res.status(404).json({
        status: false,
        message: "user account not found"
      })
    }

    const datingA = await Dating.findOne({userId: user._id})
    if(!datingA){
      return res.status(404).json({
        message: "user A account is not found"
      })
    }

    const datingB = await Dating.findById(id)
    if(!datingB){
      return res.status(400).json({
        message: "user B dating account is not found"
      })
    }

    const datingBUser = await User.findOne({_id: datingB.userId})

    const interestA = User.interest1 || User.interest2
    const interestB = datingBUser.interest1 || datingBUser.interest2


    const matchInterests = interestA.filter((interest) => (
      interestB.includes(interest)
    ))

    const matchCount = matchInterests.length
    const totalPossibleMatches = Math.max(interestA.length, interestB.length)
    const percentageMatch = 20
    const matchPercentage = Math.min(
      matchCount * percentageMatch, 100
    )

    return res.status(200).json({
      message: "your match is available",
      status: true,
      data: {
        userB:{
          fullname: datingBUser.fullname,
          age: datingBUser.age,
        },
        userB:{
          fullname: User.fullname,
          age: User.age,
        },
        match:{
          percentage: matchPercentage,
          matchInterests: matchInterests
        }
        
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      messsage: "an error occurred with the server"
    })
  }
})




///conversation 



export default datingRouter