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
        isStatus: isStatus ==="true",
        userId,
        datingId: dating._id
    })

    await post.save()

    return res.status(200).json({
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


postRouter.get("/allposts", verifyToken, async(req, res) => {
    const userId = req.user.id

    try {
        const user = await User.findOne({_id : userId})
        if(!user){
            return res.status(200).json({
                message: "user account not found"
            })
        }

          const dating = await Dating.findOne({userId: user._id})
             if(!dating){
        return res.status(404).json({
            status: false,
            message: "user not found for dating profile, please update your dating profile"
        })
    }

        const post = (await Post.find({}).sort({createdAt: -1}).populate("userId", "fullname age religion gender occupation maritalStatus phoneNumber email")).populate("datingId", "genotype bloodgroup ")

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
            message: "succcessful",
            post: validPost
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: false,
            message: "an error occurred with the server"
        })
    }
})

export default postRouter
