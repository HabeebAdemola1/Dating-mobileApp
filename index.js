// import express from "express"
// import cors from "cors"
// import bodyParser from "body-parser"
// import dotenv from "dotenv"
// import morgan from "morgan"
// import authRouter from "./routes/user/authRoute.js"
// import { dbConnect } from "./db.js"
// import datingRouter from "./routes/dating/datingRoute.js"
// import postRouter from "./routes/dating/postRoute.js"
// import cluster from 'node:cluster';
// import os from 'node:os';
// dbConnect()
// dotenv.config()

// if(cluster.isPrimary){
//     console.log(`master ${process.pid} is running`)

// const numCPUs = os.cpus.length
// for(let i = 0; i < numCPUs; i++){
//     cluster.fork()
// }

// // Collect request counts
//   cluster.on('message', (worker, message) => {
//     console.log(`Worker ${message.workerId} handled ${message.requestCount} requests`);
//   });

// cluster.on("exit", (worker, code, signal)=>{
//     console.log(`worker with ${worker.pid} and with code ${code}, signal ${signal}`)
//     console.log("starting a new worker")
//     cluster.fork()
// })

// } else {
//     const app = express()

// app.use(bodyParser.json({limit: "10mb"}))
// app.use(cors({ origin: "*" }));
// app.use(morgan("dev"))

// app.use('/api/auth', authRouter)
// app.use("/api/dating", datingRouter)
// app.use("/api/post", postRouter)
// const port = process.env.PORT

// app.listen(port, '0.0.0.0', () => {
//     console.log(`Worker ${process.pid} running on port ${port}`);
// })

// }






import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import morgan from 'morgan';
import mongoose from 'mongoose'; // Added
import authRouter from './routes/user/authRoute.js';
import { dbConnect } from './db.js';
import datingRouter from './routes/dating/datingRoute.js';
import postRouter from './routes/dating/postRoute.js';
import cluster from 'node:cluster';
import os from 'node:os';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import jwt from 'jsonwebtoken';
import http from 'http';
import Group from './models/group/groupSchema.js';


import { redisClient, connectRedis } from "./redis.js";
import letsMeetRoute from './routes/letsMeet/letMeetRoute.js';
import groupRoute from './routes/group/groupRoute.js';
import { verifyToken } from './middlewares/verifyToken.js';
import LetmeetConversation from './models/letsMeet/letmeetConversation.js';
// Load environment variables
dotenv.config();

