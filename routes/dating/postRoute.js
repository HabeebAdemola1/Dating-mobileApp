// import mongoose from "mongoose"
// import express from "express"
// import User from "../../models/user/auth.Schema.js"
// import Dating from "../../models/dating/datingSchema.js"
// import Post from "../../models/dating/postSchema.js"
// import { verifyToken } from "../../middlewares/verifyToken.js"


// const  postRouter = express.Router()



// postRouter.post("/createpost", verifyToken, async(req, res) => {
//   const {content, media, isStatus} = req.body;
//   const userId = req.user.id
  
//   try {
//     const user = await User.findOne({_id: userId})
//     if(!user){
//         return res.status(200).json({
//             status:false,
//             message: "user not found"
//         })
//     }

//     const dating = await Dating.findOne({userId: user._id})
//     if(!dating){
//         return res.status(404).json({
//             status: false,
//             message: "user not found for dating profile, please update your dating profile"
//         })
//     }

//     const post = new Post({
//         content,
//         media,
//         isStatus: isStatus || "",
//         userId,
//         datingId: dating._id
//     })

//     await post.save()

//     return res.status(201).json({
//         status: false,
//         message: "successfully posted",
//         post
//     })
//   } catch (error) {
//     console.log(error)
//     return res.status(500).json({
//         message: "an error occurred with the server"
//     })
//   }
// })


// postRouter.get("/getpost", verifyToken, async(req, res) => {
//     const userId = req.user.id

//     try {
//         const user = await User.findOne({_id: userId})
//         if(!user){
//             return res.status(404).json({
//                 message: "user account not found",
//                 status: false
//             })
//         }

//           const dating = await Dating.findOne({userId: user._id})
//     if(!dating){
//         return res.status(404).json({
//             status: false,
//             message: "user not found for dating profile, please update your dating profile"
//         })
//     }


//         const post = await Post.find({userId: user._id}).sort({createdAt: -1}).populate("userId", "fullname age gender picture")
//          const currentTime = Date.now()
//         const validPost = post.filter((posts) =>{
//             if(posts.isStatus){
//                const timeElapsed = currentTime - new Date(posts.createdAt).getTime()
//                 const elapsedTime = timeElapsed <  24 * 60 * 60 * 1000
//                 return elapsedTime
//             }
//             return true
//         })

//         return res.status(200).json({
//             status: true,
//             message: "your statuses are here",
//             validPost
//         })
//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({ message: 'an error occurred with the server'})
//     }
// })




// postRouter.get("/allposts", async(req, res) => {
 

//     try {
       

//         const after = req.query.after ? new Date(req.query.after) : null;
//         const limit = 20
//           const query = after ? { createdAt: { $lt: after } } : {};
//         const post = await Post.find(query).populate("userId", "fullname age picture religion gender occupation maritalStatus phoneNumber email").populate("datingId", "genotype bloodgroup ").sort({createdAt: -1}).limit(limit)

//         const currentTime = Date.now()
//         const validPost = post.filter((posts) => {
//             if(posts.isStatus){
//                 const timeElapsed = currentTime - new Date(posts.createdAt).getTime()
//                 const elapseTime = timeElapsed < 24 * 60 * 60 * 1000
//                 return elapseTime
//             }
//             return true
//         })

//         return res.status(200).json({
//             message: "successful",
//             validPost,
//             hasMore: post.length === limit,
//         })
//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({
//             status: false,
//             message: "an error occurred with the server"
//         })
//     }
// })




















// postRouter.get("/getotherpost", verifyToken, async(req, res) => {
//     const userId = req.user.id
//     try {
//         const user = await User.findOne({_id: userId})
//         if(!user){
//             return res.status(404).json({message: "user not found"})
//         }

        
//         const posts = await Post.find({}).sort({createdAt: -1})
//             .populate("userId", "email picture fullname age religion maritalStatus nationality state LGA")
//             .populate("comments.userId", "fullname picture")
//             .populate("likes.userId", "fullname picture")
//             .populate("shares.userId", "fullname picture");

//         const currentTime = Date.now();
//         const validPosts = posts.filter((post) => {
//             if(post.isStatus){
//                 const timeElapsed = currentTime - new Date(post.createdAt).getTime()
//                 return timeElapsed < 24 * 60 * 60 * 1000
                 
//             }

//             return true
//         })

//         return res.status(200).json({
//             posts:validPosts
//         })
//     } catch (error) {
//          console.log(error)
//         return res.status(500).json({
//             status: false,
//             message: "failed to fetch all posts"
//         })
//     }
// })



// postRouter.put("/posts/:id", verifyToken, async(req, res) => {
//     const {content} = req.body;
//     const userId = req.user.id;
//     const postId = req.params.id

