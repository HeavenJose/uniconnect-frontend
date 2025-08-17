// routes/users.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// --- REGISTRATION ROUTE --- (No changes)
router.post('/register', async (req, res) => {
  const { fullName, email, password, department } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    user = new User({ fullName, email, password, department });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    res.status(201).json({ msg: 'User registered successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// --- LOGIN ROUTE --- (No changes)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const payload = { user: { id: user.id } };
    jwt.sign(payload, 'YOUR_JWT_SECRET', { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// --- GET USER DATA ROUTE --- (No changes)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// --- NEW: ROUTE TO UPDATE USER PROFILE ---
// This route allows a logged-in user to update their bio and profile picture.
router.put('/me', auth, async (req, res) => {
    // Get the new bio and profile picture URL from the request
    const { bio, profilePictureUrl } = req.body;

    try {
        // Find the user in the database
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Update the user's data
        user.bio = bio || user.bio; // Keep old bio if new one isn't provided
        user.profilePictureUrl = profilePictureUrl || user.profilePictureUrl;

        // Save the changes
        await user.save();

        // Send back the updated user profile
        res.json(user);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;