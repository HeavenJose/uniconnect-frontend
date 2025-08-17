// uniconnect-backend/models/Listing.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ListingSchema = new Schema({
  // Link the listing to the user who is the seller
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: String, // Storing as a string to allow for "₹500", etc.
    required: true
  },
  // We will store URLs to the uploaded images
  imageUrls: [{
    type: String
  }],
  isNegotiable: {
    type: Boolean,
    default: false
  },
  // We can add a category later if needed
  // category: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Listing', ListingSchema);