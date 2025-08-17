// models/Event.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  // We will store an array of URLs for the uploaded images/videos
  media: [{
    type: String,
  }],
  // This creates a link back to the user who created the event
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
