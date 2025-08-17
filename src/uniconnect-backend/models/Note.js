// models/Note.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const noteSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true, // In a real app, this would be a URL to a file storage service
  },
  // This creates a link back to the user who uploaded the note
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User', // This refers to our 'User' model
    required: true,
  },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
