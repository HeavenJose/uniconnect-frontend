// routes/notes.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // We'll use our auth middleware to protect these routes

// Import the Note and User models
const Note = require('../models/Note');
const User = require('../models/User');

// --- ROUTE TO GET ALL NOTES ---
// @route   GET api/notes
// @desc    Get all notes for all users
// @access  Private (requires token)
router.get('/', auth, async (req, res) => {
  try {
    // Find all notes and sort them by the most recent ones first
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- ROUTE TO CREATE A NEW NOTE ---
// @route   POST api/notes
// @desc    Create a new note
// @access  Private (requires token)
router.post('/', auth, async (req, res) => {
  // Get the data from the request body (sent from the React form)
  const { title, department, fileUrl } = req.body;

  try {
    // The user's ID is available in req.user.id because of our auth middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Create a new instance of the Note model
    const newNote = new Note({
      title,
      department,
      fileUrl, // In a real app, you'd get this from a file upload service
      user: req.user.id, // Link the note to the logged-in user
    });

    // Save the new note to the database
    const note = await newNote.save();

    // Send the newly created note back as a response
    res.json(note);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
