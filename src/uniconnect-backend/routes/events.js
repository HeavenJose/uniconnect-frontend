// routes/events.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Use auth middleware to protect routes

// Import the Event and User models
const Event = require('../models/Event');
const User = require('../models/User');

// --- ROUTE TO GET ALL EVENTS ---
// @route   GET api/events
// @desc    Get all events
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Find all events and sort them by the most recent
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- ROUTE TO CREATE A NEW EVENT ---
// @route   POST api/events
// @desc    Create a new event
// @access  Private
router.post('/', auth, async (req, res) => {
  const { title, description, date, location, media } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const newEvent = new Event({
      title,
      description,
      date,
      location,
      media, // These will be URLs from your file upload service
      user: req.user.id,
    });

    const event = await newEvent.save();
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
