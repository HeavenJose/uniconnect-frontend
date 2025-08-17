// uniconnect-backend/routes/conversations.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Listing = require('../models/Listing');

// @route   POST /api/conversations
// @desc    Start a conversation or send a message (NOW WITH 2-WAY NOTIFICATIONS)
// @access  Private
router.post('/', auth, async (req, res) => {
    const { listingId, text } = req.body;
    const senderId = req.user.id;

    try {
        const listing = await Listing.findById(listingId);
        if (!listing) return res.status(404).json({ msg: 'Listing not found.' });

        const sellerId = listing.user;
        
        // --- THIS IS THE UPGRADED LOGIC ---
        // Determine who the receiver is.
        // If the sender is the seller, the receiver is the buyer, and vice-versa.
        let receiverId;
        const conversationForParticipants = await Conversation.findOne({ listing: listingId });
        if (sellerId.toString() === senderId) {
            // If the seller is sending, the receiver must be the other participant
            receiverId = conversationForParticipants.participants.find(p => p.toString() !== senderId);
        } else {
            // If the buyer is sending, the receiver is the seller
            receiverId = sellerId;
        }

        // Find an existing conversation or create a new one
        let conversation = await Conversation.findOne({
            listing: listingId,
            participants: { $all: [sellerId, senderId] }
        });

        if (!conversation) {
            conversation = new Conversation({
                listing: listingId,
                participants: [sellerId, senderId],
                messages: []
            });
        }

        // Add the new message
        const newMessage = { sender: senderId, text: text };
        conversation.messages.push(newMessage);
        
        // Set the notification for the receiver and update the timestamp
        conversation.unreadBy = receiverId;
        conversation.lastMessageAt = Date.now();
        
        await conversation.save();
        
        const populatedConversation = await Conversation.findById(conversation._id)
            .populate('participants', ['fullName'])
            .populate('messages.sender', ['fullName']);

        res.json(populatedConversation);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   GET /api/conversations/listing/:listingId
// @desc    Get a conversation for a specific listing
router.get('/listing/:listingId', auth, async (req, res) => {
    try {
        const conversation = await Conversation.findOne({
            listing: req.params.listingId,
            participants: req.user.id
        })
        .populate('participants', ['fullName'])
        .populate('messages.sender', ['fullName']);

        if (!conversation) return res.json(null); // Return null if no conversation exists yet
        res.json(conversation);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});


// --- ROUTE TO FETCH ALL NOTIFICATIONS FOR A USER ---
router.get('/notifications', auth, async (req, res) => {
    try {
        const notifications = await Conversation.find({ unreadBy: req.user.id })
            .populate('listing', ['title'])
            .sort({ lastMessageAt: -1 });
        res.json(notifications);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// --- ROUTE TO MARK A CONVERSATION AS READ ---
router.put('/read/:conversationId', auth, async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.conversationId);
        if (!conversation) return res.status(404).json({ msg: 'Conversation not found.' });

        if (conversation.unreadBy && conversation.unreadBy.toString() === req.user.id) {
            conversation.unreadBy = null;
            await conversation.save();
        }
        res.json({ msg: 'Conversation marked as read.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});


module.exports = router;