//     try {
//         const post = await Post.findById(post)
//         if(!post) return res.status(404).json({message: "post not found"})
//         if(post.userId.toString() !== userId)return res.status(404).json({message:"user not found"})
//         if(post.isStatus)return res.status(404).json({message: "you can't edit status"})

//         post.content = content
    
//         await post.save()

//         return res.status(200).json({message: "post is successfully edited"})
//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({message:"an error occurred "})
//     }
// })


// postRouter.delete("/posts/:id", verifyToken, async(req, res) => {
//       const postId = req.params.id;
//     const userId = req.user.id;

//     try {
//         const post = await Post.findById(postId);
//         if(!post) return res.status(404).json({message: "post not found"})
//         if(post.userId.toString() !== userId) return res.status(400).json({message: "unauthorized"})
        
//         if(post.media){
//             const publicId = post.media.split("/").pop().split(".")[0];
//             await cloudinary.uploader.destroy(publicId, {
//                 resource_type: post.mediaType === "video" ? "video" : "image",
//             })
//         }

//         await Post.deleteOne({_id: postId});
//         return res.status(200).json({message: `${post.isStatus ? "Status" : "Post" } deleted successfully`})
//     } catch (error) {
//         console.error("Error deleting post:", error);
//         res.status(500).json({ message: "Failed to delete post", error: error.message });
//     }
// })

// // postRouter.post("/:postId/comment", verifyToken, async(req, res) => {
// //     const {content} = req.body
// //     const userId = req.user.id
// //     const {postId} = req.params

// //     try {
// //         const user = await User.findOne({_id: userId})
// //         if(!user)return res.status(404).json({message: "user account not found"})
        
// //         const dating = await Dating.findOne({userId: user._id})
// //         if(!dating) return res.status(404).json({message: "dating profile not found, please update your dating profile"})
        
// //         const post = await Post.findById(postId)
// //         if(!post) return res.status(404).json({message: "post not found"})
        
 
    
// //         post.comments.push({userId, content})

// //         await post.save()

// //         const updatedPost = await Post.findById(postId)
// //                 .populate("comments.userId", "fullname picture")
// //                 .populate("likes.userId", "fullname picture")
// //                 .populate("shares.userId", "fullname picture");

// //         return res.status(200).json({message: "successfully commented", post:updatedPost})
// //     } catch (error) {
// //           console.log(error)
// //         return res.status(500).json({status: false, message: "an error occurred from the sever"})
// //     }

// // })





// postRouter.post("/:postId/comment", verifyToken, async (req, res) => {
//   const { content } = req.body;
//   const userId = req.user.id;
//   const { postId } = req.params;

//   try {
//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const dating = await Dating.findOne({ userId });
//     if (!dating) return res.status(400).json({ message: "Dating profile required" });

//     const post = await Post.findById(postId);
//     if (!post) return res.status(404).json({ message: "Post not found" });

//     post.comments.push({ userId, content });
//     await post.save();

//     const updatedPost = await Post.findById(postId)
//       .populate("userId", "fullname picture")
//       .populate("comments.userId", "fullname picture")
//       .populate("likes.userId", "fullname picture");
//     return res.status(200).json(updatedPost);
//   } catch (error) {
//     console.error('Comment error:', error);
//     return res.status(500).json({ message: "Server error" });
//   }
// });












// postRouter.post("/:postId/like", verifyToken, async(req, res) => {
//     const {postId} = req.params
//     const userId = req.user.id

//     try {
//           const user = await User.findOne({_id: userId})
//         if(!user)return res.status(404).json({message: "user account not found"})
        
//         const dating = await Dating.findOne({userId: user._id})
//         if(!dating) return res.status(404).json({message: "dating profile not found, please update your dating profile"})
        
//         const post = await Post.findById(postId)
//         if(!post) return res.status(404).json({message: "post not found"})
        
            
//         const likeIndex = post.likes.findIndex(
//             (like) => like.userId.toString() === userId
//         )
//         if(likeIndex === -1){
//             post.likes.push({userId})
//         } else {
//             post.likes.splice({userId})
//         }
    
//         const updatedPost = await Post.findById(postId)
//              .populate("comments.userId", "fullname picture")
//                 .populate("likes.userId", "fullname picture")
//                 .populate("shares.userId", "fullname picture");
//         return res.status(200).json({
//             message : likeIndex ? "liked" : "unliked"
//         })
//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({status: false, message: "an error occurred from the sever"})
//     }
// })

// postRouter.post("/:postId/share", verifyToken, async(req, res) => {
  
//     const userId = req.user.id
//     const {postId} = req.params

//     console.log(postId)

//     try {
//         const user = await User.findOne({_id: userId})
//         if(!user)return res.status(404).json({message: "user account not found"})
        
