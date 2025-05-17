import mongoose from "mongoose"
import slugify from "slugify"

const datingSchema = new mongoose.Schema(
    {
        userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        genotype:{
            type:String,
            required: true
        },
        religion:{
            type:String,
            required: true
        },
        bio:{
            type:String
        },
        bloodGroup:{
            type:String,
            required: true
        },
        admirers: {
            type:Number,
            default: 0
        },
        admirerList:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        pendingInviatations:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        
        acceptedInvitations:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        pictures:{
            type:[{
                type:String
            }],
            validate:{
                validator:function(array) {
                    return Array.isArray(array) && array.length <= 15
                },
                message: "You can upload a maximum of 15 pictures"
            }
        },


        chatList:[
            {
                user:{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                },

                conversationId:{
                    type:mongoose.Schema.Types.ObjectId,
                    ref: "Conversation"
                }

            }
          
        ]

    }
)

export default mongoose.model("Dating", datingSchema)