const createApp = () => {
  const app = express();

  // Middleware
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
  app.use(cors({ origin: '*' }));
  app.use(morgan('dev'));
app.set("redis", redisClient);
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  

Promise.all([dbConnect(), connectRedis()])


  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Token not found'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });


  const activeUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`Socket.IO connection established: ${socket.id}, User ID: ${socket.user.id}`);

     socket.on('joinGroup', ({ groupId, userId }) => {
    socket.join(groupId);
    io.to(groupId).emit('userJoined', { userId });
  });

    socket.on('sendMessage', async ({ groupId, userId, content, type }) => {
      try {
        const group = await Group.findById(groupId);
        const message = { sender: userId, content, type, createdAt: new Date() };
        group.messages.push(message);
        await group.save();
        io.to(groupId).emit('receiveMessage', message);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });


      // Join conversation room
  socket.on('joinConversation', async ({ conversationId }) => {
    try {
      const conversation = await LetsmeetConversation.findById(conversationId);
      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found' });
        return;
      }
      if (!conversation.participants.includes(socket.user.id)) {
        socket.emit('error', { message: 'Unauthorized access to conversation' });
        return;
      }
      socket.join(conversationId);
      socket.emit('joinedConversation', { conversationId });
    } catch (error) {
      socket.emit('error', { message: 'Server error', error: error.message });
    }
  });

  // Handle sending message
  socket.on('sendMessage', async ({ conversationId, content }) => {
    try {
      const userId = socket.user.id;
      const conversation = await LetmeetConversation.findById(conversationId);
      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found' });
        return;
      }
      if (!conversation.participants.includes(userId)) {
        socket.emit('error', { message: 'Unauthorized to send message' });
        return;
      }
      const message = {
        senderId: userId,
        content,
        createdAt: new Date(),
      };
      conversation.messages.push(message);
      await conversation.save();
      // Emit message to all participants in the conversation room
      io.to(conversationId).emit('receiveMessage', {
        conversationId,
        message: {
          senderId: userId,
          content,
          createdAt: message.createdAt,
        },
      });
    } catch (error) {
      socket.emit('error', { message: 'Server error', error: error.message });
    }
  });


    // Authenticate user and join groups
  socket.on('join-user', async ({ userId, token }) => {
    try {
      // Verify token (use your verifyToken middleware logic)
      activeUsers.set(userId, socket.id);
      socket.userId = userId;
      io.emit('user-status', { userId, status: 'online' });

      // Fetch user's groups
      const userGroups = await Group.find({ $or: [{ members: userId }, { 'joinRequests.user': userId }] }).select('uniqueNumber name');
      userGroups.forEach((group) => socket.join(group.uniqueNumber));
      socket.emit('group-list', userGroups.map((g) => g.uniqueNumber));
    } catch (error) {
      socket.emit('error', { message: 'Authentication failed' });
    }
  });

  // Create group
  socket.on('create-group', async ({ groupName, type, userId, members }, callback) => {
    try {
      const uniqueNumber = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const group = new Group({
        name: groupName,
        uniqueNumber,
        type,
        admins: [userId],
        members: [userId, ...members],
      });
      await group.save();

      // Join all members to the group room
      members.forEach((memberId) => {
        const memberSocketId = activeUsers.get(memberId);
        if (memberSocketId) {
          io.sockets.sockets.get(memberSocketId)?.join(uniqueNumber);
        }
      });
      socket.join(uniqueNumber);

      io.to(uniqueNumber).emit('group-created', { uniqueNumber, name: groupName, type, members });
      callback({ status: 'success', uniqueNumber });
    } catch (error) {
      callback({ status: 'error', message: error.message });
    }
  });

  // Send group message
  socket.on('send-group-message', async ({ uniqueNumber, content, senderId, type = 'text' }, callback) => {
    try {
      const group = await Group.findOne({ uniqueNumber });
      if (!group) throw new Error('Group not found');
      if (!group.members.includes(senderId)) throw new Error('User not in group');

      const message = {
        sender: senderId,
        content,
        type,
        createdAt: new Date(),
      };
      group.messages.push(message);
      await group.save();

      // Update message status to 'delivered' for online members
      const onlineMembers = group.members.filter((id) => activeUsers.has(id.toString()));
      const messageData = { ...message, status: onlineMembers.length > 1 ? 'delivered' : 'sent' };

      io.to(uniqueNumber).emit('group-message', messageData);
      callback({ status: 'success', messageId: message._id });
    } catch (error) {
      callback({ status: 'error', message: error.message });
    }
  });

  // Typing indicator
  socket.on('typing', ({ uniqueNumber, userId, isTyping }) => {
    socket.to(uniqueNumber).emit('typing', { userId, isTyping });
  });

  // Join request
  socket.on('join-group-request', async ({ uniqueNumber, userId }, callback) => {
    try {
      const group = await Group.findOne({ uniqueNumber });
      if (!group) throw new Error('Group not found');
      if (group.members.includes(userId)) throw new Error('Already a member');
      if (group.joinRequests.some((req) => req.user.toString() === userId && req.status === 'pending')) {
        throw new Error('Join request already pending');
      }

      group.joinRequests.push({ user: userId, status: 'pending' });
      await group.save();

      // Notify admins
      group.admins.forEach((adminId) => {
        const adminSocketId = activeUsers.get(adminId.toString());
        if (adminSocketId) {
          io.to(adminSocketId).emit('join-request', { uniqueNumber, userId });
        }
      });
      callback({ status: 'success', message: 'Join request sent' });
    } catch (error) {
      callback({ status: 'error', message: error.message });
    }
  });

  // Handle join request
  socket.on('handle-join-request', async ({ uniqueNumber, userId, action }, callback) => {
    try {
      const group = await Group.findOne({ uniqueNumber });
      if (!group) throw new Error('Group not found');
      if (!group.admins.includes(socket.userId)) throw new Error('Not an admin');

      const joinRequest = group.joinRequests.find((req) => req.user.toString() === userId);
      if (!joinRequest) throw new Error('Join request not found');

      joinRequest.status = action;
      if (action === 'accepted') {
        group.members.push(userId);
        const userSocketId = activeUsers.get(userId);
        if (userSocketId) {
          io.sockets.sockets.get(userSocketId)?.join(uniqueNumber);
        }
      }
      await group.save();

      io.to(uniqueNumber).emit('join-request-updated', { uniqueNumber, userId, status: action });
      callback({ status: 'success', message: `Join request ${action}` });
    } catch (error) {
      callback({ status: 'error', message: error.message });
    }
  });


  socket.on('rename-group', async ({ uniqueNumber, newName }, callback) => {
    try {
      const group = await Group.findOne({ uniqueNumber });
      if (!group) throw new Error('Group not found');
      if (!group.admins.includes(socket.userId)) throw new Error('Not an admin');

      group.name = newName;
      await group.save();

      io.to(uniqueNumber).emit('group-renamed', { uniqueNumber, newName });
      callback({ status: 'success', message: 'Group renamed successfully' });
    } catch (error) {
      callback({ status: 'error', message: error.message });
    }
  });

  socket.on('delete-group', async ({ uniqueNumber }, callback) => {
    try {
      const group = await Group.findOne({ uniqueNumber });
      if (!group) throw new Error('Group not found');
      if (!group.admins.includes(socket.userId)) throw new Error('Not an admin');

      await Group.deleteOne({ uniqueNumber });

      io.to(uniqueNumber).emit('group-deleted', { uniqueNumber });
      callback({ status: 'success', message: 'Group deleted successfully' });
    } catch (error) {
      callback({ status: 'error', message: error.message });
    }
  });

  socket.on('leave-group', async ({ uniqueNumber, userId }, callback) => {
    try {
      const group = await Group.findOne({ uniqueNumber });
      if (!group) throw new Error('Group not found');
      if (!group.members.includes(userId)) throw new Error('Not a member');
      if (group.admins.includes(userId) && group.admins.length === 1) {
        throw new Error('Sole admin cannot leave; delete group or add another admin');
      }

      group.members = group.members.filter((id) => id.toString() !== userId);
      group.admins = group.admins.filter((id) => id.toString() !== userId);
      group.joinRequests = group.joinRequests.filter((req) => req.user.toString() !== userId);
      await group.save();

      socket.leave(uniqueNumber);
      io.to(uniqueNumber).emit('member-left', { uniqueNumber, userId });
      callback({ status: 'success', message: 'Left group successfully' });
    } catch (error) {
      callback({ status: 'error', message: error.message });
    }
  });

   

    socket.join(socket.user.id); // Join room with userId
    console.log(`User ${socket.user.id} joined room: ${socket.user.id}`);

    socket.on('new message', async ({ conversationId, content, recipientId }) => {
      try {
        const Conversation = mongoose.model('Conversation');
        let conversation = await Conversation.findById(conversationId);

        if (!conversation) {
        
          conversation = new Conversation({
            participants: [
              new mongoose.Types.ObjectId(socket.user.id),
              new mongoose.Types.ObjectId(recipientId),
            ],
            messages: [],
          });
        }

        const message = {
          content,
          sender: new mongoose.Types.ObjectId(socket.user.id),
          read: false,
        };
        conversation.messages.push(message); 
        await conversation.save();

        // Emit to recipient
        io.to(recipientId).emit('newMessage', {
          conversationId: conversation._id.toString(),
          content,
          senderId: socket.user.id,
          timestamp: new Date().toISOString(),
        });

        // Emit to sender
        socket.emit('newMessage', {
          conversationId: conversation._id.toString(),
          content,
          senderId: socket.user.id,
          timestamp: new Date().toISOString(),
        });

        console.log(`Message sent from ${socket.user.id} to ${recipientId}: ${content}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      io.emit('userDisconnected', `User ${socket.user.id} has left`);
      console.log(`User ${socket.user.id} disconnected`);
    });
  });

  // Request counter middleware
  let requestCount = 0;
  app.use((req, res, next) => {
    requestCount++;
    if (cluster.isWorker && requestCount % 10 === 0) {
      process.send({ workerId: cluster.worker.id, requestCount });
    }
    next();
  });

  // Routes
  app.use('/api/auth', authRouter);
  app.use('/api/dating', datingRouter);
  app.use('/api/post', postRouter);
  app.use('/api/letsmeet', letsMeetRoute)
  app.use('/api/groups', groupRoute)

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(`Error in worker ${process.pid}:`, err.stack);
    res.status(500).json({ status: false, message: 'Internal server error' });
  });

app.use("/", (req, res) => {
    res.send("backend is working")
})


//   app.post('/api/groups/addMember', async (req, res) => {
//   const { groupId, email, adminId } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ error: 'User not found' });
//     const group = await Group.findById(groupId);
//     if (!group.admins.includes(adminId)) return res.status(403).json({ error: 'Not an admin' });
//     if (!group.members.includes(user._id)) {
//       group.members.push(user._id);
//       await group.save();
//       io.to(groupId).emit('userJoined', { userId: user._id });
//     }
//     res.json(group);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to add member' });
//   }
// });

// app.post('/api/groups/removeMember', async (req, res) => {
//   const { groupId, userId, adminId } = req.body;
//   try {
//     const group = await Group.findById(groupId);
//     if (!group.admins.includes(adminId)) return res.status(403).json({ error: 'Not an admin' });
//     group.members = group.members.filter(member => member.toString() !== userId);
//     group.admins = group.admins.filter(admin => admin.toString() !== userId);
//     await group.save();
//     io.to(groupId).emit('userRemoved', { userId });
//     res.json(group);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to remove member' });
//   }
// });

// app.post('/api/groups/makeAdmin', async (req, res) => {
//   const { groupId, userId, adminId } = req.body;
//   try {
//     const group = await Group.findById(groupId);
//     if (!group.admins.includes(adminId)) return res.status(403).json({ error: 'Not an admin' });
//     if (!group.admins.includes(userId)) {
//       group.admins.push(userId);
//       await group.save();
//       io.to(groupId).emit('adminAdded', { userId });
//     }
//     res.json(group);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to make admin' });
//   }
// });


// app.post('/api/groups/rename', async (req, res) => {
//   const { groupId, newName, adminId } = req.body;
//   try {
//     const group = await Group.findById(groupId);
//     if (!group.admins.includes(adminId)) return res.status(403).json({ error: 'Not an admin' });
//     group.name = newName;
//     await group.save();
//     io.to(groupId).emit('groupRenamed', { newName });
//     res.json(group);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to rename group' });
//   }
// });


// app.post("/api/groups/sendJoinRequest", verifyToken, async (req, res) => {
//   try {
//     const { groupId, userId } = req.body;
//     const group = await Group.findById(groupId);
//     if (!group) return res.status(404).json({ error: "Group not found" });
//     // ... (existing join request logic)
//     io.to(groupId).emit("joinRequestResponse", { groupId, status: "accepted", group });
//     res.json({ message: "Join request sent" });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to send join request" });
//   }
// });

  return { app, server }; // Return server for listening
};




if (cluster.isPrimary) {
  console.log(`Master ${process.pid} is running`);

  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('message', (worker, message) => {
    if (message.workerId && message.requestCount) {
      console.log(`Worker ${message.workerId} handled ${message.requestCount} requests`);
    }
  });

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} exited with code ${code}, signal ${signal}`);
    if (code !== 0) {
      console.log('Starting a new worker due to abnormal exit');
      cluster.fork();
    }
  });
} else {
  const { app, server } = createApp();
  const port = process.env.PORT || 3000;

  dbConnect()
    .then(() => {
      server.listen(port, '0.0.0.0', () => {
        console.log(`Worker ${process.pid} running on port ${port}`);
      });
    })
    .catch((err) => {
      console.error(`Worker ${process.pid} failed to connect to database:`, err);
      process.exit(1);
    });

  process.on('uncaughtException', (err) => {
    console.error(`Uncaught exception in worker ${process.pid}:`, err);
    process.exit(1);
  });
}






















