//         const dating = await Dating.findOne({userId: user._id})
//         if(!dating) return res.status(404).json({message: "dating profile not found, please update your dating profile"})
        
//         const post = await Post.findById(postId)
//         if(!post) return res.status(404).json({message: "post not found"})
        
 
    
//         post.shares.push({userId})

//         await post.save()

//         const updatedPost = await Post.findById(postId)
//                 .populate("comments.userId", "fullname picture")
//                 .populate("likes.userId", "fullname picture")
//                 .populate("shares.userId", "fullname picture");

//         return res.status(200).json({message: "successfully commented", post:updatedPost})
//     } catch (error) {
//           console.log(error)
//         return res.status(500).json({status: false, message: "an error occurred from the sever"})
//     }
// })

// export default postRouter







// postRoute.js
import express from "express";
import mongoose from "mongoose";
import User from "../../models/user/auth.Schema.js";
import Dating from "../../models/dating/datingSchema.js";
import Post from "../../models/dating/postSchema.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { Readable } from "stream";

const postRouter = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "video/mp4", "video/mpeg"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Invalid file type. Only JPEG, PNG, MP4, and MPEG are allowed."));
    }
    cb(null, true);
  },
});

postRouter.post("/createpost", verifyToken, upload.single("media"), async (req, res) => {
  const { content, isStatus } = req.body;
  const userId = req.user.id;
  const file = req.file;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    // Check subscription status
    // if (!user.subscription || user.subscription.status !== "active") {
    //   return res.status(403).json({
    //     status: false,
    //     message: "Active subscription required to create a post",
    //   });
    // }

    const dating = await Dating.findOne({ userId: user._id });
    if (!dating) {
      return res.status(404).json({
        status: false,
        message: "User not found for dating profile, please update your dating profile",
      });
    }

    // Handle media upload
    let media = { url: "", type: "", duration: 0 };
    if (file) {
      const isVideo = file.mimetype.startsWith("video/");
      const resourceType = isVideo ? "video" : "image";

      // Upload to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: resourceType, folder: "social_media" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        const bufferStream = new Readable();
        bufferStream.push(file.buffer);
        bufferStream.push(null);
        bufferStream.pipe(uploadStream);
      });

      if (isVideo) {
        // Validate video duration (max 1 hour = 3600 seconds)
        const duration = uploadResult.duration;
        if (duration > 3600) {
          await cloudinary.uploader.destroy(uploadResult.public_id, { resource_type: "video" });
          return res.status(400).json({
            status: false,
            message: "Video duration exceeds 1 hour",
          });
        }
        media = {
          url: uploadResult.secure_url,
          type: "video",
          duration: duration,
        };
      } else {
        media = {
          url: uploadResult.secure_url,
          type: "image",
          duration: 0,
        };
      }
    }

    const post = new Post({
      content,
      media,
      isStatus: isStatus === "true" || isStatus === true,
      userId,
      datingId: dating._id,
    });

    await post.save();

    return res.status(201).json({
      status: true,
      message: "Successfully posted",
      post,
    });
  } catch (error) {
    console.error("Create post error:", error);
    return res.status(500).json({
      status: false,
      message: "An error occurred with the server",
      error: error.message,
    });
  }
});

postRouter.get("/getpost", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User account not found",
      });
    }

    const dating = await Dating.findOne({ userId: user._id });
    if (!dating) {
      return res.status(404).json({
        status: false,
        message: "User not found for dating profile, please update your dating profile",
      });
    }

    const posts = await Post.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .populate("userId", "fullname age gender picture");
    const currentTime = Date.now();
    const validPosts = posts.filter((post) => {
      if (post.isStatus) {
        const timeElapsed = currentTime - new Date(post.createdAt).getTime();
        return timeElapsed < 24 * 60 * 60 * 1000;
      }
      return true;
    });

    return res.status(200).json({
      status: true,
      message: "Your posts and statuses",
      validPosts,
    });
  } catch (error) {
    console.error("Get post error:", error);
    return res.status(500).json({
      status: false,
      message: "An error occurred with the server",
    });
  }
});

postRouter.get("/allposts", async (req, res) => {
  try {
    const after = req.query.after ? new Date(req.query.after) : null;
    const limit = 20;
    const query = after ? { createdAt: { $lt: after } } : {};
    const posts = await Post.find(query)
      .populate("userId", "fullname age picture religion gender occupation maritalStatus phoneNumber email")
      .populate("datingId", "genotype bloodGroup")
      .sort({ createdAt: -1 })
      .limit(limit);

    const currentTime = Date.now();
    const validPost = posts.filter((post) => {
      if (post.isStatus) {
        const timeElapsed = currentTime - new Date(post.createdAt).getTime();
        return timeElapsed < 24 * 60 * 60 * 1000;
      }
      return true;
    });

    return res.status(200).json({
      status: true,
      message: "Successful",
      validPost,
      hasMore: posts.length === limit,
    });
  } catch (error) {
    console.error("Get all posts error:", error);
    return res.status(500).json({
      status: false,
      message: "An error occurred with the server",
    });
  }
});

