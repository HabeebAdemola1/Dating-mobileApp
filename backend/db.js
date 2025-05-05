import mongoose from "mongoose";


export const dbConnect = async(req, res) => {
    try {
        const connect=await mongoose.connect("mongodb+srv://pbllworld:goal12345@powerball.lllsua4.mongodb.net/EDates?retryWrites=true&w=majority")     
        if(!connect){
            console.log("an error occurred during the connection of mongo database")
        }
        console.log("mongodb successfully connected to the database")


    } catch (error) {
     console.log("an error occurred with mongodb server")
     console.log(error)   
    }
}