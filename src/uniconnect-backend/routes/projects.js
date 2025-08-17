// uniconnect-backend/routes/projects.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');

// GET ALL PROJECTS (Now includes reviews)
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('user', ['fullName', '_id'])
      .populate('reviews.user', ['fullName', '_id']) // Also get names of reviewers
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error('SERVER ERROR - GET /api/projects:', err.message);
    res.status(500).json({ msg: 'Server error while fetching projects.' });
  }
});

// CREATE A NEW PROJECT (No changes to this part)
router.post('/', auth, async (req, res) => {
  const { title, description, department, photos, videos, pdf } = req.body;
  if (!title || !description) {
    return res.status(400).json({ msg: 'Title and description are required.' });
  }
  try {
    const newProject = new Project({ title, description, department, photos, videos, pdf, user: req.user.id });
    const project = await newProject.save();
    res.json(project);
  } catch (err) {
    console.error('SERVER ERROR - POST /api/projects:', err.message);
    res.status(500).json({ msg: 'Server error while creating project.' });
  }
});

// --- THIS IS THE NEW ROUTE FOR ADDING A REVIEW ---
router.post('/review/:id', auth, async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ msg: 'Review text is required.' });
    }
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ msg: 'Project not found.' });
        }
        // Prevent users from reviewing their own project
        if (project.user.toString() === req.user.id) {
            return res.status(400).json({ msg: 'You cannot review your own project.' });
        }
        const newReview = {
            text: text,
            user: req.user.id
        };
        project.reviews.unshift(newReview); // Add the new review to the top of the list
        await project.save();
        
        // Send back the newly updated project with all reviews populated
        const updatedProject = await Project.findById(req.params.id)
            .populate('user', ['fullName', '_id'])
            .populate('reviews.user', ['fullName', '_id']);

        res.json(updatedProject);
    } catch (err) {
        console.error('SERVER ERROR - POST /api/projects/review:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;