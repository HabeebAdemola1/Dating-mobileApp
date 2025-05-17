import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    participants: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    messages: [
        {
            content : {
                type: String,
                required: true
            },
            sender: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            read:{
                type: Boolean,
                default: false
            }

        }
       

    ]
}, {timestamps: true})


export default mongoose.model("Conversation", conversationSchema)