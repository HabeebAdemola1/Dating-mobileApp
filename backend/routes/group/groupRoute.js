import express from "express"
import Group from "../../models/group/groupSchema.js"
import User from "../../models/user/auth.Schema.js"
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken } from "../../middlewares/verifyToken.js";
const groupRoute = express.Router()


groupRoute.post('/create', async(req, res) => {
     const { name, type, userId } = req.body;
      try {
        const uniqueNumber = uuidv4().slice(0, 8);
        const group = new Group({
          name,
          uniqueNumber,
          type,
          admins: [userId],
          members: [userId],
        });
        await group.save();
        res.status(201).json(group);
      } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to create group' });
      }
})

groupRoute.post('/search', async(req, res) => {
    const { query } = req.query;
     try {
       const groups = await Group.find({
         $or: [
           { name: { $regex: query, $options: 'i' } },
           { uniqueNumber: { $regex: query, $options: 'i' } },
         ],
       });
       res.json(groups);
     } catch (error) {
       res.status(500).json({ error: 'Failed to search groups' });
     }
})

groupRoute.get("/user", verifyToken, async (req, res) => {
  try {
    const groups = await Group.find({
      $or: [{ admins: req.userId }, { members: req.userId }],
    }).sort({ createdAt: -1 }); 
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user groups" });
  }
});

export default groupRoute