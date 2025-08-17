// uniconnect-backend/models/Project.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// First, we define the structure for a single review
const ReviewSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Now, we define the main Project structure
const ProjectSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  department: { type: String, required: true },
  photos: [{ type: String }],
  videos: [{ type: String }],
  pdf: { type: String },
  // --- THIS IS THE UPGRADE ---
  // We add an array that will hold all the reviews
  reviews: [ReviewSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', ProjectSchema);