postRouter.get("/getotherpost", verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    const posts = await Post.find({ userId: { $ne: userId } })
      .sort({ createdAt: -1 })
      .populate("userId", "email picture fullname age religion maritalStatus nationality state LGA")
      .populate("comments.userId", "fullname picture")
      .populate("likes.userId", "fullname picture")
      .populate("shares.userId", "fullname picture");

    const currentTime = Date.now();
    const validPosts = posts.filter((post) => {
      if (post.isStatus) {
        const timeElapsed = currentTime - new Date(post.createdAt).getTime();
        return timeElapsed < 24 * 60 * 60 * 1000;
      }
      return true;
    });

    return res.status(200).json({
      status: true,
      posts: validPosts,
    });
  } catch (error) {
    console.error("Get other posts error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch all posts",
    });
  }
});

postRouter.put("/posts/:id", verifyToken, async (req, res) => {
  const { content } = req.body;
  const userId = req.user.id;
  const postId = req.params.id;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        status: false,
        message: "Post not found",
      });
    }
    if (post.userId.toString() !== userId) {
      return res.status(403).json({
        status: false,
        message: "Unauthorized",
      });
    }
    if (post.isStatus) {
      return res.status(400).json({
        status: false,
        message: "You can't edit a status",
      });
    }

    post.content = content;
    await post.save();

    return res.status(200).json({
      status: true,
      message: "Post successfully edited",
      post,
    });
  } catch (error) {
    console.error("Edit post error:", error);
    return res.status(500).json({
      status: false,
      message: "An error occurred",
    });
  }
});

postRouter.delete("/posts/:id", verifyToken, async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        status: false,
        message: "Post not found",
      });
    }
    if (post.userId.toString() !== userId) {
      return res.status(403).json({
        status: false,
        message: "Unauthorized",
      });
    }

    if (post.media.url) {
      const publicId = post.media.url.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId, {
        resource_type: post.media.type,
      });
    }

    await Post.deleteOne({ _id: postId });
    return res.status(200).json({
      status: true,
      message: `${post.isStatus ? "Status" : "Post"} deleted successfully`,
    });
  } catch (error) {
    console.error("Delete post error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to delete post",
      error: error.message,
    });
  }
});

postRouter.post("/:postId/comment", verifyToken, async (req, res) => {
  const { content } = req.body;
  const userId = req.user.id;
  const { postId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    const dating = await Dating.findOne({ userId });
    if (!dating) {
      return res.status(400).json({
        status: false,
        message: "Dating profile required",
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        status: false,
        message: "Post not found",
      });
    }

    post.comments.push({ userId, content });
    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("userId", "fullname picture")
      .populate("comments.userId", "fullname picture")
      .populate("likes.userId", "fullname picture")
      .populate("shares.userId", "fullname picture");

    return res.status(200).json({
      status: true,
      message: "Successfully commented",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Comment error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
});

postRouter.post("/:postId/like", verifyToken, async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User account not found",
      });
    }

    const dating = await Dating.findOne({ userId: user._id });
    if (!dating) {
      return res.status(404).json({
        status: false,
        message: "Dating profile not found, please update your dating profile",
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        status: false,
        message: "Post not found",
      });
    }

    const likeIndex = post.likes.findIndex((like) => like.userId.toString() === userId);
    if (likeIndex === -1) {
      post.likes.push({ userId });
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("comments.userId", "fullname picture")
      .populate("likes.userId", "fullname picture")
      .populate("shares.userId", "fullname picture");

    return res.status(200).json({
      status: true,
      message: likeIndex === -1 ? "Liked" : "Unliked",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Like error:", error);
    return res.status(500).json({
      status: false,
      message: "An error occurred with the server",
    });
  }
});

postRouter.post("/:postId/share", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { postId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User account not found",
      });
    }

    const dating = await Dating.findOne({ userId: user._id });
    if (!dating) {
      return res.status(404).json({
        status: false,
        message: "Dating profile not found, please update your dating profile",
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        status: false,
        message: "Post not found",
      });
    }

    post.shares.push({ userId });
    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("comments.userId", "fullname picture")
      .populate("likes.userId", "fullname picture")
      .populate("shares.userId", "fullname picture");

    return res.status(200).json({
      status: true,
      message: "Successfully shared",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Share error:", error);
    return res.status(500).json({
      status: false,
      message: "An error occurred with the server",
    });
  }
});

export default postRouter;










































