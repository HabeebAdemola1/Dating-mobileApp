import mongoose from 'mongoose';

const letsmeet = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  datingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dating',
    required: true,
  },
  height: {
    type: String,
    required: true,
  },
  faith: {
    type: String,
    required: true,
  },
  smoke: {
    type: String,
    required: true,
  },
  drink: {
    type: String,
    required: true,
  },
  personality: {
    type: String,
    required: true,
  },
  education: {
    type: String,
    required: true,
  },
  career: {
    type: String,
    required: true,
  },
  ethnicity: {
    type: String,
    required: true,
  },
  admirers: {
    type: Number,
    default: 0,
  },
  admirerList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  pendingInvitations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  acceptedInvitations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  pictures: {
    type: [{ type: String }],
    validate: {
      validator: function (array) {
        return Array.isArray(array) && array.length <= 5;
      },
      message: 'You can upload a maximum of 5 pictures',
    },
    required: true,
  },
  chatList: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LetsmeetConversation',
      },
    },
  ],
  viewedProfiles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  viewedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  compliments: [
    {
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      message: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

export default mongoose.model('LetsMeet', letsmeet);