// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const dbURI = 'mongodb+srv://uniconnect139:GrYLlCTarx2ckVf3@cluster0.pjhmjuj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(dbURI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('Hello from the UniConnect Backend!');
});

// --- API Routes ---
// User Routes
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

// Note Routes
const noteRoutes = require('./routes/notes');
app.use('/api/notes', noteRoutes);

// Project Routes
const projectRoutes = require('./routes/projects');
app.use('/api/projects', projectRoutes);

// Message Routes
const messageRoutes = require('./routes/messages');
app.use('/api/messages', messageRoutes);

// Listing Routes
const listingRoutes = require('./routes/listings');
app.use('/api/listings', listingRoutes);

// Conversation Routes
const conversationRoutes = require('./routes/conversations');
app.use('/api/conversations', conversationRoutes);

// Event Routes
const eventRoutes = require('./routes/events');
app.use('/api/events', eventRoutes);

// Lost Item Routes
const lostItemRoutes = require('./routes/lostItems');
app.use('/api/lost-items', lostItemRoutes);

// --- THIS IS THE NEW PART FOR LOST & FOUND CHAT ---
// Lost Item Conversation Routes
const lostItemConversationRoutes = require('./routes/lostItemConversations');
app.use('/api/lost-item-conversations', lostItemConversationRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});