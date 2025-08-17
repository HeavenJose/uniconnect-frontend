// uniconnect-backend/models/Message.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  // Link the message to the user who sent it
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // The content of the message
  text: {
    type: String,
    required: true
  },
  // This will be either 'Public' or the name of a department
  room: {
    type: String,
    required: true
  },
  // The time the message was sent
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', MessageSchema);