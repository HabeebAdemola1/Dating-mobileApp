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


// Get user's groups and join requests
groupRoute.get('/groups', verifyToken, async (req, res) => {
  try {
    const groups = await Group.find({
      $or: [{ members: req.user._id }, { 'joinRequests.user': req.user._id }],
    }).populate('members admins joinRequests.user', 'fullname _id');
    res.json({ status: true, groups });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Failed to fetch groups' });
  }
});

// Get group messages
groupRoute.get('/group-messages/:uniqueNumber', verifyToken, async (req, res) => {
  try {
    const group = await Group.findOne({ uniqueNumber: req.params.uniqueNumber }).populate('messages.sender', 'fullname');
    if (!group) return res.status(404).json({ status: false, message: 'Group not found' });
    if (!group.members.includes(req.user._id) && !group.joinRequests.some((req) => req.user.toString() === req.user._id.toString())) {
      return res.status(403).json({ status: false, message: 'Not authorized' });
    }
    res.json({ status: true, messages: group.messages });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Failed to fetch messages' });
  }
});


// Search users for adding to group
groupRoute.get('/search-users', verifyToken, async (req, res) => {
  const { query } = req.query;
  try {
    const users = await User.find({
      fullname: { $regex: query, $options: 'i' },
      _id: { $ne: req.user._id },
    }).select('fullname _id').limit(10);
    res.json({ status: true, users });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Failed to search users' });
  }
});




// Search groups for joining
groupRoute.get('/search-groups', verifyToken, async (req, res) => {
  const { query } = req.query;
  try {
    const groups = await Group.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { uniqueNumber: { $regex: query, $options: 'i' } },
      ],
      members: { $ne: req.user._id }, // Exclude groups user is already in
    }).select('name uniqueNumber type').limit(10);
    res.json({ status: true, groups });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Failed to search groups' });
  }
});


groupRoute.post('/join-group', verifyToken, async (req, res) => {
  const { uniqueNumber } = req.body;
  try {
    const group = await Group.findOne({ uniqueNumber });
    if (!group) return res.status(404).json({ status: false, message: 'Group not found' });
    if (group.members.includes(req.user._id)) {
      return res.status(400).json({ status: false, message: 'Already a member' });
    }
    if (group.joinRequests.some((req) => req.user.toString() === req.user._id.toString() && req.status === 'pending')) {
      return res.status(400).json({ status: false, message: 'Join request already pending' });
    }
    group.joinRequests.push({ user: req.user._id, status: 'pending' });
    await group.save();
    res.json({ status: true, message: 'Join request sent' });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Failed to send join request' });
  }
});

// Handle join request
groupRoute.post('/handle-join-request', verifyToken, async (req, res) => {
  const { uniqueNumber, userId, action } = req.body;
  try {
    const group = await Group.findOne({ uniqueNumber });
    if (!group) return res.status(404).json({ status: false, message: 'Group not found' });
    if (!group.admins.includes(req.user._id)) {
      return res.status(403).json({ status: false, message: 'Not an admin' });
    }
    const joinRequest = group.joinRequests.find((req) => req.user.toString() === userId);
    if (!joinRequest) return res.status(404).json({ status: false, message: 'Join request not found' });
    joinRequest.status = action;
    if (action === 'accepted') {
      group.members.push(userId);
    }
    await group.save();
    res.json({ status: true, message: `Join request ${action}` });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Failed to handle join request' });
  }
});



// Rename group
groupRoute.put('/rename-group', verifyToken, async (req, res) => {
  const { uniqueNumber, newName } = req.body;
  try {
    const group = await Group.findOne({ uniqueNumber });
    if (!group) return res.status(404).json({ status: false, message: 'Group not found' });
    if (!group.admins.includes(req.user._id)) {
      return res.status(403).json({ status: false, message: 'Not an admin' });
    }
    group.name = newName;
    await group.save();
    res.json({ status: true, message: 'Group renamed successfully' });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Failed to rename group' });
  }
});

// Delete group
groupRoute.delete('/delete-group', verifyToken, async (req, res) => {
  const { uniqueNumber } = req.body;
  try {
    const group = await Group.findOne({ uniqueNumber });
    if (!group) return res.status(404).json({ status: false, message: 'Group not found' });
    if (!group.admins.includes(req.user._id)) {
      return res.status(403).json({ status: false, message: 'Not an admin' });
    }
    await Group.deleteOne({ uniqueNumber });
    res.json({ status: true, message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Failed to delete group' });
  }
});

// Leave group
groupRoute.post('/leave-group', verifyToken, async (req, res) => {
  const { uniqueNumber } = req.body;
  try {
    const group = await Group.findOne({ uniqueNumber });
    if (!group) return res.status(404).json({ status: false, message: 'Group not found' });
    if (!group.members.includes(req.user._id)) {
      return res.status(400).json({ status: false, message: 'Not a member' });
    }
    if (group.admins.includes(req.user._id) && group.admins.length === 1) {
      return res.status(400).json({ status: false, message: 'Sole admin cannot leave; delete group or add another admin' });
    }
    group.members = group.members.filter((id) => id.toString() !== req.user._id.toString());
    group.admins = group.admins.filter((id) => id.toString() !== req.user._id.toString());
    group.joinRequests = group.joinRequests.filter((req) => req.user.toString() !== req.user._id.toString());
    await group.save();
    res.json({ status: true, message: 'Left group successfully' });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Failed to leave group' });
  }
});


export default groupRoute


























