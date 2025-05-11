import mongoose from "mongoose";
import slugify from "slugify"

const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      gender: {
        type: String,
        required: true,
      },
      maritalStatus: {
        type: String,
        required: true,
      },
      interests: [{ type: String, required: true }],
      nationality: {
        type: String,
        required: true,
      },

})