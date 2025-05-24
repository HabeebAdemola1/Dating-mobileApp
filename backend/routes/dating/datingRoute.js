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
    .populate("userId", "fullname age gender nationality email phone") 
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

//get the people i have admired
datingRouter.get("/getmyadmirers", verifyToken, async(req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findOne({_id: userId})
    if(!user){
      return res.status(404).json({message: "user not found"})
    }


    const myUserId = user._id
    const dating = await Dating.find({userId: user._id})
    if(!dating){
      return res.status(404).json({
        message:"dating profile not found"
      })
    }

    const admirer = await Dating.find({
      admirerList: myUserId
    }).populate("userId", "fullname email age maritalStatus gender stateOfOrigin interest1 interest2 occupation nationality")

    if(admirer.length === 0){
      return res.status(400).json({
        message: "you have not been admired yet"
      })
    }

    const admirers = admirer.map(admired=> ({
      id: admired.userId._id,
      fullname: admired.userId.fullname,
      age: admired.userId.age,
      gender:admired.userId.gender,
      nationality:admired.userId.nationality,
      stateOfOrigin: admired.userId.stateOfOrigin,
      LGA: admired.userId.LGA,
      maritalStatus:admired.userId.maritalStatus,
      occupation:admired.userId.occupation

    }))


    return res.status(200).json({
      status: true,
      message: "these are your admirers",
      data: {
        admirerCount: admirers.length,
        admirers: admirers
      }
    })

    
  } catch (error) {
    console.log(error)
    return res.status(500).json({message: 'an error occured'})
  }

})





//get the people that admire me 
datingRouter.get("/getotheradmirer", verifyToken, async(req, res) => {
  const userId = req.user.id;

  try {
    const user= await User.findOne({_id: userId});
    if(myUserId){
      return res.status(404).json({
        message: "user account not found"
      })
    }

    const myUserId = myUserId._id;
    const dating = await Dating.find({userId: myUserId}).populate("admirerList", "fullname age gender nationality stateOfOrigin occupation maritalStatus")
    if(!dating){
      return res.status(404).json({
        status: false,
        message: "dating profile not exist"
      })
    }


    return res.status(200).json({
      status:true,
      message: "admirers retrievd successfully",
      data: {
        admirersCount: dating.admirerList.length,
        admirers: dating.admirerList

      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({message: "an error occurred"})
  }
})





datingRouter.post("/invite", verifyToken, async(req, res) => {
  const userId = req.user.id
  const senderId = req.body

  try {
    if(senderId || mongoose.ObjectId.Types.isValid(senderId)){
      return res.status(400).json({status: false, message: "id is nt a valid id number"})
    }


    const user = await User.findOne({_id: userId})
    if(!user){
      return res.status(404).json({
        message: "not found",
        status: false
      })
    }

    const myUserId = user._id

    const dating = await Dating.findOne({_id: userId})
    if(!dating){
      return res.status(404).json({
        status: false,
        message: "dating account not found"
      })
    }

    if(dating.userId.toString() === myUserId.toString()){
      return res.status(404).json({
          message: "you can send a friend request yourself"
      }
      )
    }

    if(dating.pendingInviatations.some((id) => id.equals(myUserId)) || (dating.acceptedInvitations.some((id) => id.equals(myUserId)))){
      return res.status(400).json({
        status: false,
        message: "you have sent a request to this profile or your request has been accepted by this user"
      })
    }

    return res.status(200).json({
      message: 'successful',
      status:true
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: false,
      message: "not available"
      
    })
  }
})



datingRouter.post("/respond", verifyToken, async(req, res) => {
  const userId = req.user.id
  const {senderProfileId, action} = req.body
   const io = req.app.get("io");

  try {
    if(!["accept", "reject"].includes(action)){
      return res.status(400).json({
        status: false,
        message: "action should be either accept or reject"
      })
    }
    
   const user = await User.findOne({_id: userId})
   if(!user){
    return res.status(404).json({message: "the user account not found", status: false})
   }

   const myUserId = user._id

   const dating = await Dating.findOne({userId: myUserId})
   if(!dating){
    return res.status(404).json({
      status: false,
      message: "dating profile not found"
    })
   }


   if(dating.acceptedInvitations.some((id) => id.equals(senderProfileId))){
    return res.status(400).json({
      status: false,
      message: "the user is already among your accepted friends"
    })
   }

   const invitationIndex =  dating.pendingInviatations.indexOf(senderProfileId, 1)
   if(invitationIndex === -1){
    return res.status(400).json({
      message: "you dont have any request from this user"
    })
   }

   if(action === "accept"){
    const conversation = new Conversation({
      participants: [userId, senderProfileId]
    })
    await conversation.save()
     dating.pendingInviatations.splice(invitationIndex, 1)
     dating.acceptedInvitations.push(senderProfileId)
     dating.chatList.push({user:senderProfileId, conversationId:conversation._id})

     const sender = await Dating.findOne({userId: senderProfileId})
     if(!sender){
      return res.status(400).json({
        message: "the sender dating profile not found",
        status: false
      })
     }
     
     sender.chatList.push({user:myUserId, conversationId:conversation._id})
     
     await Promise.all([dating.save(), sender.save()])

     io.to(userId.toString().emit("friend accepted"), {
      userId:userId,
      conversationId:conversation._id,
      message: `friend request successfully accepted,you are now friend with ${sender.userId} `
     })

     io.to(senderProfileId.toString().emit("your friend request is accepted"), {
      userId:senderProfileId,
      conversationId:conversation._id,
      message:  `You are now friends with ${userId}`,
     })

        return res.status(200).json({
        status: true,
        message: "successfully accepted",
        conversationId: conversation._id,
      });
   
  
    } else if (action === "reject") {
      dating.pendingInviatations.splice(invitationIndex, 1);
      await dating.save();
      return res.status(200).json({
        status: true,
        message: "successfully rejected",
      });
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message : "an error occurredwith the server"
    })
  }
})




























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
export default datingRouter