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













import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import morgan from "morgan";
import authRouter from "./routes/user/authRoute.js";
import { dbConnect } from "./db.js";
import datingRouter from "./routes/dating/datingRoute.js";
import postRouter from "./routes/dating/postRoute.js";
import cluster from "node:cluster";
import os from "node:os";
import { Server } from "socket.io";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import jwt from "jsonwebtoken"
import http from "http"
// Load environment variables
dotenv.config();

const createApp = () => {
  const app = express();

  // Middleware
  app.use(bodyParser.json({ limit: "1mb" }));
  app.use(cors({ origin: "*" }));
  app.use(morgan("dev"));

  const server = http.createServer(app)
  const io = new Server(server, {
      cors:{
        origin:"*",
        method:["GET", "POST"]
      }
  })



  const pubClient = createClient({url: "redis://localhost:6379" });
  const subClient = pubClient.duplicate()
  Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    console.log("redis adapter initialize")
  })
  .catch((err) => {
    console.error("redis connection error")
  })


  io.use(async(socket, next) => {
    const token = socket.handshake.auth.token
    if(!token){
      throw new Error("token not found")
    }
    try {
       const decoded = jwt.verify(token, process.env.JWT_SECRET)
    socket.user= decoded
    next()
    } catch (error) {
      next(new Error("authentication error "))
    }

   
  })



  io.on("connection", (socket) => {
    console.log(`socket io connection has started ${socket.id}, User ID: ${socket.user.id}`)

    socket.join("joinRoom", socket.user.id)
    console.log(`user ${socket.user.id} join the room: ${socket.user.id}`)

  
    socket.on("new message", async({ conversationId, content, recipientId}) => {

   try {
    const Conversation = mongoose.model("Conversation")
    const conversation = await Conversation.findById(conversationId);
    if(!conversation){
      socket.emit("error", {message: "conversation not found"})
    }

    conversation.message.push({
      content,
      sender:socket.user.id,
      read: false,
    })

    await conversation.save()

    ///emit to the recipient
    io.to(recipientId).emit("newMessage", {
      content,
      sender:socket.user.id,
      conversationId,
      timestamp: new Date().toISOString(),
    })


         // Emit to sender (to update their own chat)
        socket.emit("newMessage", {
          conversationId,
          content,
          senderId: socket.user.id,
          timestamp: new Date().toISOString(),
        });


        console.log(`Message sent from ${socket.user.id} to ${recipientId}: ${content}`);
    ///update the list for the sender
   } catch (error) {
        console.error("Error sending message:", err);
        socket.emit("error", { message: "Failed to send message" });
   }
    }
    
  )

  socket.on("disconnect", () => {
    console.log("general group").emit(`user with ${socket.user.id} has left`)
  })
  })
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
  app.use("/api/auth", authRouter);
  app.use("/api/dating", datingRouter);
  app.use("/api/post", postRouter);

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(`Error in worker ${process.pid}:`, err.stack);
    res.status(500).json({ status: false, message: "Internal server error" });
  });

  return app;
};

if (cluster.isPrimary) {
  console.log(`Master ${process.pid} is running`);

  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("message", (worker, message) => {
    if (message.workerId && message.requestCount) {
      console.log(
        `Worker ${message.workerId} handled ${message.requestCount} requests`
      );
    }
  });

  // Handle worker exit
  cluster.on("exit", (worker, code, signal) => {
    console.log(
      `Worker ${worker.process.pid} exited with code ${code}, signal ${signal}`
    );
    if (code !== 0) {
      console.log("Starting a new worker due to abnormal exit");
      cluster.fork();
    }
  });
} else {
  const app = createApp();
  const port = process.env.PORT || 3000;

  dbConnect()
    .then(() => {
      app.listen(port, "0.0.0.0", () => {
        console.log(`Worker ${process.pid} running on port ${port}`);
      });
    })
    .catch((err) => {
      console.error(
        `Worker ${process.pid} failed to connect to database:`,
        err
      );
      process.exit(1);
    });

  // Handle uncaught exceptions
  process.on("uncaughtException", (err) => {
    console.error(`Uncaught exception in worker ${process.pid}:`, err);
    process.exit(1);
  });
}



























































