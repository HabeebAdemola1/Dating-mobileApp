import mongoose from "mongoose"
import express from "express"
import User from "../../models/user/auth.Schema.js"
import Dating from "../../models/dating/datingSchema.js"
import Post from "../../models/dating/postSchema.js"
import { verifyToken } from "../../middlewares/verifyToken.js"


const  postRouter = express.Router()



postRouter.post("/createpost", verifyToken, async(req, res) => {
  const {content, media, isStatus} = req.body;
  const userId = req.user.id
  
  try {
    const user = await User.findOne({_id: userId})
    if(!user){
        return res.status(200).json({
            status:false,
            message: "user not found"
        })
    }

    const dating = await Dating.findOne({userId: user._id})
    if(!dating){
        return res.status(404).json({
            status: false,
            message: "user not found for dating profile, please update your dating profile"
        })
    }

    const post = new Post({
        content,
        media,
        isStatus: isStatus || "",
        userId,
        datingId: dating._id
    })

    await post.save()

    return res.status(201).json({
        status: false,
        message: "successfully posted",
        post
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
        message: "an error occurred with the server"
    })
  }
})


postRouter.get("/getpost", verifyToken, async(req, res) => {
    const userId = req.user.id

    try {
        const user = await User.findOne({_id: userId})
        if(!user){
            return res.status(404).json({
                message: "user account not found",
                status: false
            })
        }

          const dating = await Dating.findOne({userId: user._id})
    if(!dating){
        return res.status(404).json({
            status: false,
            message: "user not found for dating profile, please update your dating profile"
        })
    }


        const post = await Post.find({userId: user._id}).sort({createdAt: -1}).populate("userId", "fullname age gender")
         const currentTime = Date.now()
        const validPost = post.filter((posts) =>{
            if(posts.isStatus){
               const timeElapsed = currentTime - new Date(posts.createdAt).getTime()
                const elapsedTime = timeElapsed <  24 * 60 * 60 * 1000
                return elapsedTime
            }
            return true
        })

        return res.status(200).json({
            status: true,
            message: "your statuses are here",
            validPost
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'an error occurred with the server'})
    }
})




postRouter.get("/allposts", async(req, res) => {
 

    try {
       

        const after = req.query.after ? new Date(req.query.after) : null;
        const limit = 20
          const query = after ? { createdAt: { $lt: after } } : {};
        const post = await Post.find(query).populate("userId", "fullname age religion gender occupation maritalStatus phoneNumber email").populate("datingId", "genotype bloodgroup ").sort({createdAt: -1}).limit(limit)

        const currentTime = Date.now()
        const validPost = post.filter((posts) => {
            if(posts.isStatus){
                const timeElapsed = currentTime - new Date(posts.createdAt).getTime()
                const elapseTime = timeElapsed < 24 * 60 * 60 * 1000
                return elapseTime
            }
            return true
        })

        return res.status(200).json({
            message: "successful",
            validPost,
            hasMore: post.length === limit,
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: false,
            message: "an error occurred with the server"
        })
    }
})




















postRouter.get("/getotherpost", verifyToken, async(req, res) => {
    const userId = req.user.id
    try {
        const user = await User.findOne({_id: userId})
        if(!user){
            return res.status(404).json({message: "user not found"})
        }

        
        const posts = await Post.find({}).sort({createdAt: -1})
            .populate("userId", "email fullname age religion maritalStatus nationality state LGA")
            .populate("comments.userId", "fullname picture")
            .populate("likes.userId", "fullname picture")
            .populate("shares.userId", "fullname picture");

        const currentTime = Date.now();
        const validPosts = posts.filter((post) => {
            if(post.isStatus){
                const timeElapsed = currentTime - new Date(post.createdAt).getTime()
                return timeElapsed < 24 * 60 * 60 * 1000
                 
            }

            return true
        })

        return res.status(200).json({
            posts:validPosts
        })
    } catch (error) {
         console.log(error)
        return res.status(500).json({
            status: false,
            message: "failed to fetch all posts"
        })
    }
})



