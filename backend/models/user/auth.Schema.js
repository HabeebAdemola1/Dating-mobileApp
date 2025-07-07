import mongoose from "mongoose";


const authSchema  = new mongoose.Schema({
    email: {
        type:String,
        required: true,
        unique:true
    },
    phoneNumber: {
        type:String,
        required: true,

    },
  
    password: {
        type:String,
        required: String
    },
    fullname:{
        type:String,
    },
    age:{
        type:String,
    },
    occupation:{
        type:String,
    },
    gender:{
        type:String,
    },
    maritalStatus:{
        type:String,
    },
    interest1:{
        type:String,
    },
    interest2:{
        type:String,
    },
    nationality: {
        type: String,
      
      },
    stateOfOrigin:{
        type:String,
    },
    currentLocation:{
        type:String
    },
    picture:{
        type:String
    },
  
    isVerified: {type: Boolean,default: false},
    status: { type: String, enum: ['active', 'blocked', 'pending'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    registrationDate: { type: Date, default: Date.now },
    uniqueNumber: { type: String, unique: true },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
}, {timestamps: true })


export default mongoose.model("User", authSchema)