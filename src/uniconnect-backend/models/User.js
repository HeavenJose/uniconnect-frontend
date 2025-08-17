
// models/User.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// --- User Schema Definition ---
// This is the blueprint for our user data.
const userSchema = new Schema({
  fullName: {
    type: String,
    required: true, // A full name is mandatory
  },
  email: {
    type: String,
    required: true, // An email is mandatory
    unique: true,   // Every email in the database must be unique
  },
  password: {
    type: String,
    required: true, // A password is mandatory
  },
  department: {
    type: String,
    required: true, // A department is mandatory
  },
  profilePicture: {
    type: String,
    default: '', // The URL to the profile picture, empty by default
  },
  bio: {
    type: String,
    default: '', // A short user bio, empty by default
  },
}, {
  // Automatically add 'createdAt' and 'updatedAt' fields
  timestamps: true,
});

// --- Create and Export the Model ---
// Mongoose will create a collection named 'users' in MongoDB based on this schema.
const User = mongoose.model('User', userSchema);

module.exports = User;
