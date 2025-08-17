// uniconnect-backend/routes/lostItems.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const LostItem = require('../models/LostItem');

// @route   GET api/lost-items
// @desc    Get all unresolved lost and found items
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Find all items that are not yet resolved
    const items = await LostItem.find({ isResolved: false })
      .populate('user', ['fullName']) // Get the poster's name
      .sort({ createdAt: -1 }); // Show the newest items first
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   POST api/lost-items
// @desc    Post a new lost or found item
// @access  Private
router.post('/', auth, async (req, res) => {
  const { status, itemName, description, location, imageUrl } = req.body;

  if (!status || !itemName || !description || !location) {
    return res.status(400).json({ msg: 'Please fill out all required fields.' });
  }

  try {
    const newItem = new LostItem({
      status,
      itemName,
      description,
      location,
      imageUrl,
      user: req.user.id // Get the user's ID from the auth token
    });

    const item = await newItem.save();
    
    // Populate the user's name before sending the new item back
    const populatedItem = await LostItem.findById(item._id).populate('user', ['fullName']);

    res.json(populatedItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// We will add a route to mark an item as "resolved" later

module.exports = router;