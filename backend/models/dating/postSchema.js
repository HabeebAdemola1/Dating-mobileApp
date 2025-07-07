// import mongoose from "mongoose";


// const postSchema = new mongoose.Schema({
//     content:{
//         type: String,
//         default: ""
//     },
//     media:{
//         type:String
//     },
  
//    isStatus: {
//       type: String,
//       default: "",
//     },
//     userId: {
//         type:mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         required: true
//     },
//         datingId: {
//         type:mongoose.Schema.Types.ObjectId,
//         ref: "Dating",
//         required: true
//     },
//     createdAt: { type: Date, default: Date.now },
//     comments:[
//         {
//             userId:{type: mongoose.Schema.Types.ObjectId, ref: "User"},
//             content:String,
//             createdAt: { type: Date, default: Date.now },
//         }
//     ],

    
//     likes: [
//         {
//           userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

//         },
//       ],
//       shares: [
//         {
//           userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

//           createdAt: { type: Date, default: Date.now },
//         },
//       ],

//       createdAt:{
//         type: Date,
//         default:Date.now()
//       }

// })


// export default mongoose.model("Post", postSchema)


































// postSchema.js
import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    default: "",
  },
  media: {
    url: { type: String, default: "" },
    type: { type: String, enum: ["image", "video"], default: "" },
    duration: { type: Number, default: 0 }, // Duration in seconds for videos
  },
  isStatus: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  datingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dating",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  comments: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      content: String,
      createdAt: { type: Date, default: Date.now },
    },
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
});

export default mongoose.model("Post", postSchema);