postRouter.put("/posts/:id", verifyToken, async(req, res) => {
    const {content} = req.body;
    const userId = req.user.id;
    const postId = req.params.id

    try {
        const post = await Post.findById(post)
        if(!post) return res.status(404).json({message: "post not found"})
        if(post.userId.toString() !== userId)return res.status(404).json({message:"user not found"})
        if(post.isStatus)return res.status(404).json({message: "you can't edit status"})

        post.content = content
    
        await post.save()

        return res.status(200).json({message: "post is successfully edited"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"an error occurred "})
    }
})


postRouter.delete("/posts/:id", verifyToken, async(req, res) => {
      const postId = req.params.id;
    const userId = req.user.id;

    try {
        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message: "post not found"})
        if(post.userId.toString() !== userId) return res.status(400).json({message: "unauthorized"})
        
        if(post.media){
            const publicId = post.media.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(publicId, {
                resource_type: post.mediaType === "video" ? "video" : "image",
            })
        }

        await Post.deleteOne({_id: postId});
        return res.status(200).json({message: `${post.isStatus ? "Status" : "Post" } deleted successfully`})
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ message: "Failed to delete post", error: error.message });
    }
})

// postRouter.post("/:postId/comment", verifyToken, async(req, res) => {
//     const {content} = req.body
//     const userId = req.user.id
//     const {postId} = req.params

//     try {
//         const user = await User.findOne({_id: userId})
//         if(!user)return res.status(404).json({message: "user account not found"})
        
//         const dating = await Dating.findOne({userId: user._id})
//         if(!dating) return res.status(404).json({message: "dating profile not found, please update your dating profile"})
        
//         const post = await Post.findById(postId)
//         if(!post) return res.status(404).json({message: "post not found"})
        
 
    
//         post.comments.push({userId, content})

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





postRouter.post("/:postId/comment", verifyToken, async (req, res) => {
  const { content } = req.body;
  const userId = req.user.id;
  const { postId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const dating = await Dating.findOne({ userId });
    if (!dating) return res.status(400).json({ message: "Dating profile required" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ userId, content });
    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("userId", "fullname picture")
      .populate("comments.userId", "fullname picture")
      .populate("likes.userId", "fullname picture");
    return res.status(200).json(updatedPost);
  } catch (error) {
    console.error('Comment error:', error);
    return res.status(500).json({ message: "Server error" });
  }
});












postRouter.post("/:postId/like", verifyToken, async(req, res) => {
    const {postId} = req.params
    const userId = req.user.id

    try {
          const user = await User.findOne({_id: userId})
        if(!user)return res.status(404).json({message: "user account not found"})
        
        const dating = await Dating.findOne({userId: user._id})
        if(!dating) return res.status(404).json({message: "dating profile not found, please update your dating profile"})
        
        const post = await Post.findById(postId)
        if(!post) return res.status(404).json({message: "post not found"})
        
            
        const likeIndex = post.likes.findIndex(
            (like) => like.userId.toString() === userId
        )
        if(likeIndex === -1){
            post.likes.push({userId})
        } else {
            post.likes.splice({userId})
        }
    
        const updatedPost = await Post.findById(postId)
             .populate("comments.userId", "fullname picture")
                .populate("likes.userId", "fullname picture")
                .populate("shares.userId", "fullname picture");
        return res.status(200).json({
            message : likeIndex ? "liked" : "unliked"
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({status: false, message: "an error occurred from the sever"})
    }
})

postRouter.post("/:postId/share", verifyToken, async(req, res) => {
  
    const userId = req.user.id
    const {postId} = req.params

    console.log(postId)

    try {
        const user = await User.findOne({_id: userId})
        if(!user)return res.status(404).json({message: "user account not found"})
        
        const dating = await Dating.findOne({userId: user._id})
        if(!dating) return res.status(404).json({message: "dating profile not found, please update your dating profile"})
        
        const post = await Post.findById(postId)
        if(!post) return res.status(404).json({message: "post not found"})
        
 
    
        post.shares.push({userId})

        await post.save()

        const updatedPost = await Post.findById(postId)
                .populate("comments.userId", "fullname picture")
                .populate("likes.userId", "fullname picture")
                .populate("shares.userId", "fullname picture");

        return res.status(200).json({message: "successfully commented", post:updatedPost})
    } catch (error) {
          console.log(error)
        return res.status(500).json({status: false, message: "an error occurred from the sever"})
    }
})

export default postRouter
