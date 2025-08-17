// uniconnect-backend/routes/listings.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Listing = require('../models/Listing');

// @route   GET api/listings
// @desc    Get all listings
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Find all listings, populate the seller's name, and sort by newest first
    const listings = await Listing.find()
      .populate('user', ['fullName'])
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   POST api/listings
// @desc    Post a new item for sale
// @access  Private
router.post('/', auth, async (req, res) => {
  const { title, description, price, imageUrls, isNegotiable } = req.body;

  if (!title || !description || !price) {
    return res.status(400).json({ msg: 'Title, description, and price are required.' });
  }

  try {
    const newListing = new Listing({
      title,
      description,
      price,
      imageUrls,
      isNegotiable,
      user: req.user.id // Get the seller's ID from the auth token
    });

    const listing = await newListing.save();
    
    // Populate the user's name before sending it back
    const populatedListing = await Listing.findById(listing._id).populate('user', ['fullName']);

    res.json(populatedListing);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;