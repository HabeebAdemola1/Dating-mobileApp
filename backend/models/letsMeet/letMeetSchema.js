import mongoose from "mongoose"

const letsmeet = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    datingId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Dating',
        required: true
    },

    height:{
        type:String,
        required:true
    },
    faith:{
        type:String,
        required:true
},
    smoke: {
        type:String,
        required:true
    },
    drink:{
        type:String,
        required:true
    },
    personality:{
        type:String,
        required: true
    },
    education:{
        type:String,
        required: true
    },
    career:{
        type:String,
        required: true
    },
    ethnicity:{
        type:String,
        required: true
    },
  
      pictures:{
            type:[{
                type:String
            }],
            validate:{
                validator:function(array) {
                    return Array.isArray(array) && array.length <= 5
                },
                message: "You can upload a maximum of 5 pictures"
            },
            required: true
        },

})


export default mongoose.model("LetsMeet", letsmeet)