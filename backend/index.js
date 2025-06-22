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



import { redisClient, connectRedis } from "./redis.js";
import letsMeetRoute from './routes/letsMeet/letMeetRoute.js';
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

  io.on('connection', (socket) => {
    console.log(`Socket.IO connection established: ${socket.id}, User ID: ${socket.user.id}`);

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

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(`Error in worker ${process.pid}:`, err.stack);
    res.status(500).json({ status: false, message: 'Internal server error' });
  });

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











































