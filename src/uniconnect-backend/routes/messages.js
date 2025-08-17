// uniconnect-backend/routes/messages.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');

// @route   GET api/messages/:room
// @desc    Get all messages for a specific chat room
// @access  Private
router.get('/:room', auth, async (req, res) => {
  try {
    // Find all messages that match the room name from the URL (e.g., 'Public')
    // We also populate the user's fullName so we know who sent the message.
    const messages = await Message.find({ room: req.params.room })
      .populate('user', ['fullName'])
      .sort({ timestamp: 1 }); // Sort by oldest first

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   POST api/messages
// @desc    Post a new message to a chat room
// @access  Private
router.post('/', auth, async (req, res) => {
  const { text, room } = req.body;

  if (!text || !room) {
    return res.status(400).json({ msg: 'Message text and room are required.' });
  }

  try {
    const newMessage = new Message({
      text,
      room,
      user: req.user.id // Get the user's ID from the auth token
    });

    const message = await newMessage.save();
    
    // We need to populate the user's name before sending it back
    const populatedMessage = await Message.findById(message._id).populate('user', ['fullName']);

    res.json(populatedMessage);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;