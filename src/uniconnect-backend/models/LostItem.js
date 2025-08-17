// uniconnect-backend/models/LostItem.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LostItemSchema = new Schema({
  // Link the post to the user who created it
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // This will be either 'Lost' or 'Found'
  status: {
    type: String,
    enum: ['Lost', 'Found'],
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  // We will store the URL to the uploaded image
  imageUrl: {
    type: String,
    default: ''
  },
  // A flag to hide the item once it's returned
  isResolved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LostItem', LostItemSchema);