import mongoose from "mongoose";


const postSchema = new mongoose.Schema({
    content:{
        type: String,
        default: ""
    },
    media:{
        type:String
    },
  
    isStatus:{
        type:Boolean,
        default: false
    },
    userId: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
        datingId: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "Dating",
        required: true
    },
    createdAt: { type: Date, default: Date.now },
    comments:[
        {
            userId:{type: mongoose.Schema.Types.ObjectId, ref: "User"},
            content:String,
            createdAt: { type: Date, default: Date.now },
        }
    ],
    likes: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

        },
      ],
      shares: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

          createdAt: { type: Date, default: Date.now },
        },
      ],

      createdAt:{
        type: Date,
        default:Date.now()
      }

})


export default mongoose.model("Post", postSchema)